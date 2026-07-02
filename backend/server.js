require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Added Cloudinary SDK
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Added Cloudinary Storage Engine

const User = require('./models/User');
const Listing = require('./models/Listing');
const Message = require('./models/Message');
const auth = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lnmarket')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- NEW: CLOUDINARY CONFIGURATION & LINKAGE ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to upload straight to the cloud asset pipelines
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lnmarket_listings', // Automatically sets up this asset folder inside your Cloudinary profile
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }] // Compresses images to load quickly on campus networks
  }
});

const upload = multer({ storage: storage });

// --- NODEMAILER DIRECT GMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailRegex = /^[\w-\.]+@lnmiit\.ac\.in$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Registration restricted to @lnmiit.ac.in emails.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ name, email, password: hashedPassword, verificationToken });
    await user.save();

    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const verificationLink = `${baseUrl}/api/auth/verify/${verificationToken}`;

    const mailOptions = {
      from: `"LNMarket Admin" <${process.env.EMAIL_USER}>`, 
      to: email, 
      replyTo: process.env.ADMIN_EMAIL, 
      subject: 'Verify your LNMarket Account',
      html: `
        <div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #06b6d4; text-align: center;">Welcome to LNMarket, ${name}!</h2>
          <p style="color: #334155; line-height: 1.6;">Thank you for joining the campus marketplace. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center;">If you have any issues, contact us at ${process.env.ADMIN_EMAIL}.</p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Registration successful! Verification email sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send('<h1>Invalid or expired verification link.</h1>');

    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();
    res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
        <h1 style="color: #06b6d4;">Email Verified Successfully!</h1>
        <p>Your LNMarket account is now active.</p>
        <a href="http://localhost:5173" style="padding: 10px 20px; background: #a855f7; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Login</a>
      </div>
    `);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- LISTING ROUTES ---
app.get('/api/listings', auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;

    const listings = await Listing.find(query).populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLOUDINARY BULK UPLOAD DISPATCHER ROUTE ---
app.post('/api/listings', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least 1 image for your listing.' });
    }

    // When utilizing CloudinaryStorage, the secure cloud web asset URL arrives inside 'file.path'
    const imageUrls = req.files.map(file => file.path);

    const listing = new Listing({
      title,
      description,
      price,
      category,
      images: imageUrls, 
      imageUrl: imageUrls[0], // Main card thumbnail compatibility fallback link
      seller: req.user.id
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UPDATED DELETION ROUTE: Clears Listing AND all cascade chat records ---
app.delete('/api/listings/:id', auth, async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized.' });

    // 1. 🧹 CASCADE CLEANUP: Remove all messages where the room string starts with this listingId
    const messageCleanup = await Message.deleteMany({ room: { $regex: `^${listingId}_` } });
    console.log(`Cascade cleanup complete: Removed ${messageCleanup.deletedCount} orphaned messages.`);

    // 2. Remove the actual listing document from the collection (Fixed syntax: called on model)
    await Listing.findByIdAndDelete(listingId);
    
    res.json({ message: 'Listing and associated chat telemetry removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHAT ENGINE ROUTES ---

// 1. NEW: FETCH USER'S ACTIVE CHAT THREADS LIST (INBOX)
app.get('/api/messages/inbox', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const allMessages = await Message.find().sort({ createdAt: -1 });

    const uniqueRooms = [];
    const seenRooms = new Set();

    for (let msg of allMessages) {
      if (!seenRooms.has(msg.room)) {
        const [listingId, buyerId] = msg.room.split('_');
        const isBuyer = buyerId === userId;

        const listing = await Listing.findById(listingId).populate('seller', 'name email');
        
        if (listing) {
          const isSeller = listing.seller._id.toString() === userId;

          if (isBuyer || isSeller) {
            seenRooms.add(msg.room);

            // If the current user is the buyer, the other person is the seller (and vice versa)
            const chatPartnerRole = isBuyer ? 'seller' : 'buyer';
            
            // Unread calculation: If the last message was NOT sent by me, it's unread
            const isUnread = msg.sender.toString() !== userId;

            uniqueRooms.push({
              room: msg.room,
              listing,
              lastMessage: msg.text,
              updatedAt: msg.createdAt,
              role: chatPartnerRole,
              isUnread
            });
          }
        }
      }
    }
    res.json(uniqueRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. FETCH HISTORICAL CONVERSATIONS FOR A SELECTED SPECIFIC ROOM
app.get('/api/messages/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCKET.IO CHAT ENGINE ---
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ room }) => { socket.join(room); });
  socket.on('sendMessage', async (data) => {
    try {
      const { room, sender, text } = data;
      const message = new Message({ room, sender, text });
      await message.save();
      io.to(room).emit('receiveMessage', message);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
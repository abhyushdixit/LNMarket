const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[\w-\.]+@lnmiit\.ac\.in$/, 'Only LNMIIT institutional emails are allowed.']
  },
  password: { type: String, required: true },
  // NEW FEILDS FOR EMAIL VERIFICATION
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
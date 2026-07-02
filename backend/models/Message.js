const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // Format: listingId_buyerId
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
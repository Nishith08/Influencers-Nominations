const mongoose = require('mongoose');

const inviteTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Optional: Expire after 7 days
});

module.exports = mongoose.model('InviteToken', inviteTokenSchema);
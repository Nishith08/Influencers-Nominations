const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const influencerSchema = new mongoose.Schema({
  // Personal Details
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  
  // Social Links
  instagram: { type: String, required: true },
  profilePic: { type: String, required: true },
  youtube: { type: String }, // Optional
  otherLinks: { type: String }, // Optional

  // Auth & Status
  password: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  role: { type: String, default: 'influencer' }, // 'influencer' or 'admin'

  // Tree / Referral Logic
  referralToken: { type: String, unique: true, sparse: true }, // Generated only when Accepted
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer', default: null }, // The parent
  referralCount: { type: Number, default: 0 } // Max 2
});

// Hash password before saving
// Hash password before saving
influencerSchema.pre('save', async function() {  // <--- REMOVED 'next' HERE
  if (!this.isModified('password')) return;      // <--- REMOVED 'next()' HERE
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Influencer', influencerSchema);
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  age: Number,
  gender: String
});

const bookingSchema = new mongoose.Schema({
  members: [memberSchema],
  totalAmount: Number,
  razorpayOrderId: String,
  paymentStatus: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
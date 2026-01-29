const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { sendConfirmationEmail } = require('../utils/emailService');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
router.post('/create-order', async (req, res) => {
  try {
    const { members } = req.body;
    const amount = members.length * 1 * 100; // 500 INR per person (in paisa)

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // Save to DB as Pending
    const newBooking = new Booking({
      members,
      totalAmount: amount / 100,
      razorpayOrderId: order.id,
    });
    await newBooking.save();

    res.json({ orderId: order.id, amount: amount, bookingId: newBooking._id });
  } catch (error) {
    res.status(500).send(error);
  }
});

// 2. Verify Payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
        // 1. Update Booking to "Paid"
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { 
                paymentStatus: 'Paid',
                razorpayPaymentId: razorpay_payment_id
            },
            { new: true } // Return the updated document
        );

        // 2. Send PDF Email (Don't wait for it to finish to speed up UI response)
        sendConfirmationEmail(updatedBooking).catch(err => console.log("Email failed:", err));

        res.json({ status: 'success' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database update failed' });
    }
  } else {
    res.status(400).json({ status: 'failure' });
  }
});

module.exports = router;
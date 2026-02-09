require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/payment');

const app = express();

app.use(express.json());
app.use(cors());

// Connect Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  // --- API ROUTES (Keep these BEFORE the frontend code) ---
app.use('/uploads', express.static('uploads'));
app.use('/api', paymentRoutes);
app.use('/api/influencer', require('./routes/influencerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- SERVE FRONTEND (ADD THIS SECTION) ---
// 1. Tell Express to serve the static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Catch-all route: If a request isn't an API call, send the React app
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
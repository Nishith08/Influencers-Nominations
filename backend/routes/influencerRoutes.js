const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. IMPORT THE MODEL (Crucial Step - likely missing or wrong path)
const Influencer = require('../models/Influencer');

// --- REGISTER ROUTE (With Debug Logs) ---
router.post('/register', async (req, res) => {
  console.log("1. Registration Request Received:", req.body);

  try {
    const { name, phone, email, age, gender, instagram, youtube, otherLinks, referralToken } = req.body;

    // A. Check if Influencer model is loaded
    if (!Influencer) {
        throw new Error("Influencer Model is not imported correctly!");
    }

    // B. Check if email exists
    const existing = await Influencer.findOne({ email });
    console.log("2. Email Check Complete. Exists?", !!existing);
    
    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }

    // C. Handle Referral Logic
    let parentId = null;
    // Only check referral if token is NOT null and NOT empty
    if (referralToken && referralToken !== "null") {
      console.log("3. Checking Referral Token:", referralToken);
      const parent = await Influencer.findOne({ referralToken });
      
      if (!parent) return res.status(400).json({ message: "Invalid Referral Link" });
      if (parent.referralCount >= 2) return res.status(400).json({ message: "This referral link has reached its limit (2/2)" });

      parentId = parent._id;
      parent.referralCount += 1;
      await parent.save();
    }

    // D. Generate Password
    const autoPassword = Math.random().toString(36).slice(-8);
    console.log("4. Password Generated:", autoPassword);

    // E. Create Influencer
    const newInfluencer = new Influencer({
      name, phone, email, age, gender, instagram, youtube, otherLinks,
      password: autoPassword,
      referredBy: parentId
    });

    console.log("5. Saving to Database...");
    await newInfluencer.save();
    console.log("6. SAVED SUCCESSFULLY!");

    res.json({ 
      message: "Registration Successful!", 
      generatedPassword: autoPassword 
    });

  } catch (error) {
    console.error("!!! CRASH ERROR !!!", error); // Check terminal for this
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Influencer.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate Token
    const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY_123");

    res.json({ token, user: { 
      id: user._id, name: user.name, status: user.status, referralToken: user.referralToken, role: user.role 
    }});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET TREE ROUTE ---
router.get('/my-tree', async (req, res) => {
  const token = req.headers.authorization;
  if(!token) return res.status(401).send("Unauthorized");
  
  try {
    const decoded = jwt.verify(token, "SECRET_KEY_123");
    const userId = decoded.id;

    const allInfluencers = await Influencer.find({ status: 'Accepted' }).select('name _id referredBy');

    const buildTree = (parentId) => {
      const children = allInfluencers.filter(inf => String(inf.referredBy) === String(parentId));
      if (children.length === 0) return null;
      return children.map(child => ({
        name: child.name,
        children: buildTree(child._id)
      }));
    };

    const tree = buildTree(userId);
    res.json(tree || []);

  } catch (error) {
    res.status(500).send(error.message);
  }
});
// --- 4. GET MY PROFILE (New Route) ---
router.get('/me', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY_123"); // Ensure key matches your login route
    const user = await Influencer.findById(decoded.id).select('-password'); // Don't send password
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

module.exports = router;
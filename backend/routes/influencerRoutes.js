const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. IMPORT THE MODEL (Crucial Step - likely missing or wrong path)
const Influencer = require('../models/Influencer');
const InviteToken = require('../models/InviteToken');

// --- REGISTER ROUTE (With Debug Logs) ---
router.post('/register', async (req, res) => {
 try {
    const { 
      name, phone, email, age, gender, instagram, youtube, otherLinks, 
      inviteToken,   // MODE A: From Admin Link (One-time)
      referralToken  // MODE B: From Sub-Influencer Link (Max 2)
    } = req.body;

    let parentId = null;
    let validInviteDoc = null; // To track if we need to mark an invite as used

    // --- LOGIC BRANCHING ---

    // SCENARIO A: Registration via ADMIN INVITE (One-Time)
    if (inviteToken) {
        validInviteDoc = await InviteToken.findOne({ token: inviteToken });
        
        if (!validInviteDoc) {
            return res.status(400).json({ message: "Invalid Admin Invite Link." });
        }
        if (validInviteDoc.isUsed) {
            return res.status(400).json({ message: "This invite link has already been used." });
        }
    } 
    // SCENARIO B: Registration via PEER REFERRAL (Max 2)
    else if (referralToken) {
        const parent = await Influencer.findOne({ referralToken });
        
        if (!parent) {
            return res.status(400).json({ message: "Invalid Referral Link." });
        }
        if (parent.referralCount >= 2) {
            return res.status(400).json({ message: "This referrer has reached their limit (2/2)." });
        }
        
        parentId = parent._id; // Set the parent for the tree
    } 
    // SCENARIO C: No Token Provided
    else {
        return res.status(400).json({ message: "Registration requires a valid Invite or Referral link." });
    }

    // --- COMMON REGISTRATION LOGIC ---
    
    // 1. Check if email exists
    const existing = await Influencer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // 2. Create User
    const autoPassword = Math.random().toString(36).slice(-8);
    const newInfluencer = new Influencer({
      name, phone, email, age, gender, instagram, youtube, otherLinks,
      password: autoPassword,
      referredBy: parentId // Will be null for Admin Invites, ID for Referrals
    });

    await newInfluencer.save();

    // --- POST-SAVE UPDATES ---

    // If it was an Admin Invite, mark it as used
    if (validInviteDoc) {
        validInviteDoc.isUsed = true;
        await validInviteDoc.save();
    }

    // If it was a Referral, increment the parent's count
    if (parentId) {
        await Influencer.findByIdAndUpdate(parentId, { $inc: { referralCount: 1 } });
    }

    res.json({ message: "Registration Successful!", generatedPassword: autoPassword });

  } catch (error) {
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
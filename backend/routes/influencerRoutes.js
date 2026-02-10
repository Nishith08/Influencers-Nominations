const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- 1. CRITICAL MISSING IMPORT

// Import Models
const Influencer = require('../models/Influencer');
const InviteToken = require('../models/InviteToken');

// --- MULTER CONFIGURATION (Safe Mode) ---
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = 'uploads/';
    
//     // 2. CRITICAL SAFETY CHECK: Create folder if it doesn't exist
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir, { recursive: true });
//     }
    
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     // Saves file as: timestamp + original extension (e.g., 17099988-profile.jpg)
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// --- MULTER CONFIGURATION (Safe Mode + File Filter) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Define the Filter Logic
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    // Reject file
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false);
  }
};

// Add limits (optional but recommended) to prevent massive files
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});

// --- REGISTER ROUTE ---
router.post('/register', upload.single('profilePic'), async (req, res) => {
  try {
    // 3. VALIDATE FILE UPLOAD
    if (!req.file) {
        return res.status(400).json({ message: "Profile Picture is required." });
    }

    const { 
      name, phone, email, age, gender, instagram, youtube, otherLinks, 
      inviteToken,   // MODE A
      referralToken  // MODE B
    } = req.body;

    let parentId = null;
    let validInviteDoc = null; 

    // --- LOGIC BRANCHING ---

    // SCENARIO A: Registration via ADMIN INVITE
    if (inviteToken && inviteToken !== 'null') {
        validInviteDoc = await InviteToken.findOne({ token: inviteToken });
        
        if (!validInviteDoc) {
            return res.status(400).json({ message: "Invalid Admin Invite Link." });
        }
        if (validInviteDoc.isUsed) {
            return res.status(400).json({ message: "This invite link has already been used." });
        }
    } 
    // SCENARIO B: Registration via PEER REFERRAL
    else if (referralToken && referralToken !== 'null') {
        const parent = await Influencer.findOne({ referralToken });
        
        if (!parent) {
            return res.status(400).json({ message: "Invalid Referral Link." });
        }
        if (parent.referralCount >= 2) {
            return res.status(400).json({ message: "This referrer has reached their limit (2/2)." });
        }
        
        parentId = parent._id; 
    } 
    // SCENARIO C: No Token Provided
    else {
        return res.status(400).json({ message: "Registration requires a valid Invite or Referral link." });
    }

    // --- COMMON REGISTRATION LOGIC ---
    
    const existing = await Influencer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const autoPassword = Math.random().toString(36).slice(-8);
    
    const newInfluencer = new Influencer({
      name, phone, email, age, gender, instagram, youtube, otherLinks,
      password: autoPassword,
      referredBy: parentId,     
      profilePic: req.file.filename // <--- SAVE FILENAME
    });

    await newInfluencer.save();

    // --- POST-SAVE UPDATES ---

    if (validInviteDoc) {
        validInviteDoc.isUsed = true;
        await validInviteDoc.save();
    }

    if (parentId) {
        await Influencer.findByIdAndUpdate(parentId, { $inc: { referralCount: 1 } });
    }

    res.json({ message: "Registration Successful!", generatedPassword: autoPassword });

  } catch (error) {
    console.error("Register Error:", error); // Helpful for debugging
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Influencer.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY_123");

    // 4. UPDATE: Send profilePic so frontend can display it immediately
    res.json({ token, user: { 
      id: user._id, name: user.name, status: user.status, referralToken: user.referralToken, role: user.role,
      profilePic: user.profilePic 
    }});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // --- GET TREE ROUTE ---
// router.get('/my-tree', async (req, res) => {
//   const token = req.headers.authorization;
//   if(!token) return res.status(401).send("Unauthorized");
  
//   try {
//     const decoded = jwt.verify(token, "SECRET_KEY_123");
//     const userId = decoded.id;

//     const allInfluencers = await Influencer.find({ status: 'Accepted' }).select('name _id referredBy profilePic'); // Added profilePic here too just in case

//     const buildTree = (parentId) => {
//       const children = allInfluencers.filter(inf => String(inf.referredBy) === String(parentId));
//       if (children.length === 0) return null;
//       return children.map(child => ({
//         name: child.name,
//         profilePic: child.profilePic, // Pass it to the tree
//         children: buildTree(child._id)
//       }));
//     };

//     const tree = buildTree(userId);
//     res.json(tree || []);

//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// --- GET TREE ROUTE (Fixed: Always includes the User as Root) ---
router.get('/my-tree', async (req, res) => {
  const token = req.headers.authorization;
  if(!token) return res.status(401).send("Unauthorized");
  
  try {
    const decoded = jwt.verify(token, "SECRET_KEY_123");
    const userId = decoded.id;

    // 1. Fetch CURRENT USER with profilePic
    const currentUser = await Influencer.findById(userId).select('name _id role profilePic');

    // 2. Fetch ALL ACCEPTED influencers with profilePic
    const allInfluencers = await Influencer.find({ status: 'Accepted' })
        .select('name _id referredBy profilePic role'); // <--- ADDED profilePic

    // 3. Recursive Builder
    const buildTree = (parentId) => {
      const children = allInfluencers.filter(inf => String(inf.referredBy) === String(parentId));
      
      if (children.length === 0) return [];
      
      return children.map(child => ({
        name: child.name,
        role: child.role || 'Member',
        profilePic: child.profilePic, // <--- Pass it here
        _id: child._id,
        children: buildTree(child._id)
      }));
    };

    // 4. Build Tree
    const childrenNodes = buildTree(userId);

    // 5. Construct Final Tree (Root + Children)
    const myTree = [{
        name: currentUser.name,
        role: "Me",
        profilePic: currentUser.profilePic, // <--- Ensure Root has it
        _id: currentUser._id,
        children: childrenNodes
    }];

    res.json(myTree);

  } catch (error) {
    res.status(500).send(error.message);
  }
});

// --- GET MY PROFILE (For Dashboard) ---
router.get('/me', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY_123");
    const user = await Influencer.findById(decoded.id).select('-password'); 
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

module.exports = router;
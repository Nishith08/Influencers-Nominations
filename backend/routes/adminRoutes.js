const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Influencer = require('../models/Influencer');
const InviteToken = require('../models/InviteToken'); // Import new model
const { linkSync } = require('fs');
// 1. Get All Influencers
router.get('/influencers', async (req, res) => {
  try {
    const influencers = await Influencer.find({ role: 'influencer' }).populate('referredBy', 'name');
    res.json(influencers);
  } catch (err) { res.status(500).send(err.message); }
});

// 2. Approve/Reject
router.put('/influencers/:id/status', async (req, res) => {
  const { status } = req.body; // 'Accepted' or 'Rejected'
  
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) return res.status(404).send("Not found");

    influencer.status = status;

    // If Accepted, generate their unique Referral Token
    if (status === 'Accepted' && !influencer.referralToken) {
      influencer.referralToken = crypto.randomBytes(4).toString('hex'); // e.g., "a1b2c3d4"
    }

    await influencer.save();
    res.json(influencer);
  } catch (err) { res.status(500).send(err.message); }
});

// 3. Get Full Network Tree (For Admin)
router.get('/full-tree', async (req, res) => {
  try {
    // Fetch only Accepted influencers
    const allInfluencers = await Influencer.find({ status: 'Accepted' }).select('name _id referredBy');

    // Recursive Build Function
    const buildTree = (parentId) => {
      const children = allInfluencers.filter(inf => String(inf.referredBy) === String(parentId));
      if (children.length === 0) return null;
      
      return children.map(child => ({
        name: child.name,
        children: buildTree(child._id)
      }));
    };

    // Find "Roots" (Influencers who have NO parent, or their parent is not in the list)
    // In a perfect system, referredBy is null. But sometimes parent is rejected/deleted.
    const roots = allInfluencers.filter(inf => 
        !inf.referredBy || !allInfluencers.find(p => String(p._id) === String(inf.referredBy))
    );

    const fullTree = roots.map(root => ({
        name: root.name,
        children: buildTree(root._id)
    }));

    res.json(fullTree);
  } catch (err) { res.status(500).send(err.message); }
});

// 4. Generate One-Time Invite Link
router.post('/generate-invite', async (req, res) => {
  try {
    // Generate a random unique string
    const token = crypto.randomBytes(16).toString('hex');

    // Save to DB
    const newInvite = new InviteToken({ token });
    await newInvite.save();
const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Send back the full link (adjust localhost port if needed)
    const link = `${baseUrl}/influencers/register/${token}`;
    //console.log("Generated Invite Link:", link);
    res.json({ link, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
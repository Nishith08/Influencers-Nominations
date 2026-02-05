const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Influencer = require('../models/Influencer');

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

module.exports = router;
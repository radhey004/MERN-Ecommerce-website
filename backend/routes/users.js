const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to get user with populated fields
const getUserWithPopulatedFields = async (userId) => {
  return await User.findById(userId)
    .populate('wishlist')
    .populate({
      path: 'orders',
      options: { sort: { createdAt: -1 } }
    });
};

// Add to wishlist
router.post('/wishlist/add/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!req.user.wishlist.includes(productId)) {
      req.user.wishlist.push(productId);
      await req.user.save();
    }
    
    // Get updated user with populated wishlist
    const updatedUser = await getUserWithPopulatedFields(req.user._id);
    
    res.json({ 
      success: true,
      message: 'Item added to wishlist',
      user: updatedUser // Return the updated user with populated data
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Remove from wishlist
router.delete('/wishlist/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    req.user.wishlist = req.user.wishlist.filter(id => id.toString() !== productId);
    await req.user.save();
    
    // Get updated user with populated wishlist
    const updatedUser = await getUserWithPopulatedFields(req.user._id);
    
    res.json({ 
      success: true,
      message: 'Item removed from wishlist',
      user: updatedUser // Return the updated user with populated data
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Clear entire wishlist
router.delete('/wishlist/clear', auth, async (req, res) => {
  try {
    req.user.wishlist = [];
    await req.user.save();
    
    // Get updated user with populated wishlist
    const updatedUser = await getUserWithPopulatedFields(req.user._id);
    
    res.json({ 
      success: true,
      message: 'Wishlist cleared',
      user: updatedUser // Return the updated user with populated data
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    
    res.json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const Review = require('../models/Review');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET localhost:5000/api/dashboard/services
router.get('/services', verifyToken, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.userId });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET localhost:5000/api/dashboard/reviews
router.get('/reviews', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.userId }).populate('service', 'title');
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT localhost:5000/api/dashboard/profile
router.put('/profile', verifyToken, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET localhost:5000/api/dashboard/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET analytics data for provider dashboard
router.get('/analytics', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Access Denied' });
        }

        // Get all services by the provider
        const services = await Service.find({ provider: req.user.userId });
        const serviceIds = services.map(service => service._id);

        // Get all reviews for these services
        const reviews = await Review.find({ service: { $in: serviceIds } });

        // Calculate analytics
        const analytics = {
            totalServices: services.length,
            activeServices: services.length, 
            totalReviews: reviews.length,
            averageRating: reviews.length > 0 
                ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
                : 0,
            reviewsOverTime: {},
            recentReviews: []
        };

        // Reviews over time (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        reviews.forEach(review => {
            if (review.createdAt >= sixMonthsAgo) {
                const monthYear = review.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
                analytics.reviewsOverTime[monthYear] = 
                    (analytics.reviewsOverTime[monthYear] || 0) + 1;
            }
        });

        // Recent reviews (last 2)
        analytics.recentReviews = await Review.find({ service: { $in: serviceIds } })
            .sort({ createdAt: -1 })
            .limit(2)
            .populate('user', 'name')
            .populate('service', 'title');

        res.json({ analytics });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

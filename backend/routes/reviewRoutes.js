const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Service = require('../models/Service');
const verifyToken = require('../middleware/authMiddleware');
const updateServiceRating = require('../utils/updateServiceRating');

// UPDATE/POST localhost:5000/api/reviews/<serviceId> -- protected route
router.post('/:serviceId', verifyToken, async (req, res) => {
  const { rating, comment } = req.body;
  const { serviceId } = req.params;

  try {
    console.log('Creating review for service:', serviceId);
    console.log('User attempting to review:', req.user);

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    console.log('Service found:', {
      serviceId: service._id,
      providerId: service.provider,
      providerIdType: typeof service.provider
    });
    console.log('Comparing provider ID:', service.provider.toString());
    console.log('With user ID:', req.user.userId);
    console.log('Are they equal?', service.provider.toString() === req.user.userId);

    // Check if the user is the service provider
    if (service.provider.toString() === req.user.userId) {
      console.log('Provider attempting to review their own service - blocked');
      return res.status(403).json({ message: 'You cannot review your own service' });
    }

    const existingReview = await Review.findOne({
      user: req.user.userId,
      service: serviceId,
    });

    if (existingReview) {
      console.log('Updating existing review');
      existingReview.rating = rating;
      existingReview.comment = comment;

      await existingReview.save();
      await updateServiceRating(serviceId);
      return res.status(200).json({ message: 'Review updated', review: existingReview });
    }

    console.log('Creating new review');
    const newReview = new Review({
      user: req.user.userId,
      service: serviceId,
      rating,
      comment,
    });

    await newReview.save();
    await updateServiceRating(serviceId);
    res.status(201).json({ message: 'Review added', review: newReview });
  } catch (err) {
    console.error('Error in review creation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET localhost:5000/api/reviews/<serviceId> -- public route
router.get('/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

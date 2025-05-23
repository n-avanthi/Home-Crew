const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Review = require('../models/Review');
const verifyToken = require('../middleware/authMiddleware');

// POST localhost:5000/api/services -- protected route
router.post('/', verifyToken, async (req, res) => {
    try {
        if(req.user.role !== 'provider') {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const { 
            title, 
            description, 
            category, 
            minimumPrice, 
            subArea,
            area,
            city,
            contactNumber, 
            providerName 
        } = req.body;

        const service = new Service({
            title,
            description,
            category,
            minimumPrice,
            subArea,
            area,
            city,
            contactNumber,
            providerName,
            provider: req.user.userId,
        });

        await service.save();

        res.status(201).json({ message: 'Service created successfully', service });
    }
    catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// GET localhost:5000/api/services -- public route
router.get('/', async (req, res) => {
    try {
        const { location, category } = req.query;

        const filter = {};
        if(category) filter.category = { $regex: category, $options: 'i' };
        
        // Location search across all location fields
        if(location) {
            filter.$or = [
                { subArea: { $regex: location, $options: 'i' } },
                { area: { $regex: location, $options: 'i' } },
                { city: { $regex: location, $options: 'i' } }
            ];
        }

        const services = await Service.find(filter)
        .sort({createdAt: -1})
        .populate('provider', '_id name email');

        res.status(200).json({ count: services.length, services });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET localhost:5000/api/services:id -- public route
router.get('/:id', async (req, res) => {
    try {
      const service = await Service.findById(req.params.id).populate('provider', '_id name email');
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      const reviews = await Review.find({ service: req.params.id }).populate('user', 'name');
      res.json({ service, reviews });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// PUT localhost:5000/api/services/<id> -- protected route
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if(!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if(service.provider.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const allowedUpdates = [
            'title', 
            'description', 
            'category', 
            'minimumPrice', 
            'subArea',
            'area',
            'city',
            'contactNumber', 
            'providerName'
        ];
        
        allowedUpdates.forEach(field => {
            if(req.body[field] !== undefined) {
                service[field] = req.body[field];
            }
        });

        await service.save();

        res.json({ message: 'Service updated successfully', service });
    }
    catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE localhost:5000/api/services/<id> -- protected route
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if(!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if(service.provider.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        await service.deleteOne();
        res.json({ message: 'Service deleted successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
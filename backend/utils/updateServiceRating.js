const Review = require('../models/Review');
const Service = require('../models/Service');

const updateServiceRating = async(serviceId) => {
    const reviews = await Review.find({ service: serviceId });

    const numReviews = reviews.length;
    const averageRating =
    numReviews === 0
    ? 0
    : reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews;

    await Service.findByIdAndUpdate( serviceId, {
        averageRating: averageRating.toFixed(1),
        numReviews,
    });
};

module.exports = updateServiceRating;
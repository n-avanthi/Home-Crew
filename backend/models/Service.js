const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    minimumPrice: {
        type: Number,
        required: true,
    },
    subArea: {
        type: String,
        required: false,
    },
    area: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
        enum: [
            'Bangalore',
            'Mumbai',
            'Delhi',
            'Hyderabad',
            'Chennai',
            'Kolkata',
            'Pune',
            'Ahmedabad',
            'Jaipur',
            'Surat'
        ]
    },
    contactNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        }
    },
    providerName: {
        type: String,
        required: true,
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Service', serviceSchema);
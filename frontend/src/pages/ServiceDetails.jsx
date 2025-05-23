import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceService, reviewService } from '../services/api';
import '../styles/ServiceDetails.css';

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: '',
    });

    useEffect(() => {
        fetchServiceDetails();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getOne(id);
            setService(response.data.service);
            setReviews(response.data.reviews);
            setError('');
        } catch (err) {
            setError('Failed to fetch service details');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewService.create(id, reviewForm);
            fetchServiceDetails();
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            setError('Failed to submit review');
        }
    };

    const handleReviewChange = (e) => {
        setReviewForm({
            ...reviewForm,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!service) {
        return <div className="error">Service not found</div>;
    }

    const isServiceProvider = user && service.provider && service.provider._id === user.id;

    return (
        <div className="service-details-container">
            <div className="service-header">
                <div className="header-content">
                    <div className="title-container">
                        <h1>{service.category}</h1>
                        {service.title && service.title !== service.category && (
                            <h2 className="service-subtitle">{service.title}</h2>
                        )}
                    </div>
                    <div className="rating-badge">
                        <span className="stars">
                            {'★'.repeat(Math.round(service.averageRating))}
                            {'☆'.repeat(5 - Math.round(service.averageRating))}
                        </span>
                        <span className="review-count">
                            {service.numReviews} {service.numReviews === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="service-content">
                <div className="main-info">
                    <div className="info-card">
                        <h2>Service Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <i className="fas fa-user"></i>
                                <div>
                                    <label>Provider Name</label>
                                    <span>{service.providerName}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <label>Contact</label>
                                    <span>{service.contactNumber}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-tag"></i>
                                <div>
                                    <label>Starting Price</label>
                                    <span>₹{service.minimumPrice}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <label>Location</label>
                                    <span>
                                        {service.subArea 
                                            ? `${service.subArea}, ${service.area}, ${service.city}`
                                            : `${service.area}, ${service.city}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="description">
                            <h3>About this service</h3>
                            <p>{service.description}</p>
                        </div>
                    </div>

                    {user && !isServiceProvider && (
                        <div className="review-form-card">
                            <h2>Write a Review</h2>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="form-group">
                                    <label>Rating</label>
                                    <select
                                        name="rating"
                                        value={reviewForm.rating}
                                        onChange={handleReviewChange}
                                        required
                                    >
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <option key={rating} value={rating}>
                                                {rating} {rating === 1 ? 'Star' : 'Stars'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Comment</label>
                                    <textarea
                                        name="comment"
                                        value={reviewForm.comment}
                                        onChange={handleReviewChange}
                                        required
                                        placeholder="Share your experience with this service..."
                                    />
                                </div>
                                <button type="submit" className="submit-review">
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="reviews-section">
                        <h2>Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div key={review._id} className="review-card">
                                        <div className="review-header">
                                            <span className="reviewer-name">{review.user.name}</span>
                                            <span className="review-rating">
                                                {'★'.repeat(review.rating)}
                                                {'☆'.repeat(5 - review.rating)}
                                            </span>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-reviews">No reviews yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails; 
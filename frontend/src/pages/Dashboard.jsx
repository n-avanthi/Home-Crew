import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService, serviceService, reviewService } from '../services/api';
import DashboardAnalytics from '../components/DashboardAnalytics';
import '../styles/UserDashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [profileRes, servicesRes, reviewsRes] = await Promise.all([
                dashboardService.getProfile(),
                dashboardService.getServices(),
                reviewService.getUserReviews(),
            ]);

            setProfile(profileRes.data);
            setServices(servicesRes.data.services);
            setReviews(reviewsRes.data.reviews);
            setFormData({
                name: profileRes.data.name,
                email: profileRes.data.email,
                password: '',
            });
            setError('');
        } catch (err) {
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dashboardService.updateProfile(formData);
            setEditMode(false);
            fetchDashboardData();
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await serviceService.delete(serviceId);
                setServices(services.filter(s => s._id !== serviceId));
            } catch (err) {
                setError('Failed to delete service');
            }
        }
    };

    const handleEditService = (service) => {
        setEditingService({
            ...service,
            minimumPrice: service.minimumPrice.toString()
        });
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            const updated = await serviceService.update(editingService._id, editingService);
            setServices(services.map(s => s._id === updated.data.service._id ? updated.data.service : s));
            setEditingService(null);
        } catch (err) {
            setError('Failed to update service');
        }
    };

    const handleServiceFormChange = (e) => {
        setEditingService({
            ...editingService,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="dashboard-section">
                <h3>Profile</h3>
                {editMode ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-info">
                        <p>
                            <strong>Name:</strong> {profile.name}
                        </p>
                        <p>
                            <strong>Email:</strong> {profile.email}
                        </p>
                        <button
                            className="btn btn-primary btn-compact"
                            onClick={() => setEditMode(true)}
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>

            {user.role === 'provider' && (
                <>
                    <div className="dashboard-section">
                        <h3>Analytics Overview</h3>
                        <DashboardAnalytics />
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h3>My Services</h3>
                            <Link 
                                to="/services/create" 
                                className="btn btn-primary btn-compact"
                            >
                                Register Service
                            </Link>
                        </div>
                        <div className="service-list">
                            {services.map((service) => (
                                <div key={service._id} className="service-card">
                                    {editingService && editingService._id === service._id ? (
                                        <form onSubmit={handleUpdateService} className="edit-service-form">
                                            <input
                                                type="text"
                                                name="title"
                                                value={editingService.title}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                                placeholder="Service Title"
                                            />
                                            <textarea
                                                name="description"
                                                value={editingService.description}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                                placeholder="Service Description"
                                            />
                                            <input
                                                type="text"
                                                name="category"
                                                value={editingService.category}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                                placeholder="Category"
                                            />
                                            <select
                                                name="city"
                                                value={editingService.city}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                            >
                                                <option value="">Select a city</option>
                                                {[
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
                                                ].map(city => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                name="area"
                                                value={editingService.area}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                                placeholder="Area (e.g., Koramangala)"
                                            />
                                            <input
                                                type="text"
                                                name="subArea"
                                                value={editingService.subArea || ''}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                placeholder="Sub Area (Optional)"
                                            />
                                            <input
                                                type="number"
                                                name="minimumPrice"
                                                value={editingService.minimumPrice}
                                                onChange={handleServiceFormChange}
                                                className="form-control"
                                                required
                                                min="0"
                                                placeholder="Minimum Price"
                                            />
                                            <div className="button-group">
                                                <button type="submit" className="btn btn-primary">Save</button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-secondary"
                                                    onClick={() => setEditingService(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="service-card-header">
                                                <h4>{service.category}</h4>
                                                <div className="service-title">{service.title}</div>
                                            </div>
                                            
                                            <div className="service-info">
                                                <div className="service-meta">
                                                    <div className="price">₹{service.minimumPrice}</div>
                                                    <div className="location">
                                                        <i className="fas fa-map-marker-alt"></i> {service.city}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rating-section">
                                                <span className="rating">
                                                    {'★'.repeat(Math.round(service.averageRating || 0))}
                                                    {'☆'.repeat(5 - Math.round(service.averageRating || 0))}
                                                </span>
                                                <span className="review-count">
                                                    {service.numReviews || 0} reviews
                                                </span>
                                            </div>

                                            <div className="service-actions">
                                                <button 
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => handleEditService(service)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    type="button"
                                                    className="btn-danger"
                                                    onClick={() => handleDeleteService(service._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {services.length === 0 && (
                                <div className="no-services">
                                    No services created yet
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="dashboard-section">
                <h3>My Reviews</h3>
                {reviews
                    .filter(review => review.service)
                    .map((review) => (
                        <div key={review._id} className="service-card review-card">
                            <div className="review-header">
                                <h4 className="review-service-name">{review.service.title}</h4>
                                <div className="review-rating">
                                    <span className="stars">
                                        {'★'.repeat(review.rating)}
                                        {'☆'.repeat(5 - review.rating)}
                                    </span>
                                </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                }
                {reviews.filter(review => review.service).length === 0 && (
                    <div className="no-services">
                        No reviews written yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 
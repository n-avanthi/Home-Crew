import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/api';
import '../styles/Home.css';

const Home = () => {
    const [services, setServices] = useState([]);
    const [filters, setFilters] = useState({
        location: '',
        category: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchServices();
    }, []); // Remove filters dependency to prevent auto-search

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getAll(filters);
            setServices(response.data.services);
            setError('');
        } catch (err) {
            setError('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchServices();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="home-container">
            <div>
                <h1>Find Local Services</h1>
                <div className="search-section">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-filters">
                            <input
                                type="text"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                placeholder="Where do you need the service? (City, Area)"
                                className="search-input"
                            />
                            <input
                                type="text"
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                placeholder="What service are you looking for? (e.g., Plumber, Electrician)"
                                className="search-input"
                            />
                            <button type="submit" className="btn btn-primary">
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="service-list">
                {services.map((service) => (
                    <div key={service._id} className="service-card">
                        <div className="service-card-content">
                            <div className="service-header">
                                <div className="title-wrapper">
                                    <h3 className="category-title">{service.category}</h3>
                                </div>
                                <div className="rating-wrapper">
                                    <div className="rating">
                                        <span className="stars">
                                            {'★'.repeat(Math.round(service.averageRating))}
                                            {'☆'.repeat(5 - Math.round(service.averageRating))}
                                        </span>
                                        <span className="review-count">({service.numReviews} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="service-details">
                                <div className="provider-info">
                                    <div className="detail-item">
                                        <i className="fas fa-user"></i>
                                        <span>{service.providerName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fas fa-phone"></i>
                                        <span>{service.contactNumber}</span>
                                    </div>
                                </div>
                                
                                <div className="location-price">
                                    <div className="detail-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{service.city}</span>
                                    </div>
                                    <div className="detail-item price">
                                        <i className="fas fa-tag"></i>
                                        <span>Starting from ₹{service.minimumPrice}</span>
                                    </div>
                                </div>
                                
                                <div className="service-title">
                                    {service.title}
                                </div>
                            </div>
                        </div>
                        <Link to={`/services/${service._id}`} className="btn btn-primary view-details">
                            View Details
                        </Link>
                    </div>
                ))}
            </div>

            {services.length === 0 && !loading && (
                <div className="no-services">
                    No services found matching your criteria
                </div>
            )}
        </div>
    );
};

export default Home; 
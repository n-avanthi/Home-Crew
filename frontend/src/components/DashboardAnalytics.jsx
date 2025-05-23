import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import '../styles/DashboardAnalytics.css';

const DashboardAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getAnalytics();
            setAnalytics(response.data.analytics);
        } catch (err) {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!analytics) return null;

    return (
        <div className="analytics-container">
            <div className="analytics-grid">
                <div className="stat-card overview-card">
                    <h3>Overview</h3>
                    <div className="stat-grid">
                        <div className="stat-item">
                            <span className="stat-label">Total Services</span>
                            <span className="stat-value">{analytics.totalServices}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total Reviews</span>
                            <span className="stat-value">{analytics.totalReviews}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Average Rating</span>
                            <span className="stat-value">
                                <span className="stars">{'★'.repeat(Math.round(analytics.averageRating))}</span>
                                <span className="rating-number">({analytics.averageRating})</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card reviews-card">
                    <h3>Recent Reviews</h3>
                    <div className="recent-reviews">
                        {analytics.recentReviews.length > 0 ? (
                            analytics.recentReviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.user.name}</span>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="review-service">{review.service.title}</div>
                                    <div className="review-rating">
                                        <span className="stars">{'★'.repeat(review.rating)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-reviews">No reviews yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics; 
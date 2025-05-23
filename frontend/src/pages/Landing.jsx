import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
    const features = [
        {
            icon: '🏠',
            title: 'Trusted Professionals',
            description: 'All our service providers are verified and highly rated'
        },
        {
            icon: '⭐',
            title: 'Quality Service',
            description: 'Get top-notch service for all your home maintenance needs'
        },
        {
            icon: '📅',
            title: 'Easy Booking',
            description: 'Book services at your convenience with just a few clicks'
        },
        {
            icon: '💰',
            title: 'Best Prices',
            description: 'Competitive pricing with no hidden charges'
        }
    ];

    return (
        <div className="landing-page">
            <div className="landing-hero">
                <div className="landing-content">
                    <h1>Welcome to Home Crew</h1>
                    <p className="hero-subtitle">
                        Your one-stop solution for reliable home services
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary">
                            Get Started
                        </Link>
                        <Link to="/login" className="btn btn-secondary">
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            <section className="features-section">
                <div className="container">
                    <h2>Why Choose Home Crew?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div 
                                key={feature.title} 
                                className="feature-card"
                                style={{ '--card-index': index }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <h1>Home Crew</h1>
                </Link>
                <div className="navbar-nav">
                    {user ? (
                        <>
                            <Link to="/home" className="nav-link">Services</Link>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            {user.role === 'provider' && (
                                <Link to="/services/create" className="nav-link">Register Service</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 
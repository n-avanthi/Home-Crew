import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceDetails from './pages/ServiceDetails';
import Dashboard from './pages/Dashboard';
import RegisterService from './pages/CreateService';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';
import './styles/common.css';
import './index.css';

// Protected Route component with useAuth hook inside
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

// Main app layout component that uses useAuth
const AppLayout = () => {
    const { user } = useAuth();

    return (
        <>
            {user && <Navbar />}
            <div className={user ? 'container' : ''}>
                <Routes>
                    <Route path="/" element={!user ? <Landing /> : <Navigate to="/home" />} />
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/home" />} />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/services/:id"
                        element={
                            <ProtectedRoute>
                                <ServiceDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/services/create"
                        element={
                            <ProtectedRoute roles={['provider']}>
                                <RegisterService />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </>
    );
};

// Main App component that provides the AuthContext
function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout />
            </Router>
        </AuthProvider>
    );
}

export default App;

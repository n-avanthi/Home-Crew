import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services/api';
import '../styles/CreateService.css';

const CITIES = [
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
];

const RegisterService = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        minimumPrice: '',
        subArea: '',
        area: '',
        city: '',
        contactNumber: '',
        providerName: '',
    });
    const [error, setError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'contactNumber') {
            const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: numbersOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePhoneBlur = (e) => {
        const phone = e.target.value;
        if (phone.length > 0 && !validatePhone(phone)) {
            setPhoneError('Phone number must be exactly 10 digits');
        } else {
            setPhoneError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePhone(formData.contactNumber)) {
            setPhoneError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            await serviceService.create(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register service');
        }
    };

    return (
        <div className="create-service-container">
            <div className="form-card">
                <h2>Register Your Service</h2>
                {error && <div className="alert alert-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-sections">
                        <div className="form-section">
                            <h3>Basic Information</h3>
                            <div className="form-group">
                                <label htmlFor="providerName">Service Provider Name</label>
                                <input
                                    type="text"
                                    id="providerName"
                                    name="providerName"
                                    value={formData.providerName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contactNumber">Contact Number</label>
                                <input
                                    type="tel"
                                    id="contactNumber"
                                    name="contactNumber"
                                    className={phoneError ? 'error' : ''}
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    onBlur={handlePhoneBlur}
                                    required
                                    placeholder="Enter 10-digit phone number"
                                    pattern="[0-9]{10}"
                                />
                                {phoneError && <div className="error-message">{phoneError}</div>}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Service Details</h3>
                            <div className="form-group">
                                <label htmlFor="title">Service Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter service title"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Electrician, Plumber, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Describe your service in detail"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="minimumPrice">Minimum Price (₹)</label>
                                <input
                                    type="number"
                                    id="minimumPrice"
                                    name="minimumPrice"
                                    value={formData.minimumPrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="Enter minimum service price"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Service Location</h3>
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a city</option>
                                    {CITIES.map(city => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="area">Area</label>
                                <input
                                    type="text"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Koramangala, Indiranagar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subArea">Sub Area (Optional)</label>
                                <input
                                    type="text"
                                    id="subArea"
                                    name="subArea"
                                    value={formData.subArea}
                                    onChange={handleChange}
                                    placeholder="e.g., 12th Main, HAL 2nd Stage"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={!!phoneError}
                    >
                        Register Service
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterService; 
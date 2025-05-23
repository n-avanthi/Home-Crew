import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://home-crew-backend.onrender.com';

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for handling token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // If token refresh is in progress, queue the request
            try {
                const token = await new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Attempt to login again with stored credentials
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData?.email) {
                throw new Error('No stored credentials');
            }

            const response = await api.post('/login', {
                email: userData.email,
                password: userData.password 
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            
            processQueue(null, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // Clear auth data on refresh failure
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// Auth services
export const authService = {
    register: (userData) => api.post('/register', userData),
    login: (credentials) => api.post('/login', credentials),
    validateToken: () => api.post('/validate-token'),
};

// Service services
export const serviceService = {
    getAll: (filters) => api.get('/services', { params: filters }),
    getOne: (id) => api.get(`/services/${id}`),
    create: (serviceData) => api.post('/services', serviceData),
    update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
    delete: (id) => api.delete(`/services/${id}`),
};

// Review services
export const reviewService = {
    create: (serviceId, reviewData) => api.post(`/reviews/${serviceId}`, reviewData),
    getByService: (serviceId) => api.get(`/reviews/${serviceId}`),
    getUserReviews: () => api.get('/dashboard/reviews'),
    getServiceReviews: (serviceId) => api.get(`/services/${serviceId}`),
};

// Dashboard services
export const dashboardService = {
    getProfile: () => api.get('/dashboard/profile'),
    updateProfile: (userData) => api.put('/dashboard/profile', userData),
    getServices: () => api.get('/dashboard/services'),
    getAnalytics: () => api.get('/dashboard/analytics'),
}; 

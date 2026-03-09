import axios from "axios";

// Configures global Axios instance with base URL and credentials
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true, // Critical for session cookies
    headers: {
        "Content-Type": "application/json"
    }
});

// Interceptor to handle session expiration globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Skip redirect for the auth status check itself
            const url = error.config?.url || '';
            const isAuthCheck = url.includes('/api/auth/status') || url.includes('/api/auth/me');
            if (!isAuthCheck && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

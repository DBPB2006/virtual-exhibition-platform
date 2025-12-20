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
            // If we get a 401, it means the session is invalid.
            // We should redirect to login. Even if Redux thinks we are logged in.
            if (window.location.pathname !== '/login') {
                // Optional: Dispatch a custom event or manipulate window
                // simpler approach: let the component handle it or auto-logout
                // We rely on components to handle strict redirects, but this helps debugging
            }
        }
        return Promise.reject(error);
    }
);

export default api;

import axios from "axios";

// Define the base URL using your local IP for network accessibility
const BASE_URL = 'http://192.168.1.75:8000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, 
});

// REQUEST INTERCEPTOR: Attach the Bearer Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handles token expiration and automatic refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isGuest = localStorage.getItem("is_guest") === "true";

        // CASE 1: 401 UNAUTHORIZED (Token invalid/expired)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isGuest) return Promise.reject(error);

            const refreshToken = localStorage.getItem("refresh_token");
            
            if (refreshToken) {
                originalRequest._retry = true; // Prevents infinite refresh loops
                try {
                    // Attempt to get a new access token using the static IP
                    const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (res.status === 200) {
                        localStorage.setItem("access_token", res.data.access);
                        
                        // Update the default header for future requests
                        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
                        
                        // Retry the original failed request with the new token
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Session is fully dead; clear and redirect
                    console.error("Refresh token expired - Logging out");
                    localStorage.clear();
                    window.location.href = "/login?error=expired";
                }
            } else {
                localStorage.clear();
                window.location.href = "/login";
            }
        }

        // CASE 2: 403 FORBIDDEN (Permissions issues)
        if (error.response && error.response.status === 403) {
            console.warn("Access Denied: You do not have the required permissions.");
        }

        return Promise.reject(error);
    }
);

export default api;
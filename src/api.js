import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
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

// RESPONSE INTERCEPTOR: Handle 401 (Expired) and 403 (Forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isGuest = localStorage.getItem("is_guest") === "true";

    // CASE 1: 401 UNAUTHORIZED (Token invalid/expired)
    if (error.response && error.response.status === 401) {
      if (isGuest) {
        return Promise.reject(error);
      }

      if (localStorage.getItem("access_token")) {
        console.error("Session Expired - Redirecting to Login");
        localStorage.clear();
        window.location.href = "/login?error=expired";
      }
    }

    // CASE 2: 403 FORBIDDEN (Authenticated but lack permissions)
    if (error.response && error.response.status === 403) {
      console.warn("Access Denied: You do not have the required permissions.");
      
      // If a mechanic/staff hits a 403, we don't want to clear their storage 
      // and kick them out entirely, we just want to reject the request.
      // The Dashboard component will see the error and show a "Denied" message.
    }

    return Promise.reject(error);
  }
);

export default api;
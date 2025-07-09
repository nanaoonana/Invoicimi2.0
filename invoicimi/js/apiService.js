// invoicimi/js/apiService.js

// Ensure authUtils is loaded before this script, or pass it as a dependency.
// For simplicity, assuming authUtils is globally available (window.authUtils)

(function(auth) {
    if (!auth) {
        console.error("Auth utilities (auth.js) not found. Ensure it's loaded before apiService.js");
        // Potentially throw an error or disable API functionality
        // For now, we'll let it try and fail if auth is missing.
    }

    const API_BASE_URL = 'http://localhost:8000/api'; // Assuming Laravel backend runs here

    async function request(endpoint, method = 'GET', data = null, customHeaders = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = auth ? auth.getToken() : null;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: method,
            headers: headers,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                if (auth) auth.redirectToLogin(); // Unauthorized, redirect to login
                throw new Error('Unauthorized: Please log in.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Handle cases where response might be empty (e.g., 204 No Content)
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Service Error:', error);
            throw error; // Re-throw to allow calling function to handle
        }
    }

    // Specific service functions
    async function fetchUser() {
        return request('/user', 'GET');
    }

    async function loginUser(email, password) {
        // This function would be called from login.js or similar
        // It will handle saving token and user data upon successful login
        const response = await request('/login', 'POST', { email, password });
        if (response && response.access_token && response.user) {
            if (auth) {
                auth.saveToken(response.access_token);
                auth.saveUser(response.user);
            }
        }
        return response; // Return the full response for the caller to handle redirection etc.
    }

    async function registerUser(name, email, password, password_confirmation) {
        return request('/register', 'POST', { name, email, password, password_confirmation});
    }

    async function logoutUser() {
        // Call backend logout if it revokes server-side session/token
        try {
            await request('/logout', 'POST');
        } catch (error) {
            console.warn("Error during backend logout, proceeding with client-side logout:", error.message);
        } finally {
            if (auth) auth.logout(); // Always clear client-side token/user
        }
    }

    async function fetchDashboardStats() {
        return request('/dashboard/stats', 'GET');
    }

    async function fetchRecentInvoices() {
        return request('/dashboard/recent-invoices', 'GET');
    }

    // Add more specific service functions as needed (e.g., for clients, invoices CRUD)

    // Expose the service functions
    window.apiService = {
        request, // Expose generic request if needed, or keep it internal
        fetchUser,
        loginUser,
        registerUser,
        logoutUser,
        fetchDashboardStats,
        fetchRecentInvoices
    };

})(window.authUtils);

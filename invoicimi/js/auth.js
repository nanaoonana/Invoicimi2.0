// invoicimi/js/auth.js

const TOKEN_KEY = 'invoicimi_auth_token';
const USER_KEY = 'invoicimi_user_data';

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function saveUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

function removeUser() {
    localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
    return !!getToken();
}

function logout() {
    removeToken();
    removeUser();
    // In a real app, you might also want to call a backend logout endpoint
    // redirectToLogin(); // Or handle this at the application level
}

function redirectToLogin() {
    // Adjust path if login page is elsewhere or if using a router
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('log-in.html')) {
        return; // Already on a login page
    }
    // Assuming login.html is at the same level as dashboard.html, clients.html etc.
    // Check current path to make redirection robust, e.g. if inside /invoicimi/
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    window.location.href = basePath + 'login.html';
}

// Example of how to protect a page:
// if (!isLoggedIn()) {
//     redirectToLogin();
// }
// This check should be at the top of scripts for protected pages.

// It might be good to have a function that checks and redirects immediately.
function enforceAuth() {
    if (!isLoggedIn()) {
        redirectToLogin();
        // Throw an error or return a flag to stop further script execution on the page
        throw new Error("User not authenticated. Redirecting to login.");
    }
}

// Export functions if using modules, otherwise they are global
// For simplicity in multi-HTML setup, they might be global or attached to a namespace object
window.authUtils = {
    saveToken,
    getToken,
    removeToken,
    saveUser,
    getUser,
    removeUser,
    isLoggedIn,
    logout,
    redirectToLogin,
    enforceAuth
};

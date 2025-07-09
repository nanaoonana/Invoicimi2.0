// invoicimi/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure authUtils and apiService are loaded
    if (!window.authUtils || !window.apiService) {
        console.error('Auth utilities or API service not found. Ensure auth.js and apiService.js are loaded before dashboard.js.');
        alert('Critical application files are missing. Please contact support.');
        return;
    }

    const { enforceAuth, getUser: getAuthUser, logout } = window.authUtils;
    const { fetchUser, fetchDashboardStats, fetchRecentInvoices } = window.apiService;

    try {
        enforceAuth(); // Redirects to login if not authenticated
    } catch (error) {
        // enforceAuth throws an error to stop script execution if redirecting
        console.warn(error.message);
        return;
    }

    const sidebarUsernameEl = document.getElementById('sidebar-username');
    const welcomeUsernameEl = document.getElementById('welcome-username');
    const userAvatarInitialEl = document.getElementById('user-avatar-initial');

    const statsTotalRevenueEl = document.getElementById('stats-total-revenue');
    const statsPendingInvoicesCountEl = document.getElementById('stats-pending-invoices-count');
    const statsPendingInvoicesAmountEl = document.getElementById('stats-pending-invoices-amount');
    const statsPaidInvoicesCountEl = document.getElementById('stats-paid-invoices-count');
    // const statsOutstandingClientsCountEl = document.getElementById('stats-outstanding-clients-count'); // Placeholder

    const recentInvoicesTbodyEl = document.getElementById('recent-invoices-tbody');
    const dashboardErrorMessageEl = document.getElementById('dashboard-error-message');
    const errorTextEl = document.getElementById('error-text');

    function displayError(message) {
        if (errorTextEl) errorTextEl.textContent = message;
        if (dashboardErrorMessageEl) dashboardErrorMessageEl.classList.remove('hidden');
    }

    function clearError() {
        if (errorTextEl) errorTextEl.textContent = '';
        if (dashboardErrorMessageEl) dashboardErrorMessageEl.classList.add('hidden');
    }

    // --- Fetch User Data ---
    try {
        clearError();
        // Attempt to get user from localStorage first (set during login)
        let user = getAuthUser();
        if (!user) { // If not in localStorage, fetch from API
            const userData = await fetchUser();
            user = userData; // Assuming fetchUser returns the user object directly
            window.authUtils.saveUser(user); // Save for future use
        }

        if (user && user.name) {
            if (sidebarUsernameEl) sidebarUsernameEl.textContent = user.name.split(' ')[0]; // First name
            if (welcomeUsernameEl) welcomeUsernameEl.textContent = user.name;
            if (userAvatarInitialEl && user.name.length > 0) {
                userAvatarInitialEl.textContent = user.name.charAt(0).toUpperCase();
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        displayError('Could not load user information. ' + error.message);
        // Potentially logout or redirect if user fetch fails critically
        // logout();
    }

    // --- Fetch Dashboard Stats ---
    if (statsTotalRevenueEl) statsTotalRevenueEl.innerHTML = '<span class="loader"></span>';
    if (statsPendingInvoicesCountEl) statsPendingInvoicesCountEl.innerHTML = '<span class="loader"></span>';
    if (statsPendingInvoicesAmountEl) statsPendingInvoicesAmountEl.textContent = ''; // Clear any previous text
    if (statsPaidInvoicesCountEl) statsPaidInvoicesCountEl.innerHTML = '<span class="loader"></span>';

    try {
        clearError();
        const stats = await fetchDashboardStats();
        if (statsTotalRevenueEl) statsTotalRevenueEl.textContent = `GH₵${stats.total_revenue.toFixed(2)}`;
        if (statsPendingInvoicesCountEl) statsPendingInvoicesCountEl.textContent = stats.pending_invoices_count;
        if (statsPendingInvoicesAmountEl) statsPendingInvoicesAmountEl.textContent = `GH₵${stats.pending_amount.toFixed(2)} pending`;
        if (statsPaidInvoicesCountEl) statsPaidInvoicesCountEl.textContent = stats.paid_invoices_count;
        // if (statsOutstandingClientsCountEl) statsOutstandingClientsCountEl.textContent = stats.outstanding_clients_count || 'N/A';
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        displayError('Could not load dashboard statistics. ' + error.message);
        if (statsTotalRevenueEl) statsTotalRevenueEl.textContent = 'Error';
        if (statsPendingInvoicesCountEl) statsPendingInvoicesCountEl.textContent = 'Error';
        if (statsPaidInvoicesCountEl) statsPaidInvoicesCountEl.textContent = 'Error';
    }

    // --- Fetch Recent Invoices ---
    if (recentInvoicesTbodyEl) {
        recentInvoicesTbodyEl.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">Loading recent invoices...</td></tr>';
    }

    try {
        clearError();
        const recentInvoices = await fetchRecentInvoices();
        if (recentInvoicesTbodyEl) {
            recentInvoicesTbodyEl.innerHTML = ''; // Clear loading message
            if (recentInvoices && recentInvoices.length > 0) {
                recentInvoices.forEach(invoice => {
                    const row = recentInvoicesTbodyEl.insertRow();
                    row.classList.add('hover:bg-gray-50');

                    // Determine status badge color
                    let statusColorClass = 'bg-gray-100 text-gray-800'; // Default for draft/other
                    if (invoice.status === 'paid') statusColorClass = 'bg-green-100 text-green-800';
                    else if (invoice.status === 'pending' || invoice.status === 'sent') statusColorClass = 'bg-yellow-100 text-yellow-800';
                    else if (invoice.status === 'overdue') statusColorClass = 'bg-red-100 text-red-800';
                    else if (invoice.status === 'void') statusColorClass = 'bg-gray-400 text-white';


                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${invoice.invoice_number}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.client_name || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">GH₵${parseFloat(invoice.total_amount).toFixed(2)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClass}">
                                ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" class="text-blue-600 hover:text-blue-900 mr-4">View</a>
                            <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    `;
                });
            } else {
                recentInvoicesTbodyEl.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-gray-500">No recent invoices found.</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error fetching recent invoices:', error);
        displayError('Could not load recent invoices. ' + error.message);
        if (recentInvoicesTbodyEl) {
            recentInvoicesTbodyEl.innerHTML = '<tr><td colspan="6" class="text-center p-4 text-red-500">Error loading invoices.</td></tr>';
        }
    }
});

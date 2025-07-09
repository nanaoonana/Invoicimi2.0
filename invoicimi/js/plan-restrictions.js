// js/plan-restrictions.js
document.addEventListener('DOMContentLoaded', function() {
    // Define plan features and limits
    const PLANS = {
        free: {
            invoices: 3,
            templates: 'basic',
            support: 'email',
            mobileMoney: false,
            recurringBilling: false,
            analytics: false,
            maxUsers: 1
        },
        professional: {
            invoices: 50,
            templates: 'premium',
            support: 'priority',
            mobileMoney: true,
            recurringBilling: true,
            analytics: true,
            maxUsers: 3
        },
        business: {
            invoices: 'unlimited',
            templates: 'premium',
            support: 'dedicated',
            mobileMoney: true,
            recurringBilling: true,
            analytics: true,
            maxUsers: 10
        }
    };

    // Function to check if user can access a feature
    function canAccessFeature(plan, feature) {
        const userPlan = PLANS[plan] || PLANS.free;
        
        // Check specific feature access
        switch(feature) {
            case 'createInvoice':
                if (userPlan.invoices === 'unlimited') return true;
                const invoiceCount = parseInt(localStorage.getItem('invoiceCount') || '0');
                return invoiceCount < userPlan.invoices;
                
            case 'useTemplate':
                return userPlan.templates === 'premium' || 
                      (userPlan.templates === 'basic' && !document.querySelector('.template').classList.contains('premium'));
                
            case 'useMobileMoney':
                return userPlan.mobileMoney;
                
            case 'createRecurring':
                return userPlan.recurringBilling;
                
            case 'viewAnalytics':
                return userPlan.analytics;
                
            case 'addUser':
                const userCount = JSON.parse(localStorage.getItem('users') || '[]').length;
                return userCount < userPlan.maxUsers;
                
            default:
                return false;
        }
    }

    // Function to update UI based on plan
    function updateUIForPlan(plan) {
        const userPlan = PLANS[plan] || PLANS.free;
        
        // Update feature visibility
        document.querySelectorAll('[data-feature]').forEach(element => {
            const feature = element.getAttribute('data-feature');
            if (!canAccessFeature(plan, feature)) {
                element.classList.add('opacity-50', 'pointer-events-none');
                const upgradeEl = element.querySelector('.upgrade-prompt') || 
                                 document.createElement('div');
                if (!upgradeEl.classList.contains('upgrade-prompt')) {
                    upgradeEl.className = 'upgrade-prompt text-xs text-red-500 mt-1';
                    upgradeEl.textContent = 'Upgrade to access this feature';
                    element.appendChild(upgradeEl);
                }
            }
        });
        
        // Update plan-specific limits
        if (userPlan.invoices !== 'unlimited') {
            const invoiceCount = parseInt(localStorage.getItem('invoiceCount') || '0');
            const remaining = userPlan.invoices - invoiceCount;
            const counter = document.getElementById('invoice-counter');
            if (counter) {
                counter.textContent = `${remaining} of ${userPlan.invoices} invoices remaining`;
            }
        }
    }

    // Check plan on page load
    const userPlan = localStorage.getItem('userPlan') || 'free';
    updateUIForPlan(userPlan);

    // Handle plan upgrades
    document.querySelectorAll('[data-upgrade-plan]').forEach(button => {
        button.addEventListener('click', function() {
            const newPlan = this.getAttribute('data-upgrade-plan');
            localStorage.setItem('userPlan', newPlan);
            updateUIForPlan(newPlan);
            // Here you would typically redirect to payment page
            alert(`Upgrading to ${newPlan} plan...`);
        });
    });
});
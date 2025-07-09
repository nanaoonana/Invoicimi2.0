// Dark mode functionality
const darkModeToggle = document.getElementById('dark-mode-toggle');
const html = document.documentElement;
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const DARK_MODE_KEY = 'invoicimi-dark-mode';
let isDarkMode = false;

// Check for saved user preference, if any, on load
function checkDarkModePreference() {
    const savedPreference = localStorage.getItem(DARK_MODE_KEY);
    
    if (savedPreference !== null) {
        isDarkMode = savedPreference === 'true';
    } else {
        // If no saved preference, use system preference
        isDarkMode = darkModeMediaQuery.matches;
    }
    
    updateDarkMode();
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
    updateDarkMode();
}

// Update the UI based on dark mode state
function updateDarkMode() {
    if (isDarkMode) {
        html.classList.add('dark');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    } else {
        html.classList.remove('dark');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
}

// Initialize dark mode
function initDarkMode() {
    // Add dark mode toggle button if it doesn't exist
    if (!document.getElementById('dark-mode-toggle')) {
        const nav = document.querySelector('nav .hidden.md\:flex');
        if (nav) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'dark-mode-toggle';
            toggleBtn.className = 'p-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors';
            toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            toggleBtn.addEventListener('click', toggleDarkMode);
            
            // Insert before the Get Started button
            const getStartedBtn = nav.querySelector('a.bg-blue-900');
            if (getStartedBtn) {
                nav.insertBefore(toggleBtn, getStartedBtn);
            } else {
                nav.appendChild(toggleBtn);
            }
        }
    }
    
    checkDarkModePreference();
}

// Listen for system color scheme changes
darkModeMediaQuery.addEventListener('change', (e) => {
    // Only update if user hasn't set a preference
    if (localStorage.getItem(DARK_MODE_KEY) === null) {
        isDarkMode = e.matches;
        updateDarkMode();
    }
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}
// js/dark-mode.js
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const html = document.documentElement;
    const DARK_MODE_KEY = 'invoicimi-dark-mode';
    
    // Check for saved user preference or use system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem(DARK_MODE_KEY) || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the current theme
    if (currentTheme === 'dark') {
        html.classList.add('dark');
        updateToggleIcon(true);
    } else {
        html.classList.remove('dark');
        updateToggleIcon(false);
    }
    
    // Toggle dark/light mode
    darkModeToggle.addEventListener('click', function() {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem(DARK_MODE_KEY, isDark ? 'dark' : 'light');
        updateToggleIcon(isDark);
    });
    
    // Update the toggle icon based on current theme
    function updateToggleIcon(isDark) {
        const icon = darkModeToggle.querySelector('i');
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            darkModeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
    
    // Listen for system theme changes
    prefersDarkScheme.addListener(e => {
        if (!localStorage.getItem(DARK_MODE_KEY)) {
            if (e.matches) {
                html.classList.add('dark');
                updateToggleIcon(true);
            } else {
                html.classList.remove('dark');
                updateToggleIcon(false);
            }
        }
    });
});
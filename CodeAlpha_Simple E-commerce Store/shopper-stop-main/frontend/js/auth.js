// DOM Elements
const authModal = document.getElementById('authModal');
const authText = document.getElementById('authText');
const mobileAuthText = document.getElementById('mobileAuthText');
const authLink = document.querySelector('.auth-link');
const mobileAuthLink = document.getElementById('mobileAuthLink');
const closeModal = document.querySelector('.close-modal');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        // Show first name only for cleaner display
        const firstName = userData.name.split(' ')[0];
        if (authText) authText.textContent = firstName;
        if (mobileAuthText) mobileAuthText.textContent = firstName;
        
        // Update navigation links to go to profile page
        updateAuthLinksForLoggedInUser();
    } else {
        if (authText) authText.textContent = 'Login';
        if (mobileAuthText) mobileAuthText.textContent = 'Login';
        
        // Update navigation links to open login modal
        updateAuthLinksForGuest();
    }
}

// Update navigation links when user is logged in
function updateAuthLinksForLoggedInUser() {
    // Set href to profile page
    if (authLink) {
        authLink.href = 'profile.html';
        // Remove any existing click handlers
        authLink.onclick = null;
    }
    
    if (mobileAuthLink) {
        mobileAuthLink.href = 'profile.html';
        mobileAuthLink.onclick = null;
    }
}

// Update navigation links when user is not logged in
function updateAuthLinksForGuest() {
    if (authLink) {
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            showAuthModal();
        };
    }
    
    if (mobileAuthLink) {
        mobileAuthLink.href = '#';
        mobileAuthLink.onclick = (e) => {
            e.preventDefault();
            showAuthModal();
        };
    }
}

// Show auth modal
function showAuthModal() {
    if (authModal) {
        authModal.style.display = 'flex';
        // Reset forms
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Show login form by default
        if (loginForm) loginForm.classList.add('active');
        if (registerForm) registerForm.classList.remove('active');
        
        // Set active tab
        if (tabBtns) {
            tabBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === 'login') {
                    btn.classList.add('active');
                }
            });
        }
    }
}

// Hide auth modal
function hideAuthModal() {
    if (authModal) {
        authModal.style.display = 'none';
    }
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Basic validation
    if (!email || !password) {
        if (typeof showNotification === 'function') {
            showNotification('Please fill in all fields', 'error');
        }
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update UI
            checkAuthStatus();
            hideAuthModal();
            
            if (typeof showNotification === 'function') {
                showNotification('Login successful!', 'success');
            }
            
            // Update cart count
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            
            // Redirect to home page or current page
            setTimeout(() => {
                const currentPage = window.location.pathname;
                if (currentPage.includes('profile.html') || 
                    currentPage.includes('order-history.html') ||
                    currentPage.includes('cart.html')) {
                    window.location.reload();
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
            
        } else {
            if (typeof showNotification === 'function') {
                showNotification(data.message || 'Login failed. Please check your credentials.', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (typeof showNotification === 'function') {
            showNotification('Network error. Please try again.', 'error');
        }
    }
}

// Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        if (typeof showNotification === 'function') {
            showNotification('Please fill in all fields', 'error');
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (typeof showNotification === 'function') {
            showNotification('Passwords do not match', 'error');
        }
        return;
    }
    
    if (password.length < 6) {
        if (typeof showNotification === 'function') {
            showNotification('Password must be at least 6 characters', 'error');
        }
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update UI
            checkAuthStatus();
            hideAuthModal();
            
            if (typeof showNotification === 'function') {
                showNotification('Registration successful! Welcome to Shopper Stop!', 'success');
            }
            
            // Update cart count
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            if (typeof showNotification === 'function') {
                showNotification(data.message || 'Registration failed. Please try again.', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (typeof showNotification === 'function') {
            showNotification('Network error. Please try again.', 'error');
        }
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Update UI
        checkAuthStatus();
        
        // Update cart count
        if (typeof updateCartCount === 'function') {
            updateCartCount(0);
        }
        
        if (typeof showNotification === 'function') {
            showNotification('Logged out successfully', 'success');
        }
        
        // If on profile or order pages, redirect to home
        const currentPage = window.location.pathname;
        if (currentPage.includes('profile.html') || 
            currentPage.includes('order-history.html') ||
            currentPage.includes('order-confirmation.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
}

// Initialize auth module
document.addEventListener('DOMContentLoaded', () => {
    // Check auth status on page load
    checkAuthStatus();
    
    // Tab switching for login/register forms
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show corresponding form
                if (loginForm) loginForm.classList.remove('active');
                if (registerForm) registerForm.classList.remove('active');
                
                const formToShow = document.getElementById(`${tab}Form`);
                if (formToShow) {
                    formToShow.classList.add('active');
                }
            });
        });
    }
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Modal close button
    if (closeModal) {
        closeModal.addEventListener('click', hideAuthModal);
    }
    
    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // Handle navigation link clicks
    if (authLink) {
        authLink.addEventListener('click', (e) => {
            const token = localStorage.getItem('token');
            if (!token) {
                // If not logged in, prevent default and show login modal
                e.preventDefault();
                showAuthModal();
            }
            // If logged in, the link will naturally navigate to profile.html
        });
    }
    
    if (mobileAuthLink) {
        mobileAuthLink.addEventListener('click', (e) => {
            const token = localStorage.getItem('token');
            if (!token) {
                // If not logged in, prevent default and show login modal
                e.preventDefault();
                showAuthModal();
            }
            // If logged in, the link will naturally navigate to profile.html
        });
    }
    
    // Add logout functionality to any logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', logout);
    });
    
    // Add keyboard support for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal && authModal.style.display === 'flex') {
            hideAuthModal();
        }
    });
});

// Helper function to check if user is authenticated (for other scripts)
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Helper function to get current user data
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Make functions available globally
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.getAuthToken = getAuthToken;
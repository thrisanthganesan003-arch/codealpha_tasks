// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cartCount = document.querySelector('.cart-count');
const categoryGrid = document.getElementById('categoryGrid');
const featuredProducts = document.getElementById('featuredProducts');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

// Categories data
const categories = [
    { name: 'Electronics', icon: 'fa-laptop', color: '#4f46e5' },
    { name: 'Clothing', icon: 'fa-tshirt', color: '#f59e0b' },
    { name: 'Books', icon: 'fa-book', color: '#10b981' },
    { name: 'Home', icon: 'fa-home', color: '#ef4444' },
    { name: 'Sports', icon: 'fa-futbol', color: '#8b5cf6' },
    { name: 'Other', icon: 'fa-gift', color: '#06b6d4' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadFeaturedProducts();
    updateCartCount();
    setupEventListeners();
});

// Load categories
function loadCategories() {
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('a');
        categoryCard.href = `products.html?category=${encodeURIComponent(category.name)}`;
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <i class="fas ${category.icon}"></i>
            <h3>${category.name}</h3>
            <p>Shop Now →</p>
        `;
        categoryGrid.appendChild(categoryCard);
    });
}

// Load featured products
async function loadFeaturedProducts() {
    if (!featuredProducts) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=4`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        displayProducts(products, featuredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products
        const sampleProducts = [
            {
                _id: '1',
                name: 'Wireless Headphones',
                description: 'Premium wireless headphones with noise cancellation',
                price: 199.99,
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
                rating: 4.5,
                stock: 10
            },
            {
                _id: '2',
                name: 'Running Shoes',
                description: 'Comfortable running shoes for all terrains',
                price: 89.99,
                category: 'Sports',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
                rating: 4.7,
                stock: 25
            }
        ];
        displayProducts(sampleProducts, featuredProducts);
    }
}

// Display products
function displayProducts(products, container) {
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                </div>
                <div class="product-actions">
                    <button class="btn-add-to-cart" data-id="${product._id || product.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <a href="product-details.html?id=${product._id || product.id}" class="btn btn-view">
                        View
                    </a>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Add event listeners to Add to Cart buttons
    container.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.btn-add-to-cart').dataset.id;
            addToCart(productId, 1);
        });
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// Add to cart
async function addToCart(productId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        if (typeof showAuthModal === 'function') {
            showAuthModal();
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        if (response.ok) {
            const cart = await response.json();
            updateCartCount(cart.items?.length || 0);
            showNotification('Product added to cart!', 'success');
        } else {
            throw new Error('Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

// Update cart count
function updateCartCount(count) {
    if (!cartCount) return;
    
    if (count === undefined) {
        // Get count from localStorage or API
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(cart => {
                const itemCount = cart.items?.length || 0;
                cartCount.textContent = itemCount;
                document.querySelectorAll('.cart-count').forEach(el => {
                    el.textContent = itemCount;
                });
            })
            .catch(() => {
                cartCount.textContent = '0';
            });
        } else {
            cartCount.textContent = '0';
        }
    } else {
        cartCount.textContent = count;
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenuBtn && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
}

// Make functions available globally
window.addToCart = addToCart;
window.showNotification = showNotification;
// Profile Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthModal();
        setTimeout(() => {
            if (!localStorage.getItem('token')) {
                window.location.href = '../index.html';
            }
        }, 3000);
        return;
    }
    
    // DOM Elements
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const memberSince = document.getElementById('memberSince');
    const ordersCount = document.getElementById('ordersCount');
    const wishlistCount = document.getElementById('wishlistCount');
    const navItems = document.querySelectorAll('.nav-item');
    const profileSections = document.querySelectorAll('.profile-section');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Forms
    const profileForm = document.getElementById('profileForm');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileBirthday = document.getElementById('profileBirthday');
    const profileBio = document.getElementById('profileBio');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    
    // Addresses
    const addressesList = document.getElementById('addressesList');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addressModal = document.getElementById('addressModal');
    const addressForm = document.getElementById('addressForm');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    
    // Orders
    const processingOrders = document.getElementById('processingOrders');
    const shippedOrders = document.getElementById('shippedOrders');
    const deliveredOrders = document.getElementById('deliveredOrders');
    const totalSpent = document.getElementById('totalSpent');
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    
    // Wishlist
    const wishlistItems = document.getElementById('wishlistItems');
    const emptyWishlist = document.getElementById('emptyWishlist');
    
    // Security
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const manageSessionsBtn = document.getElementById('manageSessionsBtn');
    const sessionsModal = document.getElementById('sessionsModal');
    const logoutAllBtn = document.getElementById('logoutAllBtn');
    
    // Notifications
    const resetNotificationsBtn = document.getElementById('resetNotificationsBtn');
    const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
    
    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const confirmDeleteText = document.getElementById('confirmDeleteText');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // State
    let currentUser = null;
    let userOrders = [];
    let userAddresses = [];
    let userWishlist = [];
    let isEditingAddress = false;
    let editingAddressId = null;
    
    // Initialize
    loadUserProfile();
    setupEventListeners();
    
    // Event Listeners
    function setupEventListeners() {
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding section
                profileSections.forEach(sec => {
                    sec.classList.remove('active');
                    if (sec.id === `${section}Section`) {
                        sec.classList.add('active');
                    }
                });
                
                // Load section data if needed
                switch(section) {
                    case 'orders':
                        loadOrdersData();
                        break;
                    case 'wishlist':
                        loadWishlist();
                        break;
                    case 'addresses':
                        loadAddresses();
                        break;
                }
            });
        });
        
        // Logout
        logoutBtn.addEventListener('click', logout);
        
        // Profile form
        profileForm.addEventListener('submit', saveProfile);
        cancelProfileBtn.addEventListener('click', resetProfileForm);
        
        // Addresses
        addAddressBtn.addEventListener('click', () => {
            isEditingAddress = false;
            editingAddressId = null;
            document.getElementById('addressModalTitle').textContent = 'Add New Address';
            addressForm.reset();
            document.getElementById('setAsDefault').checked = false;
            addressModal.style.display = 'flex';
        });
        
        addressForm.addEventListener('submit', saveAddress);
        cancelAddressBtn.addEventListener('click', () => {
            addressModal.style.display = 'none';
        });
        
        // Security
        passwordForm.addEventListener('submit', changePassword);
        cancelPasswordBtn.addEventListener('click', resetPasswordForm);
        
        // Sessions
        manageSessionsBtn.addEventListener('click', () => {
            sessionsModal.style.display = 'flex';
            loadSessions();
        });
        
        logoutAllBtn.addEventListener('click', logoutAllSessions);
        
        // Notifications
        resetNotificationsBtn.addEventListener('click', resetNotificationSettings);
        saveNotificationsBtn.addEventListener('click', saveNotificationSettings);
        
        // Delete Account
        deleteAccountBtn.addEventListener('click', () => {
            deleteAccountModal.style.display = 'flex';
        });
        
        confirmDeleteText.addEventListener('input', () => {
            confirmDeleteBtn.disabled = confirmDeleteText.value !== 'DELETE MY ACCOUNT';
        });
        
        confirmDeleteBtn.addEventListener('click', deleteAccount);
        cancelDeleteBtn.addEventListener('click', () => {
            deleteAccountModal.style.display = 'none';
            confirmDeleteText.value = '';
            confirmDeleteBtn.disabled = true;
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                addressModal.style.display = 'none';
                sessionsModal.style.display = 'none';
                deleteAccountModal.style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        [addressModal, sessionsModal, deleteAccountModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    // Functions
    function loadUserProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser = user;
        
        // Update user info
        userName.textContent = user.name || 'User';
        userEmail.textContent = user.email || 'user@example.com';
        
        // Set member since date
        const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
        memberSince.textContent = `Member since ${createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        
        // Load profile form data
        profileName.value = user.name || '';
        profileEmail.value = user.email || '';
        profilePhone.value = user.phone || '';
        profileBirthday.value = user.birthday || '';
        profileBio.value = user.bio || '';
        
        // Load initial data for sections
        loadOrdersData();
        loadWishlist();
        loadAddresses();
    }
    
    async function loadOrdersData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                userOrders = await response.json();
                updateOrdersSummary();
                updateRecentOrdersTable();
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    function updateOrdersSummary() {
        if (!userOrders || userOrders.length === 0) {
            processingOrders.textContent = '0';
            shippedOrders.textContent = '0';
            deliveredOrders.textContent = '0';
            totalSpent.textContent = '$0';
            ordersCount.textContent = '0';
            return;
        }
        
        // Count orders by status
        const processing = userOrders.filter(o => o.orderStatus === 'Processing').length;
        const shipped = userOrders.filter(o => o.orderStatus === 'Shipped').length;
        const delivered = userOrders.filter(o => o.orderStatus === 'Delivered').length;
        
        // Calculate total spent
        const total = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Update UI
        processingOrders.textContent = processing;
        shippedOrders.textContent = shipped;
        deliveredOrders.textContent = delivered;
        totalSpent.textContent = `$${total.toFixed(2)}`;
        ordersCount.textContent = userOrders.length;
    }
    
    function updateRecentOrdersTable() {
        if (!userOrders || userOrders.length === 0) {
            recentOrdersTable.innerHTML = `
                <p class="no-orders">No orders found</p>
            `;
            return;
        }
        
        // Sort by date (newest first) and take first 5
        const recentOrders = [...userOrders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        recentOrders.forEach(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            tableHTML += `
                <tr>
                    <td>#${order._id.slice(-8).toUpperCase()}</td>
                    <td>${orderDate}</td>
                    <td>$${order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                        <span class="order-status-cell ${order.orderStatus.toLowerCase()}">
                            ${order.orderStatus}
                        </span>
                    </td>
                    <td>
                        <a href="order-details.html?id=${order._id}" class="btn-view-order">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        recentOrdersTable.innerHTML = tableHTML;
    }
    
    async function loadWishlist() {
        // TODO: Implement wishlist API
        // For now, use sample data
        userWishlist = [
            {
                id: 1,
                name: 'Wireless Headphones',
                price: 199.99,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
                category: 'Electronics'
            },
            {
                id: 2,
                name: 'Smart Watch',
                price: 299.99,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
                category: 'Electronics'
            }
        ];
        
        updateWishlistDisplay();
    }
    
    function updateWishlistDisplay() {
        if (!userWishlist || userWishlist.length === 0) {
            wishlistItems.style.display = 'none';
            emptyWishlist.style.display = 'block';
            wishlistCount.textContent = '0';
            return;
        }
        
        wishlistItems.style.display = 'grid';
        emptyWishlist.style.display = 'none';
        wishlistCount.textContent = userWishlist.length.toString();
        
        wishlistItems.innerHTML = '';
        userWishlist.forEach(item => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'wishlist-item';
            wishlistItem.innerHTML = `
                <button class="wishlist-remove-btn" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
                <div class="wishlist-item-info">
                    <h4 class="wishlist-item-title">${item.name}</h4>
                    <div class="wishlist-item-price">$${item.price.toFixed(2)}</div>
                    <div class="wishlist-item-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCartFromWishlist('${item.id}')">
                            Add to Cart
                        </button>
                        <a href="product-details.html?id=${item.id}" class="btn btn-outline btn-sm">
                            View
                        </a>
                    </div>
                </div>
            `;
            wishlistItems.appendChild(wishlistItem);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = btn.dataset.id;
                removeFromWishlist(itemId);
            });
        });
    }
    
    async function loadAddresses() {
        // TODO: Implement addresses API
        // For now, use sample data
        userAddresses = [
            {
                id: 1,
                type: 'home',
                name: 'John Doe',
                phone: '+1 (555) 123-4567',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA',
                isDefault: true
            },
            {
                id: 2,
                type: 'work',
                name: 'John Doe',
                phone: '+1 (555) 987-6543',
                street: '456 Office Ave',
                city: 'New York',
                state: 'NY',
                zip: '10002',
                country: 'USA',
                isDefault: false
            }
        ];
        
        updateAddressesDisplay();
    }
    
    function updateAddressesDisplay() {
        if (!userAddresses || userAddresses.length === 0) {
            addressesList.innerHTML = `
                <p class="no-addresses">No addresses saved yet.</p>
            `;
            return;
        }
        
        addressesList.innerHTML = '';
        userAddresses.forEach(address => {
            const addressCard = document.createElement('div');
            addressCard.className = `address-card ${address.isDefault ? 'default' : ''}`;
            addressCard.innerHTML = `
                <div class="address-header">
                    <span class="address-type ${address.type}">${address.type.charAt(0).toUpperCase() + address.type.slice(1)}</span>
                    <div class="address-actions">
                        <button class="edit-address-btn" data-id="${address.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-address-btn" data-id="${address.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="address-details">
                    <p><strong>${address.name}</strong></p>
                    <p>${address.street}</p>
                    <p>${address.city}, ${address.state} ${address.zip}</p>
                    <p>${address.country}</p>
                    <p>Phone: ${address.phone}</p>
                </div>
                ${address.isDefault ? '<div class="default-badge">Default Address</div>' : ''}
            `;
            addressesList.appendChild(addressCard);
        });
        
        // Add event listeners to address buttons
        document.querySelectorAll('.edit-address-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const addressId = btn.dataset.id;
                editAddress(addressId);
            });
        });
        
        document.querySelectorAll('.delete-address-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const addressId = btn.dataset.id;
                deleteAddress(addressId);
            });
        });
    }
    
    function editAddress(addressId) {
        const address = userAddresses.find(a => a.id == addressId);
        if (!address) return;
        
        isEditingAddress = true;
        editingAddressId = addressId;
        
        document.getElementById('addressModalTitle').textContent = 'Edit Address';
        document.getElementById('addressType').value = address.type;
        document.getElementById('addressName').value = address.name;
        document.getElementById('addressPhone').value = address.phone;
        document.getElementById('addressStreet').value = address.street;
        document.getElementById('addressCity').value = address.city;
        document.getElementById('addressState').value = address.state;
        document.getElementById('addressZip').value = address.zip;
        document.getElementById('addressCountry').value = address.country;
        document.getElementById('setAsDefault').checked = address.isDefault;
        document.getElementById('addressId').value = addressId;
        
        addressModal.style.display = 'flex';
    }
    
    function deleteAddress(addressId) {
        if (confirm('Are you sure you want to delete this address?')) {
            userAddresses = userAddresses.filter(a => a.id != addressId);
            updateAddressesDisplay();
            showNotification('Address deleted successfully', 'success');
        }
    }
    
    async function saveProfile(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            // TODO: Implement profile update API
            // For now, update localStorage
            const updatedUser = {
                ...currentUser,
                name: profileName.value,
                email: profileEmail.value,
                phone: profilePhone.value,
                birthday: profileBirthday.value,
                bio: profileBio.value
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            currentUser = updatedUser;
            
            // Update UI
            userName.textContent = updatedUser.name;
            userEmail.textContent = updatedUser.email;
            
            showNotification('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile', 'error');
        }
    }
    
    function resetProfileForm() {
        profileName.value = currentUser.name || '';
        profileEmail.value = currentUser.email || '';
        profilePhone.value = currentUser.phone || '';
        profileBirthday.value = currentUser.birthday || '';
        profileBio.value = currentUser.bio || '';
    }
    
    async function saveAddress(e) {
        e.preventDefault();
        
        const addressData = {
            type: document.getElementById('addressType').value,
            name: document.getElementById('addressName').value,
            phone: document.getElementById('addressPhone').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            state: document.getElementById('addressState').value,
            zip: document.getElementById('addressZip').value,
            country: document.getElementById('addressCountry').value,
            isDefault: document.getElementById('setAsDefault').checked
        };
        
        try {
            if (isEditingAddress && editingAddressId) {
                // Update existing address
                const index = userAddresses.findIndex(a => a.id == editingAddressId);
                if (index !== -1) {
                    userAddresses[index] = { ...addressData, id: editingAddressId };
                }
            } else {
                // Add new address
                const newId = userAddresses.length > 0 ? Math.max(...userAddresses.map(a => a.id)) + 1 : 1;
                userAddresses.push({ ...addressData, id: newId });
            }
            
            // If this is set as default, remove default from others
            if (addressData.isDefault) {
                userAddresses.forEach(a => {
                    if (a.id != editingAddressId) {
                        a.isDefault = false;
                    }
                });
            }
            
            updateAddressesDisplay();
            addressModal.style.display = 'none';
            showNotification(`Address ${isEditingAddress ? 'updated' : 'added'} successfully`, 'success');
            
        } catch (error) {
            console.error('Error saving address:', error);
            showNotification('Failed to save address', 'error');
        }
    }
    
    async function changePassword(e) {
        e.preventDefault();
        
        if (newPassword.value !== confirmPassword.value) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.value.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            // TODO: Implement password change API
            // For now, simulate success
            showNotification('Password updated successfully', 'success');
            resetPasswordForm();
            
        } catch (error) {
            console.error('Error changing password:', error);
            showNotification('Failed to change password', 'error');
        }
    }
    
    function resetPasswordForm() {
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    }
    
    function loadSessions() {
        // TODO: Implement sessions API
        // For now, show sample data
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = `
            <div class="session-item session-current">
                <div class="session-info">
                    <h4>Current Session</h4>
                    <p>Chrome on Windows • Active now</p>
                    <p>IP: 192.168.1.1 • Location: New York, USA</p>
                </div>
                <span class="session-badge">Current</span>
            </div>
            <div class="session-item">
                <div class="session-info">
                    <h4>Previous Session</h4>
                    <p>Safari on iPhone • 2 hours ago</p>
                    <p>IP: 192.168.1.2 • Location: New York, USA</p>
                </div>
                <button class="btn-logout-session">Logout</button>
            </div>
            <div class="session-item">
                <div class="session-info">
                    <h4>Older Session</h4>
                    <p>Firefox on Mac • 2 days ago</p>
                    <p>IP: 192.168.1.3 • Location: New York, USA</p>
                </div>
                <button class="btn-logout-session">Logout</button>
            </div>
        `;
    }
    
    function logoutAllSessions() {
        if (confirm('Logout from all other sessions? You will stay logged in on this device.')) {
            // TODO: Implement logout all sessions API
            showNotification('Logged out from all other sessions', 'success');
            sessionsModal.style.display = 'none';
        }
    }
    
    function resetNotificationSettings() {
        // Reset all toggles to default
        document.getElementById('emailOrderUpdates').checked = true;
        document.getElementById('emailPromotions').checked = true;
        document.getElementById('emailRecommendations').checked = false;
        document.getElementById('pushOrderAlerts').checked = true;
        document.getElementById('pushPriceDrops').checked = false;
        document.getElementById('pushBackInStock').checked = true;
        document.getElementById('twoFactorToggle').checked = false;
        document.getElementById('loginNotificationsToggle').checked = true;
        
        showNotification('Notification settings reset to default', 'success');
    }
    
    function saveNotificationSettings() {
        // TODO: Implement save notification settings API
        showNotification('Notification preferences saved', 'success');
    }
    
    function deleteAccount() {
        // TODO: Implement delete account API
        showNotification('Account deletion feature coming soon', 'info');
        deleteAccountModal.style.display = 'none';
    }
    
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
    
    // Global functions for wishlist
    window.addToCartFromWishlist = async function(productId) {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthModal();
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: 1
                })
            });
            
            if (response.ok) {
                const cart = await response.json();
                updateCartCount(cart.items?.length || 0);
                showNotification('Product added to cart from wishlist!', 'success');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add product to cart', 'error');
        }
    };
    
    window.removeFromWishlist = function(itemId) {
        userWishlist = userWishlist.filter(item => item.id != itemId);
        updateWishlistDisplay();
        showNotification('Removed from wishlist', 'success');
    };
    
    // Add some inline styles
    const style = document.createElement('style');
    style.textContent = `
        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }
        
        .btn-view-order {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .btn-view-order:hover {
            text-decoration: underline;
        }
        
        .no-orders,
        .no-addresses {
            text-align: center;
            padding: 2rem;
            color: var(--text-light);
        }
        
        .session-badge {
            padding: 0.25rem 0.75rem;
            background-color: var(--success-color);
            color: white;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
});
// Order History Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthModal();
        // Redirect to home after showing modal
        setTimeout(() => {
            if (!localStorage.getItem('token')) {
                window.location.href = '../index.html';
            }
        }, 3000);
        return;
    }
    
    // DOM Elements
    const ordersList = document.getElementById('ordersList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noOrders = document.getElementById('noOrders');
    const pagination = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const dateRange = document.getElementById('dateRange');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const applyDateRange = document.getElementById('applyDateRange');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const modalOrderDetails = document.getElementById('modalOrderDetails');
    
    // State
    let orders = [];
    let currentPage = 1;
    let totalPages = 1;
    let filters = {
        status: '',
        startDate: null,
        endDate: null
    };
    
    // Initialize
    loadOrders();
    setupEventListeners();
    
    // Event Listeners
    function setupEventListeners() {
        // Filter changes
        statusFilter.addEventListener('change', () => {
            filters.status = statusFilter.value;
            currentPage = 1;
            loadOrders();
        });
        
        dateFilter.addEventListener('change', () => {
            const value = dateFilter.value;
            
            if (value === 'custom') {
                dateRange.style.display = 'flex';
            } else {
                dateRange.style.display = 'none';
                
                if (value) {
                    const days = parseInt(value);
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - days);
                    
                    filters.startDate = start;
                    filters.endDate = end;
                } else {
                    filters.startDate = null;
                    filters.endDate = null;
                }
                
                currentPage = 1;
                loadOrders();
            }
        });
        
        // Apply custom date range
        applyDateRange.addEventListener('click', () => {
            if (startDate.value && endDate.value) {
                filters.startDate = new Date(startDate.value);
                filters.endDate = new Date(endDate.value);
                filters.endDate.setHours(23, 59, 59, 999); // End of day
                
                currentPage = 1;
                loadOrders();
            }
        });
        
        // Pagination
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadOrders();
            }
        });
        
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadOrders();
            }
        });
        
        // Modal close
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                orderDetailsModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        orderDetailsModal.addEventListener('click', (e) => {
            if (e.target === orderDetailsModal) {
                orderDetailsModal.style.display = 'none';
            }
        });
    }
    
    // Functions
    async function loadOrders() {
        showLoading();
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', 10);
            
            if (filters.status) {
                params.append('status', filters.status);
            }
            
            if (filters.startDate) {
                params.append('startDate', filters.startDate.toISOString());
            }
            
            if (filters.endDate) {
                params.append('endDate', filters.endDate.toISOString());
            }
            
            const response = await fetch(`${API_BASE_URL}/orders/my-orders?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load orders');
            }
            
            orders = await response.json();
            displayOrders();
            
            // For now, simulate pagination with local data
            // In a real app, the API would return pagination metadata
            totalPages = Math.ceil(orders.length / 10) || 1;
            updatePagination();
            
        } catch (error) {
            console.error('Error loading orders:', error);
            showNoOrders('Unable to load orders. Please try again.');
        }
    }
    
    function displayOrders() {
        ordersList.innerHTML = '';
        
        if (!orders || orders.length === 0) {
            showNoOrders();
            return;
        }
        
        // Hide loading and no orders messages
        loadingIndicator.style.display = 'none';
        noOrders.style.display = 'none';
        ordersList.style.display = 'flex';
        
        // Display orders (show only 10 per page for now)
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const displayedOrders = orders.slice(startIndex, endIndex);
        
        displayedOrders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        });
    }
    
    function createOrderCard(order) {
        const orderCard = document.createElement('div');
        orderCard.className = `order-card ${order.orderStatus.toLowerCase()}`;
        
        // Format date
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate item count and get first few items for preview
        const itemCount = order.items?.length || 0;
        const previewItems = order.items?.slice(0, 3) || [];
        
        // Generate item images HTML
        let itemsPreviewHTML = '<div class="item-images">';
        previewItems.forEach((item, index) => {
            itemsPreviewHTML += `
                <img src="${item.product?.image || 'https://via.placeholder.com/40'}" 
                     alt="${item.name || 'Item'}" 
                     class="item-image"
                     title="${item.name || 'Item'}">
            `;
        });
        
        if (itemCount > 3) {
            itemsPreviewHTML += `
                <div class="more-items" title="${itemCount - 3} more items">
                    +${itemCount - 3}
                </div>
            `;
        }
        itemsPreviewHTML += '</div>';
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order._id.slice(-8).toUpperCase()}</h3>
                    <div class="order-date">${formattedDate}</div>
                </div>
                <div class="order-status ${order.orderStatus.toLowerCase()}">
                    ${order.orderStatus}
                </div>
            </div>
            
            <div class="order-details">
                <div class="detail-item">
                    <span class="detail-label">Total Amount</span>
                    <span class="detail-value">$${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Items</span>
                    <span class="detail-value">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment</span>
                    <span class="detail-value">${order.paymentMethod || 'Credit Card'}</span>
                </div>
            </div>
            
            <div class="order-items-preview">
                ${itemsPreviewHTML}
                <div class="order-actions">
                    <button class="btn btn-outline view-order-btn" data-order-id="${order._id}">
                        View Details
                    </button>
                    ${order.orderStatus === 'Delivered' ? `
                    <button class="btn btn-outline reorder-btn" data-order-id="${order._id}">
                        Reorder
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        orderCard.querySelector('.view-order-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showOrderDetails(order._id);
        });
        
        if (order.orderStatus === 'Delivered') {
            orderCard.querySelector('.reorder-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                reorderItems(order._id);
            });
        }
        
        // Make entire card clickable to view details
        orderCard.addEventListener('click', () => {
            showOrderDetails(order._id);
        });
        
        return orderCard;
    }
    
    async function showOrderDetails(orderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load order details');
            }
            
            const order = await response.json();
            displayOrderDetails(order);
            orderDetailsModal.style.display = 'flex';
            
        } catch (error) {
            console.error('Error loading order details:', error);
            showNotification('Unable to load order details', 'error');
        }
    }
    
    function displayOrderDetails(order) {
        // Format dates
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate estimated delivery date (5 days after order)
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Build order items HTML
        let orderItemsHTML = '';
        order.items?.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            orderItemsHTML += `
                <div class="modal-order-item">
                    <img src="${item.product?.image || 'https://via.placeholder.com/60'}" 
                         alt="${item.name || 'Product'}" 
                         class="modal-item-image">
                    <div class="modal-item-details">
                        <h4>${item.name || 'Product'}</h4>
                        <p>Quantity: ${item.quantity || 1}</p>
                        <p>Price: $${(item.price || 0).toFixed(2)} each</p>
                    </div>
                    <div class="modal-item-price">$${itemTotal.toFixed(2)}</div>
                </div>
            `;
        });
        
        // Calculate summary
        const subtotal = order.totalAmount - (order.tax || 0) - (order.shippingFee || 0);
        
        modalOrderDetails.innerHTML = `
            <div class="modal-order-details">
                <div class="modal-order-header">
                    <div>
                        <h3>Order #${order._id.slice(-8).toUpperCase()}</h3>
                        <p>Placed on ${formattedDate}</p>
                    </div>
                    <div class="order-status ${order.orderStatus.toLowerCase()}">
                        ${order.orderStatus}
                    </div>
                </div>
                
                <div class="modal-order-summary">
                    <h4>Order Summary</h4>
                    <div class="modal-summary-row">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    ${order.tax ? `
                    <div class="modal-summary-row">
                        <span>Tax</span>
                        <span>$${order.tax.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${order.shippingFee ? `
                    <div class="modal-summary-row">
                        <span>Shipping</span>
                        <span>$${order.shippingFee.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="modal-summary-row total">
                        <span>Total</span>
                        <span>$${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
                
                <div class="modal-order-items">
                    <h4>Order Items (${order.items?.length || 0})</h4>
                    ${orderItemsHTML || '<p>No items found</p>'}
                </div>
                
                <div class="modal-shipping-info">
                    <div class="modal-info-section">
                        <h4>Shipping Address</h4>
                        ${order.shippingAddress ? `
                            <p><strong>${order.shippingAddress.name || 'Customer'}</strong></p>
                            ${order.shippingAddress.street ? `<p>${order.shippingAddress.street}</p>` : ''}
                            ${order.shippingAddress.city ? `<p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>` : ''}
                            ${order.shippingAddress.country ? `<p>${order.shippingAddress.country}</p>` : ''}
                        ` : '<p>No shipping address provided</p>'}
                    </div>
                    
                    <div class="modal-info-section">
                        <h4>Delivery Information</h4>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Credit Card'}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus || 'Paid'}</p>
                        <p><strong>Estimated Delivery:</strong> ${formattedDeliveryDate}</p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Receipt
                    </button>
                    ${order.orderStatus === 'Delivered' ? `
                    <button class="btn btn-secondary" id="modalReorderBtn" data-order-id="${order._id}">
                        <i class="fas fa-redo"></i> Reorder All Items
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listener to reorder button in modal
        const modalReorderBtn = document.getElementById('modalReorderBtn');
        if (modalReorderBtn) {
            modalReorderBtn.addEventListener('click', () => {
                reorderItems(order._id);
            });
        }
    }
    
    async function reorderItems(orderId) {
        try {
            // Get order details
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load order for reorder');
            }
            
            const order = await response.json();
            
            // Add all items to cart
            let addedCount = 0;
            for (const item of order.items) {
                try {
                    const addResponse = await fetch(`${API_BASE_URL}/cart/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            productId: item.product?._id,
                            quantity: item.quantity || 1
                        })
                    });
                    
                    if (addResponse.ok) {
                        addedCount++;
                    }
                } catch (error) {
                    console.error('Error adding item to cart:', error);
                }
            }
            
            if (addedCount > 0) {
                showNotification(`${addedCount} item${addedCount !== 1 ? 's' : ''} added to cart!`, 'success');
                updateCartCount();
                setTimeout(() => {
                    window.location.href = '../cart.html';
                }, 1500);
            } else {
                showNotification('No items could be added to cart', 'error');
            }
            
        } catch (error) {
            console.error('Error reordering:', error);
            showNotification('Unable to reorder items', 'error');
        }
    }
    
    function updatePagination() {
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }
    
    function showLoading() {
        loadingIndicator.style.display = 'block';
        noOrders.style.display = 'none';
        ordersList.style.display = 'none';
        pagination.style.display = 'none';
    }
    
    function showNoOrders(message) {
        loadingIndicator.style.display = 'none';
        ordersList.style.display = 'none';
        
        if (message) {
            noOrders.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Something went wrong</h3>
                <p>${message}</p>
            `;
        }
        
        noOrders.style.display = 'block';
        pagination.style.display = 'none';
    }
    
    // Add some inline styles
    const style = document.createElement('style');
    style.textContent = `
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }
        
        .modal-actions .btn {
            flex: 1;
        }
        
        @media (max-width: 768px) {
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
});
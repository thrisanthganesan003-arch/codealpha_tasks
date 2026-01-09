// Order Confirmation Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        // Try to get from localStorage (if coming from checkout)
        const lastOrderId = localStorage.getItem('lastOrderId');
        if (lastOrderId) {
            loadOrder(lastOrderId);
        } else {
            window.location.href = '../index.html';
        }
    } else {
        loadOrder(orderId);
        // Save to localStorage for future reference
        localStorage.setItem('lastOrderId', orderId);
    }
    
    // DOM Elements
    const orderNumber = document.getElementById('orderNumber');
    const customerEmail = document.getElementById('customerEmail');
    const orderDate = document.getElementById('orderDate');
    const orderTotal = document.getElementById('orderTotal');
    const paymentMethod = document.getElementById('paymentMethod');
    const orderStatus = document.getElementById('orderStatus');
    const deliveryDate = document.getElementById('deliveryDate');
    const orderItems = document.getElementById('orderItems');
    const shippingAddress = document.getElementById('shippingAddress');
    const billingAddress = document.getElementById('billingAddress');
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    
    // Event Listeners
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    // Functions
    async function loadOrder(id) {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthModal();
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Order not found');
            }
            
            const order = await response.json();
            displayOrder(order);
        } catch (error) {
            console.error('Error loading order:', error);
            showNotification('Unable to load order details', 'error');
            setTimeout(() => {
                window.location.href = 'order-history.html';
            }, 2000);
        }
    }
    
    function displayOrder(order) {
        // Order number (use last 8 characters of ID)
        orderNumber.textContent = order._id.slice(-8).toUpperCase();
        
        // Customer email (from user data)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        customerEmail.textContent = user.email || 'your email';
        
        // Order date
        const orderDateObj = new Date(order.createdAt);
        orderDate.textContent = orderDateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Order total
        orderTotal.textContent = `$${order.totalAmount.toFixed(2)}`;
        
        // Payment method
        paymentMethod.textContent = order.paymentMethod || 'Credit Card';
        
        // Order status
        orderStatus.textContent = order.orderStatus;
        orderStatus.className = `status-badge ${order.orderStatus.toLowerCase()}`;
        
        // Delivery date (estimate: 3-7 business days from order date)
        const deliveryDateObj = new Date(orderDateObj);
        deliveryDateObj.setDate(deliveryDateObj.getDate() + 5); // 5 days for standard shipping
        deliveryDate.textContent = deliveryDateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Order items
        displayOrderItems(order.items);
        
        // Shipping address
        if (order.shippingAddress) {
            const address = order.shippingAddress;
            shippingAddress.innerHTML = `
                <p><strong>${user.name || 'Customer'}</strong></p>
                ${address.street ? `<p>${address.street}</p>` : ''}
                ${address.city ? `<p>${address.city}, ${address.state} ${address.zipCode}</p>` : ''}
                ${address.country ? `<p>${address.country}</p>` : ''}
                ${user.phone ? `<p>Phone: ${user.phone}</p>` : ''}
            `;
        } else {
            shippingAddress.innerHTML = '<p>No shipping address provided</p>';
        }
        
        // Billing address (same as shipping for now)
        billingAddress.textContent = 'Same as shipping address';
    }
    
    function displayOrderItems(items) {
        orderItems.innerHTML = '';
        
        if (!items || items.length === 0) {
            orderItems.innerHTML = '<p class="no-items">No items in this order</p>';
            return;
        }
        
        items.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            
            // Calculate total for this item
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            
            orderItem.innerHTML = `
                <img src="${item.product?.image || 'https://via.placeholder.com/80'}" 
                     alt="${item.name || 'Product'}" 
                     class="order-item-image">
                <div class="order-item-details">
                    <h4>${item.name || 'Product'}</h4>
                    <p>${item.product?.category || 'General'}</p>
                    <div class="order-item-quantity">Quantity: ${item.quantity || 1}</div>
                </div>
                <div class="order-item-price">$${itemTotal.toFixed(2)}</div>
            `;
            orderItems.appendChild(orderItem);
        });
        
        // Add order summary row
        const orderSummary = document.createElement('div');
        orderSummary.className = 'order-item summary-row';
        
        // Get order from localStorage to calculate totals
        const order = JSON.parse(localStorage.getItem('lastOrder') || '{}');
        const subtotal = order.totalAmount - (order.tax || 0) - (order.shippingFee || 0);
        
        orderSummary.innerHTML = `
            <div style="flex: 1;"></div>
            <div class="order-summary-details">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${order.tax ? `
                <div class="summary-row">
                    <span>Tax:</span>
                    <span>$${order.tax.toFixed(2)}</span>
                </div>
                ` : ''}
                ${order.shippingFee ? `
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$${order.shippingFee.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
            </div>
        `;
        orderItems.appendChild(orderSummary);
    }
    
    // Add some inline styles
    const style = document.createElement('style');
    style.textContent = `
        .no-items {
            text-align: center;
            padding: 2rem;
            color: var(--text-light);
        }
        
        .summary-row {
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .summary-row:last-child {
            border-bottom: none;
        }
        
        .order-summary-details {
            text-align: right;
            min-width: 200px;
        }
        
        .summary-row.total {
            font-weight: bold;
            font-size: 1.1rem;
            color: var(--primary-color);
            border-top: 2px solid var(--border-color);
            margin-top: 0.5rem;
            padding-top: 1rem;
        }
        
        .summary-row span:first-child {
            margin-right: 1rem;
            color: var(--text-light);
        }
    `;
    document.head.appendChild(style);
});
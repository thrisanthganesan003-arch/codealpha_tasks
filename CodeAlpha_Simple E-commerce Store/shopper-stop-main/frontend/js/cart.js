// Cart page functionality
document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartContainer');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Load cart
    loadCart();
    
    // Checkout button click
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (typeof showAuthModal === 'function') {
                    showAuthModal();
                }
                return;
            }
            if (checkoutModal) {
                checkoutModal.style.display = 'flex';
            }
        });
    }
    
    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (checkoutModal) {
                checkoutModal.style.display = 'none';
            }
        });
    });
    
    // Place order
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const shippingAddress = {
                street: document.getElementById('shippingStreet').value,
                city: document.getElementById('shippingCity').value,
                state: document.getElementById('shippingState').value,
                zipCode: document.getElementById('shippingZip').value,
                country: document.getElementById('shippingCountry').value
            };
            
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ shippingAddress, paymentMethod })
                });
                
                if (response.ok) {
                    const order = await response.json();
                    if (checkoutModal) {
                        checkoutModal.style.display = 'none';
                    }
                    if (typeof showNotification === 'function') {
                        showNotification('Order placed successfully!', 'success');
                    }
                    // Redirect to order confirmation page
                    setTimeout(() => {
                        window.location.href = `order-confirmation.html?id=${order._id}`;
                    }, 1500);
                } else {
                    throw new Error('Failed to place order');
                }
            } catch (error) {
                console.error('Error placing order:', error);
                if (typeof showNotification === 'function') {
                    showNotification('Failed to place order', 'error');
                }
            }
        });
    }
    
    async function loadCart() {
        const token = localStorage.getItem('token');
        if (!token) {
            showEmptyCart();
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const cart = await response.json();
                if (cart.items && cart.items.length > 0) {
                    displayCartItems(cart);
                } else {
                    showEmptyCart();
                }
            } else {
                showEmptyCart();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            showEmptyCart();
        }
    }
    
    function displayCartItems(cart) {
        if (!emptyCart || !cartContent || !cartItems) return;
        
        emptyCart.style.display = 'none';
        cartContent.style.display = 'flex';
        
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        cart.items.forEach(item => {
            const product = item.product;
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <p>${product.category}</p>
                    <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-action="decrease" data-id="${item._id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-id="${item._id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" data-id="${item._id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Update summary
        const shipping = subtotal > 50 ? 0 : 10;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;
        
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        
        // Add event listeners
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', handleQuantityChange);
        });
        
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', handleRemoveItem);
        });
    }
    
    function showEmptyCart() {
        if (!emptyCart || !cartContent) return;
        
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
    }
    
    async function handleQuantityChange(e) {
        const itemId = e.target.closest('.quantity-btn').dataset.id;
        const action = e.target.closest('.quantity-btn').dataset.action;
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            // First get current quantity
            const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (cartResponse.ok) {
                const cart = await cartResponse.json();
                const item = cart.items.find(item => item._id === itemId);
                if (item) {
                    let newQuantity = item.quantity;
                    
                    if (action === 'increase') {
                        newQuantity += 1;
                    } else if (action === 'decrease' && newQuantity > 1) {
                        newQuantity -= 1;
                    }
                    
                    // Update quantity
                    const updateResponse = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ quantity: newQuantity })
                    });
                    
                    if (updateResponse.ok) {
                        loadCart();
                        if (typeof updateCartCount === 'function') {
                            updateCartCount();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }
    
    async function handleRemoveItem(e) {
        const itemId = e.target.closest('.cart-item-remove').dataset.id;
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                loadCart();
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }
                if (typeof showNotification === 'function') {
                    showNotification('Item removed from cart', 'success');
                }
            }
        } catch (error) {
            console.error('Error removing item:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to remove item', 'error');
            }
        }
    }
});
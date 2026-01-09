// Product Details Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = '../products.html';
        return;
    }
    
    // DOM Elements
    const productTitle = document.getElementById('productTitle');
    const productCategory = document.getElementById('productCategory');
    const productName = document.getElementById('productName');
    const mainProductImage = document.getElementById('mainProductImage');
    const imageThumbnails = document.getElementById('imageThumbnails');
    const productRating = document.getElementById('productRating');
    const reviewCount = document.getElementById('reviewCount');
    const productSKU = document.getElementById('productSKU');
    const stockStatus = document.getElementById('stockStatus');
    const currentPrice = document.getElementById('currentPrice');
    const originalPrice = document.getElementById('originalPrice');
    const discountBadge = document.getElementById('discountBadge');
    const productDescription = document.getElementById('productDescription');
    const fullDescription = document.getElementById('fullDescription');
    const productSpecifications = document.getElementById('productSpecifications');
    const specsTable = document.getElementById('specsTable');
    const relatedProducts = document.getElementById('relatedProducts');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const productQuantity = document.getElementById('productQuantity');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const successModal = document.getElementById('successModal');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const viewCartBtn = document.getElementById('viewCartBtn');
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabContents = document.querySelectorAll('.tab-content');
    const starRating = document.querySelectorAll('.star-rating i');
    const userRating = document.getElementById('userRating');
    const reviewForm = document.getElementById('reviewForm');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const addReviewSection = document.getElementById('addReviewSection');
    const reviewsList = document.getElementById('reviewsList');
    const overallRating = document.getElementById('overallRating');
    const totalReviews = document.getElementById('totalReviews');
    const reviewsCount = document.getElementById('reviewsCount');
    
    let currentProduct = null;
    let userReviewRating = 0;
    
    // Load product data
    loadProduct(productId);
    
    // Event Listeners
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(productQuantity.value);
            if (currentValue > 1) {
                productQuantity.value = currentValue - 1;
            }
        });
    }
    
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(productQuantity.value);
            const maxStock = currentProduct ? currentProduct.stock : 99;
            if (currentValue < maxStock) {
                productQuantity.value = currentValue + 1;
            }
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', addToWishlist);
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
            window.location.href = '../products.html';
        });
    }
    
    // Tab switching
    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const tab = header.dataset.tab;
            
            // Update active tab header
            tabHeaders.forEach(h => h.classList.remove('active'));
            header.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tab}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Star rating for reviews
    starRating.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            userReviewRating = rating;
            userRating.value = rating;
            
            // Update star display
            starRating.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            starRating.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                }
            });
        });
        
        star.addEventListener('mouseout', () => {
            starRating.forEach(s => {
                const starRating = parseInt(s.dataset.rating);
                if (starRating > userReviewRating) {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
    
    // Review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', submitReview);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    // Functions
    async function loadProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            
            currentProduct = await response.json();
            displayProduct(currentProduct);
            loadRelatedProducts(currentProduct.category, id);
            checkAuthForReview();
        } catch (error) {
            console.error('Error loading product:', error);
            showNotification('Product not found', 'error');
            setTimeout(() => {
                window.location.href = '../products.html';
            }, 2000);
        }
    }
    
    function displayProduct(product) {
        // Basic info
        productTitle.textContent = product.name;
        productName.textContent = product.name;
        productCategory.textContent = product.category;
        productCategory.href = `../products.html?category=${product.category}`;
        
        // Images
        mainProductImage.src = product.image;
        mainProductImage.alt = product.name;
        
        // Create thumbnails (for now just one image)
        imageThumbnails.innerHTML = `
            <div class="thumbnail active" data-image="${product.image}">
                <img src="${product.image}" alt="${product.name}">
            </div>
        `;
        
        // Add multiple image support if available
        if (product.images && product.images.length > 0) {
            product.images.forEach((img, index) => {
                if (index > 0) { // Skip first as it's already added
                    const thumbnail = document.createElement('div');
                    thumbnail.className = 'thumbnail';
                    thumbnail.dataset.image = img;
                    thumbnail.innerHTML = `<img src="${img}" alt="${product.name}">`;
                    thumbnail.addEventListener('click', () => {
                        mainProductImage.src = img;
                        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                        thumbnail.classList.add('active');
                    });
                    imageThumbnails.appendChild(thumbnail);
                }
            });
        }
        
        // Rating
        const ratingStars = generateStarRating(product.rating);
        productRating.innerHTML = ratingStars;
        
        // Review count
        const reviews = product.reviews || [];
        reviewCount.textContent = `${reviews.length} reviews`;
        reviewsCount.textContent = reviews.length;
        
        // SKU (generate from ID)
        productSKU.textContent = `PROD-${product._id.slice(-8).toUpperCase()}`;
        
        // Stock status
        if (product.stock > 10) {
            stockStatus.textContent = 'In Stock';
            stockStatus.className = 'stock-status in-stock';
        } else if (product.stock > 0) {
            stockStatus.textContent = `Only ${product.stock} left`;
            stockStatus.className = 'stock-status in-stock';
        } else {
            stockStatus.textContent = 'Out of Stock';
            stockStatus.className = 'stock-status out-of-stock';
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-ban"></i> Out of Stock';
        }
        
        // Price
        currentPrice.textContent = `$${product.price.toFixed(2)}`;
        
        // Original price and discount (if applicable)
        if (product.originalPrice && product.originalPrice > product.price) {
            const discount = Math.round((1 - product.price / product.originalPrice) * 100);
            originalPrice.textContent = `$${product.originalPrice.toFixed(2)}`;
            discountBadge.textContent = `-${discount}%`;
            discountBadge.style.display = 'inline-block';
        } else {
            originalPrice.style.display = 'none';
            discountBadge.style.display = 'none';
        }
        
        // Description
        productDescription.textContent = product.description;
        fullDescription.innerHTML = `<p>${product.description}</p>`;
        
        // Specifications
        const specs = product.specifications || generateDefaultSpecs(product);
        displaySpecifications(specs);
        
        // Reviews
        displayReviews(reviews);
    }
    
    function generateDefaultSpecs(product) {
        return [
            { label: 'Category', value: product.category },
            { label: 'Brand', value: 'Shopper Stop' },
            { label: 'Model', value: product.name.split(' ')[0] || 'Standard' },
            { label: 'Weight', value: '1.5 kg' },
            { label: 'Dimensions', value: '10 x 5 x 3 cm' },
            { label: 'Color', value: 'Black' },
            { label: 'Material', value: 'Premium Materials' },
            { label: 'Warranty', value: '2 Years' }
        ];
    }
    
    function displaySpecifications(specs) {
        // For product info section
        productSpecifications.innerHTML = '';
        specs.slice(0, 3).forEach(spec => {
            const specItem = document.createElement('div');
            specItem.className = 'spec-item';
            specItem.innerHTML = `
                <span class="spec-label">${spec.label}:</span>
                <span class="spec-value">${spec.value}</span>
            `;
            productSpecifications.appendChild(specItem);
        });
        
        // For specifications tab
        specsTable.innerHTML = '';
        specs.forEach(spec => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${spec.label}</td>
                <td>${spec.value}</td>
            `;
            specsTable.appendChild(row);
        });
    }
    
    function displayReviews(reviews) {
        reviewsList.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-alt"></i>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this product!</p>
                </div>
            `;
            return;
        }
        
        // Calculate average rating
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        overallRating.textContent = avgRating.toFixed(1);
        totalReviews.textContent = `${reviews.length} reviews`;
        
        // Update rating stars in summary
        const ratingStarsContainer = document.querySelector('.overall-rating .rating-stars');
        ratingStarsContainer.innerHTML = generateStarRating(avgRating);
        
        // Calculate rating distribution
        const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
        reviews.forEach(review => {
            ratingCounts[review.rating]++;
        });
        
        // Display rating bars
        const ratingBars = document.querySelector('.rating-bars');
        ratingBars.innerHTML = '';
        for (let i = 5; i >= 1; i--) {
            const count = ratingCounts[i];
            const percentage = reviews.length > 0 ? (count / reviews.length * 100) : 0;
            
            const bar = document.createElement('div');
            bar.className = 'rating-bar';
            bar.innerHTML = `
                <div class="rating-label">${i} Star${i > 1 ? 's' : ''}</div>
                <div class="rating-progress">
                    <div class="rating-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="rating-count">${count}</div>
            `;
            ratingBars.appendChild(bar);
        }
        
        // Display reviews
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const date = new Date(review.date || review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <h4>${review.user}</h4>
                        <div class="review-date">${date}</div>
                    </div>
                    <div class="review-rating">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                </div>
            `;
            reviewsList.appendChild(reviewItem);
        });
    }
    
    async function loadRelatedProducts(category, excludeId) {
        try {
            const response = await fetch(`${API_BASE_URL}/products?category=${category}&limit=4`);
            const products = await response.json();
            
            // Filter out current product
            const related = products.filter(p => p._id !== excludeId).slice(0, 4);
            
            if (related.length > 0) {
                displayProducts(related, relatedProducts);
            } else {
                relatedProducts.innerHTML = `
                    <div class="no-related-products">
                        <p>No related products found</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading related products:', error);
            relatedProducts.innerHTML = `
                <div class="no-related-products">
                    <p>Unable to load related products</p>
                </div>
            `;
        }
    }
    
    async function addToCart() {
        if (!currentProduct) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthModal();
            return;
        }
        
        const quantity = parseInt(productQuantity.value);
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: currentProduct._id,
                    quantity: quantity
                })
            });
            
            if (response.ok) {
                const cart = await response.json();
                updateCartCount(cart.items?.length || 0);
                showSuccessModal('Added to Cart!', `${quantity} × ${currentProduct.name} has been added to your cart.`);
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add product to cart', 'error');
        }
    }
    
    function addToWishlist() {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthModal();
            return;
        }
        
        // TODO: Implement wishlist API
        showNotification('Added to wishlist!', 'success');
        
        // Visual feedback
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> In Wishlist';
        wishlistBtn.classList.add('added');
        setTimeout(() => {
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
            wishlistBtn.classList.remove('added');
        }, 2000);
    }
    
    function showSuccessModal(title, message) {
        successTitle.textContent = title;
        successMessage.textContent = message;
        successModal.style.display = 'flex';
    }
    
    function checkAuthForReview() {
        const token = localStorage.getItem('token');
        if (token) {
            addReviewSection.style.display = 'block';
        } else {
            addReviewSection.style.display = 'none';
        }
    }
    
    async function submitReview(e) {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthModal();
            return;
        }
        
        const rating = parseInt(userRating.value);
        const comment = document.getElementById('reviewComment').value.trim();
        
        if (rating === 0) {
            showNotification('Please select a rating', 'error');
            return;
        }
        
        if (!comment) {
            showNotification('Please write a review comment', 'error');
            return;
        }
        
        try {
            // TODO: Implement review submission API
            // For now, simulate success
            showNotification('Review submitted successfully!', 'success');
            
            // Reset form
            userRating.value = '0';
            document.getElementById('reviewComment').value = '';
            starRating.forEach(star => {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            });
            userReviewRating = 0;
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Failed to submit review', 'error');
        }
    }
    
    // Helper function for star rating
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
    
    // Add some inline styles for dynamic elements
    const style = document.createElement('style');
    style.textContent = `
        .btn-wishlist.added {
            background-color: var(--success-color);
            color: white;
            border-color: var(--success-color);
        }
        
        .no-reviews {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }
        
        .no-reviews i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--border-color);
        }
        
        .no-reviews h3 {
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .no-related-products {
            text-align: center;
            padding: 2rem;
            color: var(--text-light);
            grid-column: 1 / -1;
        }
    `;
    document.head.appendChild(style);
});
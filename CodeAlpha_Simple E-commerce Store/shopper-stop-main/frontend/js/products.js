// Products page functionality
document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noProducts = document.getElementById('noProducts');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceRange = document.getElementById('priceRange');
    const sortBy = document.getElementById('sortBy');
    
    let products = [];
    let isLoading = false;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    // Initialize filters from URL
    if (categoryParam) {
        categoryFilter.value = categoryParam;
    }
    
    // Load products
    loadProducts();
    
    // Filter event listeners
    categoryFilter.addEventListener('change', loadProducts);
    priceRange.addEventListener('change', loadProducts);
    sortBy.addEventListener('change', loadProducts);
    
    async function loadProducts() {
        if (isLoading) return;
        
        isLoading = true;
        loadingIndicator.style.display = 'block';
        noProducts.style.display = 'none';
        productsGrid.innerHTML = '';
        
        try {
            // Build query string
            const params = new URLSearchParams();
            
            if (categoryFilter.value) {
                params.append('category', categoryFilter.value);
            }
            
            if (priceRange.value) {
                const [min, max] = priceRange.value.split('-');
                if (min) params.append('minPrice', min);
                if (max) params.append('maxPrice', max);
            }
            
            if (sortBy.value) {
                params.append('sort', sortBy.value);
            }
            
            if (searchParam) {
                // Note: You'll need to implement search on backend
                // For now, we'll just show all products
                document.getElementById('searchInput').value = searchParam;
            }
            
            const response = await fetch(`${API_BASE_URL}/products?${params}`);
            products = await response.json();
            
            if (products.length === 0) {
                noProducts.style.display = 'block';
            } else {
                displayProducts(products, productsGrid);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            noProducts.style.display = 'block';
            noProducts.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading products</h3>
                <p>Please try again later</p>
            `;
        } finally {
            isLoading = false;
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Add styles for filters
    const style = document.createElement('style');
    style.textContent = `
        .filters {
            display: flex;
            gap: 1rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }
        
        .filter-group {
            flex: 1;
            min-width: 200px;
        }
        
        .filter-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-color);
        }
        
        .filter-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius);
            font-size: 1rem;
            background-color: var(--bg-color);
            color: var(--text-color);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .filter-group select:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .loading {
            text-align: center;
            padding: 3rem;
            color: var(--text-light);
        }
        
        .loading i {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .no-products {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-light);
        }
        
        .no-products i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--border-color);
        }
        
        .no-products h3 {
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
    `;
    document.head.appendChild(style);
});
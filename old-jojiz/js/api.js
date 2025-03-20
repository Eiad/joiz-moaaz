// API Service for Jojiz E-commerce
const API_BASE_URL = 'https://adminjojiz.jojiz.net';

// Authentication Service
const AuthService = {
    // Login user
    login: async (identifier, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier,
                    password
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message, data: null };
            }
            
            // Store user data and token in localStorage
            localStorage.setItem('jojiz-user', JSON.stringify(data.user));
            localStorage.setItem('jojiz-token', data.jwt);
            
            return { success: true, message: 'Login successful', data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Register user
    register: async (username, email, password, phone_number = null) => {
        try {
            const userData = {
                username,
                email,
                password
            };
            
            // Add phone number if provided
            if (phone_number) {
                userData.phone_number = phone_number;
            }
            
            const response = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message, data: null };
            }
            
            // Store user data and token in localStorage
            localStorage.setItem('jojiz-user', JSON.stringify(data.user));
            localStorage.setItem('jojiz-token', data.jwt);
            
            return { success: true, message: 'Registration successful', data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Update user phone number
    updateUserPhone: async (userId, phone_number) => {
        try {
            const token = AuthService.getToken();
            
            if (!token) {
                return { success: false, message: 'User not authenticated', data: null };
            }
            
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone_number
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message, data: null };
            }
            
            // Update user data in localStorage
            const currentUser = AuthService.getCurrentUser();
            currentUser.phone_number = phone_number;
            localStorage.setItem('jojiz-user', JSON.stringify(currentUser));
            
            return { success: true, message: 'Phone number updated successfully', data };
        } catch (error) {
            console.error('Update user phone error:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Logout user
    logout: () => {
        localStorage.removeItem('jojiz-user');
        localStorage.removeItem('jojiz-token');
        window.location.href = 'index.html';
    },
    
    // Check if user is logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('jojiz-token');
    },
    
    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('jojiz-user');
        return user ? JSON.parse(user) : null;
    },
    
    // Get auth token
    getToken: () => {
        return localStorage.getItem('jojiz-token');
    }
};

// Content Service
const ContentService = {
    // Helper function to get current language
    getCurrentLocale: () => {
        // Use the global getCurrentLanguage function if available
        if (typeof window.getCurrentLanguage === 'function') {
            return window.getCurrentLanguage();
        }
        
        // Fallback to HTML lang attribute
        const htmlLang = document.documentElement.getAttribute('lang');
        if (htmlLang) {
            return htmlLang;
        }
        
        // Default to Arabic
        return 'ar';
    },
    
    // Get banners
    getBanners: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching banners with locale: ${currentLocale}`);
            
            const response = await fetch(`${API_BASE_URL}/api/banners?populate=*&locale=${currentLocale}`);
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message, data: null };
            }
            
            return { success: true, data: data.data };
        } catch (error) {
            console.error('Error fetching banners:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get products
    getProducts: async (locale = null, page = 1, pageSize = 6) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching products: locale=${currentLocale}, page=${page}, pageSize=${pageSize}`);
            
            const url = `${API_BASE_URL}/api/products?populate=*&locale=${currentLocale}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
            console.log('API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw API response:', data);
            
            if (data.error) {
                console.error('API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || [],
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get categories
    getCategories: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching categories: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/categories?populate=*&locale=${currentLocale}`;
            console.log('Categories API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw categories API response:', data);
            
            if (data.error) {
                console.error('Categories API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Process the data to ensure documentId is available
            let processedData = data.data || [];
            
            // If we have data, ensure each category has documentId
            if (Array.isArray(processedData) && processedData.length > 0) {
                processedData = processedData.map(category => {
                    // If documentId is not available but id is, use id as documentId
                    if (!category.documentId && category.id) {
                        return { ...category, documentId: category.id.toString() };
                    }
                    return category;
                });
            }
            
            // Return the processed structure
            return { 
                success: true, 
                data: processedData,
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get special products
    getSpecialProducts: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching special products: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/special-product?locale=${currentLocale}`;
            console.log('Special Products API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw special products API response:', data);
            
            if (data.error) {
                console.error('Special products API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || {},
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching special products:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get month offer
    getMonthOffer: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching month offer: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/month-offer?populate[products][populate]=*&locale=${currentLocale}`;
            console.log('Month Offer API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw month offer API response:', data);
            
            if (data.error) {
                console.error('Month offer API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || {},
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching month offer:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get most popular products
    getMostPopularProducts: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching most popular products: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/most-buy?populate[products][populate]=*&locale=${currentLocale}`;
            console.log('Most Popular Products API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw most popular products API response:', data);
            
            if (data.error) {
                console.error('Most popular products API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || {},
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching most popular products:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get social media links
    getSocialMedia: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching social media links: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/social-media?locale=${currentLocale}`;
            console.log('Social Media API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw social media API response:', data);
            
            if (data.error) {
                console.error('Social media API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || {},
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching social media links:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get site settings
    getSettings: async (locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching site settings: locale=${currentLocale}`);
            
            const url = `${API_BASE_URL}/api/setting?populate=*&locale=${currentLocale}`;
            console.log('Settings API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw settings API response:', data);
            
            if (data.error) {
                console.error('Settings API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Return the exact structure from the API
            return { 
                success: true, 
                data: data.data || {},
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching site settings:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get products by category
    getProductsByCategory: async (categoryId, options = {}, locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching products for category ${categoryId}: locale=${currentLocale}`);
            
            // Build query parameters
            const params = new URLSearchParams();
            
            // Add locale
            params.append('locale', currentLocale);
            
            // Add category filter - check if it's a documentId format
            if (categoryId.includes('_') || categoryId.length > 10) {
                // It's likely a documentId
                params.append('filters[category][documentId][$eq]', categoryId);
            } else {
                // Try with regular id
                params.append('filters[category][id][$eq]', categoryId);
            }
            
            // Add pagination
            if (options.page) params.append('pagination[page]', options.page);
            if (options.pageSize) params.append('pagination[pageSize]', options.pageSize);
            
            // Add sorting
            if (options.sort) params.append('sort', options.sort);
            
            // Add populate
            params.append('populate', '*');
            
            const url = `${API_BASE_URL}/api/products?${params.toString()}`;
            console.log('Products by Category API URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Raw products by category API response:', data);
            
            if (data.error) {
                console.error('Products by category API returned error:', data.error);
                return { success: false, message: data.error.message, data: null };
            }
            
            // Process the data to make it consistent with other product endpoints
            let processedData = data.data || [];
            
            // If we have data with attributes structure, transform it to match the format used in index page
            if (processedData.length > 0 && processedData[0].attributes) {
                processedData = processedData.map(item => {
                    // Create a flattened object that combines id with attributes
                    const flatItem = {
                        id: item.id,
                        documentId: item.attributes.documentId || null,
                        ...item.attributes
                    };
                    
                    // Keep the original structure for reference if needed
                    flatItem._original = item;
                    
                    return flatItem;
                });
                
                console.log('Processed category products data:', processedData);
            }
            
            // Return the processed data
            return { 
                success: true, 
                data: processedData,
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    },
    
    // Get product details
    getProductDetails: async (productId, locale = null) => {
        try {
            // Use provided locale or get current locale
            const currentLocale = locale || ContentService.getCurrentLocale();
            console.log(`Fetching product details for product ${productId}: locale=${currentLocale}`);
            
            // First try to fetch by documentId
            let result = null;
            let error = null;
            
            // Try documentId approach first
            try {
                const documentIdUrl = `${API_BASE_URL}/api/products?filters[documentId][$eq]=${productId}&populate=*&locale=${currentLocale}`;
                console.log('Trying documentId URL:', documentIdUrl);
                
                const response = await fetch(documentIdUrl);
                const data = await response.json();
                
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    console.log('Found product by documentId');
                    result = data;
                } else {
                    console.log('No product found by documentId, will try regular ID');
                    error = new Error('Product not found by documentId');
                }
            } catch (err) {
                console.error('Error fetching by documentId:', err);
                error = err;
            }
            
            // If documentId approach failed, try regular ID
            if (!result) {
                try {
                    const regularIdUrl = `${API_BASE_URL}/api/products/${productId}?populate=*&locale=${currentLocale}`;
                    console.log('Trying regular ID URL:', regularIdUrl);
                    
                    const response = await fetch(regularIdUrl);
                    const data = await response.json();
                    
                    if (data.data) {
                        console.log('Found product by regular ID');
                        result = data;
                    } else {
                        console.log('No product found by regular ID either');
                        throw new Error('Product not found by any ID');
                    }
                } catch (err) {
                    console.error('Error fetching by regular ID:', err);
                    // If both approaches failed, throw the original error
                    throw error || err;
                }
            }
            
            console.log('Raw product details API response:', result);
            
            if (result.error) {
                console.error('Product details API returned error:', result.error);
                return { success: false, message: result.error.message, data: null };
            }
            
            // Handle different response formats
            let productData;
            if (Array.isArray(result.data) && result.data.length > 0) {
                // We used the filter endpoint, so we get an array
                productData = result.data[0];
            } else {
                // We used the direct endpoint
                productData = result.data;
            }
            
            // Process the data to make it consistent with other product endpoints
            if (productData && productData.attributes) {
                // Create a flattened object that combines id with attributes
                const flatItem = {
                    id: productData.id,
                    documentId: productData.attributes.documentId || productData.id,
                    ...productData.attributes
                };
                
                // Keep the original structure for reference if needed
                flatItem._original = productData;
                
                productData = flatItem;
                console.log('Processed product data:', productData);
            }
            
            // Return the processed data
            return { 
                success: true, 
                data: productData || {},
                meta: result.meta || null
            };
        } catch (error) {
            console.error('Error fetching product details:', error);
            return { success: false, message: 'Network error. Please try again.', data: null };
        }
    }
};

// Cart Service
const CartService = {
    // Initialize cart
    init: function() {
        // Define the storage key
        const CART_STORAGE_KEY = 'jojiz-cart';
        
        // Check if cart exists in localStorage
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        
        if (!cart) {
            // Create empty cart
            const emptyCart = {
                items: [],
                total: 0
            };
            
            // Save cart
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(emptyCart));
        }
        
        // Update cart UI
        CartService.updateCartUI();
        
        console.log('Cart initialized:', CartService.getCart());
        
        return CartService.getCart();
    },
    
    // Get cart
    getCart: function() {
        const CART_STORAGE_KEY = 'jojiz-cart';
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        if (!cart) {
            // Create empty cart
            const emptyCart = {
                items: [],
                total: 0
            };
            
            // Save cart
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(emptyCart));
            return emptyCart;
        }
        
        return JSON.parse(cart);
    },
    
    // Save cart
    saveCart: function(cart) {
        const CART_STORAGE_KEY = 'jojiz-cart';
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    },
    
    // Add item to cart
    addItem: async function(productId, quantity = 1) {
        try {
            // Try different API endpoints to get product details
            let product = null;
            
            // First try the Strapi API endpoint with documentId
            try {
                const response = await fetch(`${API_BASE_URL}/api/products?filters[documentId][$eq]=${productId}&populate=*`);
                const result = await response.json();
                
                console.log('Product details for cart (Strapi API by documentId):', result);
                
                if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                    // New API structure
                    const item = result.data[0];
                    const attrs = item.attributes || {};
                    
                    product = {
                        id: item.id,
                        documentId: attrs.documentId || item.id,
                        name: attrs.product_name || 'منتج بدون اسم',
                        price: parseFloat(attrs.product_price) || 0,
                        image: attrs.product_image ? 
                            (attrs.product_image.data ? 
                                API_BASE_URL + attrs.product_image.data.attributes.url : 
                                (attrs.product_image.url ? API_BASE_URL + attrs.product_image.url : '')) : ''
                    };
                }
            } catch (error) {
                console.error('Error fetching product from Strapi API by documentId:', error);
            }
            
            // If product not found, try by ID
            if (!product) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/products/${productId}?populate=*`);
                    const result = await response.json();
                    
                    console.log('Product details for cart (Strapi API by ID):', result);
                    
                    if (result.data) {
                        const item = result.data;
                        const attrs = item.attributes || {};
                        
                        product = {
                            id: item.id,
                            documentId: attrs.documentId || item.id,
                            name: attrs.product_name || 'منتج بدون اسم',
                            price: parseFloat(attrs.product_price) || 0,
                            image: attrs.product_image ? 
                                (attrs.product_image.data ? 
                                    API_BASE_URL + attrs.product_image.data.attributes.url : 
                                    (attrs.product_image.url ? API_BASE_URL + attrs.product_image.url : '')) : ''
                        };
                    }
                } catch (error) {
                    console.error('Error fetching product from Strapi API by ID:', error);
                }
            }
            
            // If product still not found, try the direct API
            if (!product) {
                try {
                    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                    const result = await response.json();
                    
                    console.log('Product details for cart (direct API):', result);
                    
                    if (result.success && result.data) {
                        product = result.data;
                    }
                } catch (error) {
                    console.error('Error fetching product from direct API:', error);
                }
            }
            
            // If product still not found, return error
            if (!product) {
                return { success: false, message: 'Product not found' };
            }
            
            console.log('Final product data for cart:', product);
            
            // Get current cart
            const cart = CartService.getCart();
            
            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
            
            if (existingItemIndex !== -1) {
                // Update quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // Add new item - handle both old and new API response structures
                const price = parseFloat(product.price || product.product_price || 0);
                
                cart.items.push({
                    productId: productId,
                    name: product.name || product.product_name || 'منتج بدون اسم',
                    price: price,
                    quantity: quantity,
                    image: product.images && product.images.length > 0 ? 
                        product.images[0] : 
                        (product.image ? product.image : 
                            (product.product_image ? 
                                (product.product_image.url ? API_BASE_URL + product.product_image.url : 
                                 (product.product_image.data && product.product_image.data.attributes ? 
                                  API_BASE_URL + product.product_image.data.attributes.url : '')) : ''))
                });
            }
            
            // Recalculate total
            cart.total = cart.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            
            console.log('Updated cart:', cart);
            
            // Save cart
            CartService.saveCart(cart);
            
            // Update cart UI
            CartService.updateCartUI();
            
            return { success: true, message: 'Item added to cart', cart: cart };
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return { success: false, message: 'Error adding item to cart', error: error.message };
        }
    },
    
    // Remove item from cart
    removeItem: function(productId) {
        // Get current cart
        const cart = CartService.getCart();
        
        // Find item
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) {
            return { success: false, message: 'Item not found in cart' };
        }
        
        // Remove item
        cart.items.splice(itemIndex, 1);
        
        // Recalculate total
        cart.total = cart.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
        
        // Save cart
        CartService.saveCart(cart);
        
        // Update cart UI
        CartService.updateCartUI();
        
        return { success: true, message: 'Item removed from cart', cart: cart };
    },
    
    // Update item quantity
    updateQuantity: function(productId, quantity) {
        // Get current cart
        const cart = CartService.getCart();
        
        // Find item
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) {
            return { success: false, message: 'Item not found in cart' };
        }
        
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        
        // Recalculate total
        cart.total = cart.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
        
        // Save cart
        CartService.saveCart(cart);
        
        // Update cart UI
        CartService.updateCartUI();
        
        return { success: true, message: 'Quantity updated', cart: cart };
    },
    
    // Clear cart
    clearCart: function() {
        const CART_STORAGE_KEY = 'jojiz-cart';
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
            items: [],
            total: 0
        }));
        
        // Update cart UI
        CartService.updateCartUI();
        
        return { success: true, message: 'Cart cleared' };
    },
    
    // Update cart UI
    updateCartUI: function() {
        const cart = CartService.getCart();
        console.log('Updating cart UI with cart:', cart);
        
        // Update cart count
        const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);
        $('.cart-count').text(cartCount);
        
        // Format the total price
        const formattedTotal = formatPrice(cart.total);
        console.log('Formatted cart total:', formattedTotal);
        
        // Update cart total in the header
        $('.cart span').text(formattedTotal);
        
        // Also update the cart icon in the mobile view
        $('.mobile-cart .cart-count').text(cartCount);
        
        // Log the updated elements for debugging
        console.log('Cart count elements:', $('.cart-count').length);
        console.log('Cart total elements:', $('.cart span').length);
        console.log('Cart total value:', formattedTotal);
    },
    
    // Get user address
    getUserAddress: async function() {
        if (!AuthService.isLoggedIn()) {
            return { success: false, message: 'User not logged in' };
        }
        
        const user = AuthService.getCurrentUser();
        
        // Check if user has address
        if (user.address && user.latitude && user.longitude) {
            return { 
                success: true, 
                data: {
                    address: user.address,
                    latitude: user.latitude,
                    longitude: user.longitude
                }
            };
        }
        
        return { success: false, message: 'User address not found' };
    },
    
    // Update user address
    updateUserAddress: async function(address, latitude, longitude) {
        if (!AuthService.isLoggedIn()) {
            return { success: false, message: 'User not logged in' };
        }
        
        try {
            const user = AuthService.getCurrentUser();
            const token = AuthService.getToken();
            
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    address: address,
                    latitude: latitude,
                    longitude: longitude
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message };
            }
            
            // Update user in localStorage
            user.address = address;
            user.latitude = latitude;
            user.longitude = longitude;
            localStorage.setItem('jojiz-user', JSON.stringify(user));
            
            return { success: true, message: 'Address updated successfully', data: data };
        } catch (error) {
            console.error('Error updating user address:', error);
            return { success: false, message: 'Error updating user address' };
        }
    },
    
    // Create order
    createOrder: async function(paymentMethod, shippingAddress) {
        if (!AuthService.isLoggedIn()) {
            return { success: false, message: 'User not logged in' };
        }
        
        try {
            const user = AuthService.getCurrentUser();
            const token = AuthService.getToken();
            const cart = CartService.getCart();
            
            if (cart.items.length === 0) {
                return { success: false, message: 'Cart is empty' };
            }
            
            // Prepare order data according to API specification
            const orderData = {
                data: {
                    products: cart.items.map(item => item.productId),
                    user: user.id,
                    total: cart.total,
                    discount: cart.discount || 0,
                    order_status: "pending",
                    locale: document.documentElement.lang || "ar",
                    // Additional metadata can be added here if needed
                    meta: {
                        payment_method: paymentMethod,
                        shipping_address: shippingAddress || user.address,
                        shipping_coordinates: {
                            latitude: user.latitude || 0,
                            longitude: user.longitude || 0
                        }
                    }
                }
            };
            
            // Send order to API
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return { success: false, message: data.error.message || 'Error creating order' };
            }
            
            // Clear cart after successful order
            CartService.clearCart();
            
            return { success: true, message: 'Order created successfully', data: data.data };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, message: 'Error creating order' };
        }
    }
};

// Export the services
window.AuthService = AuthService;
window.ContentService = ContentService;
window.CartService = CartService;

// Helper function to format price
function formatPrice(price) {
    if (!price) return 'السعر عند الطلب';
    
    // Ensure price is a number
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'السعر عند الطلب';
    
    return numPrice.toLocaleString('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
    });
} 
$(document).ready(function() {
    // Banner Carousel Functionality
    let currentSlide = 0;
    const slides = $('.banner-slide');
    const dots = $('.dot');
    const totalSlides = slides.length;
    const isRTL = $('html').attr('dir') === 'rtl';
    
    // Auto slide change
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Next slide function
    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }
    
    // Previous slide function
    function prevSlide() {
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }
    
    // Go to specific slide
    function goToSlide(n) {
        slides.removeClass('active');
        dots.removeClass('active');
        
        $(slides[n]).addClass('active');
        $(dots[n]).addClass('active');
        
        currentSlide = n;
        
        // Reset the interval
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Click events for navigation - handle RTL direction
    $('.carousel-next').click(function() {
        if (isRTL) {
            prevSlide();
        } else {
            nextSlide();
        }
    });
    
    $('.carousel-prev').click(function() {
        if (isRTL) {
            nextSlide();
        } else {
            prevSlide();
        }
    });
    
    // Dot navigation
    $('.dot').click(function() {
        const slideIndex = $(this).data('slide');
        goToSlide(slideIndex);
    });
    
    // Pause carousel on hover
    $('.banner-carousel').hover(
        function() {
            clearInterval(slideInterval);
        },
        function() {
            slideInterval = setInterval(nextSlide, 5000);
        }
    );
    
    // Custom events for carousel navigation
    $(document).on('carousel:next', function() {
        nextSlide();
    });
    
    $(document).on('carousel:prev', function() {
        prevSlide();
    });
    
    // Back to Top Button
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').addClass('show');
        } else {
            $('.back-to-top').removeClass('show');
        }
    });

    $('.back-to-top').click(function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
    });

    // Mobile Menu Toggle
    $('.mobile-menu-toggle').click(function() {
        $('.main-nav').toggleClass('active');
        $(this).toggleClass('active');
    });

    // Language Dropdown
    $('.language-dropdown').click(function() {
        $(this).toggleClass('active');
    });

    // Tab Functionality
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // Here you would typically load different content based on the tab
        // For demo purposes, we're just showing the active state
    });

    // Product Hover Effect
    $('.product-card').hover(
        function() {
            $(this).find('.product-overlay').fadeIn(300);
        },
        function() {
            $(this).find('.product-overlay').fadeOut(300);
        }
    );

    // Load More Products
    $('.load-more-btn').click(async function() {
        // Get the next page number
        const nextPage = $(this).data('page') || 2;
        console.log('Loading more products, page:', nextPage);
        
        // Show loading state
        $(this).text('جاري التحميل...').prop('disabled', true);
        
        // Always use Arabic locale for products
        const locale = 'ar';
        
        // Fetch more products from API
        const result = await ContentService.getProducts(locale, nextPage);
        console.log('Load more API response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            let productsAdded = 0;
            
            // Generate product items
            result.data.forEach((product, index) => {
                try {
                    console.log(`Processing additional product ${index + 1}:`, product);
                    
                    // Get product image URL
                    let imageUrl = '';
                    if (product.product_image) {
                        // Try to get the medium format if available
                        if (product.product_image.formats && product.product_image.formats.medium) {
                            imageUrl = API_BASE_URL + product.product_image.formats.medium.url;
                        } else if (product.product_image.url) {
                            // Fallback to the original image
                            imageUrl = API_BASE_URL + product.product_image.url;
                        }
                    }
                    
                    console.log(`Additional product ${index + 1} image URL:`, imageUrl);
                    
                    // Format price if available
                    const price = product.product_price ? formatPrice(product.product_price) : 'السعر عند الطلب';
                    
                    // Create product HTML
                    const productHTML = `
                        <div class="product-item" data-id="${product.documentId || product.id}">
                            <div class="product-image">
                                ${imageUrl ? 
                                    `<img src="${imageUrl}" alt="${product.product_name}" onerror="this.classList.add('error')">` : 
                                    `<div class="placeholder-image"><i class="fas fa-tshirt"></i></div>`
                                }
                                <div class="product-actions">
                                    <a href="#" class="add-to-cart"><i class="fas fa-shopping-cart"></i></a>
                                    <a href="#" class="add-to-wishlist"><i class="fas fa-heart"></i></a>
                                    <a href="#" class="quick-view"><i class="fas fa-eye"></i></a>
                                </div>
                            </div>
                            <div class="product-details">
                                <h3>${product.product_name}</h3>
                                <div class="price-container">
                                    <p class="price">${price}</p>
                                </div>
                                <div class="product-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star-half-alt"></i>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    $('.popular-products .products-grid').append(productHTML);
                    productsAdded++;
                } catch (error) {
                    console.error(`Error processing additional product ${index + 1}:`, error, product);
                }
            });
            
            console.log(`Added ${productsAdded} more products to the grid`);
            
            // Update pagination
            if (result.meta && result.meta.pagination) {
                console.log('Updated pagination data:', result.meta.pagination);
                updatePagination(result.meta.pagination);
            } else {
                console.log('No more pagination data available');
                // No more pagination data
                $(this).text('لا توجد منتجات أخرى').prop('disabled', true);
            }
            
            // Initialize product hover effects for new products
            initializeProductHover();
        } else {
            // Show error message
            $(this).text('لا توجد منتجات أخرى').prop('disabled', true);
            console.error('Failed to load more products:', result);
        }
    });

    // Initialize product overlays as hidden
    $('.product-overlay').hide();

    // Load featured products
    loadFeaturedProducts();
    
    // Load popular products
    loadPopularProducts();
    
    // Load categories
    loadCategories();

    // Initialize product hover effects
    initializeProductHover();

    // Initialize product interactions
    // Make product items clickable to navigate to product detail page
    $(document).on('click', '.product-item', function(e) {
        // Only navigate if the click wasn't on one of the action buttons
        if (!$(e.target).closest('.product-actions a').length) {
            const productId = $(this).data('id');
            window.location.href = `product.html?id=${productId}`;
        }
    });
    
    // Set cursor style to indicate clickable items
    $(document).on('mouseenter', '.product-item', function() {
        $(this).css('cursor', 'pointer');
    });
    
    // Handle quick view button click
    $(document).on('click', '.quick-view', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the product item click event
        
        // If we're already on the product page, don't do anything
        if (window.location.pathname.includes('product.html')) {
            return;
        }
        
        const productId = $(this).closest('.product-item').data('id');
        // If we have a quick view modal function, use it
        if (typeof openQuickViewModal === 'function') {
            openQuickViewModal(productId);
        } else {
            // Otherwise, navigate to the product page
            window.location.href = `product.html?id=${productId}`;
        }
    });
    
    // Handle add to cart button click
    $(document).on('click', '.add-to-cart', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the product item click event
        
        const productId = $(this).closest('.product-item').data('id');
        // If we have an add to cart function, use it
        if (typeof addToCart === 'function') {
            addToCart(productId, 1);
        } else {
            // Otherwise, show a simple alert
            alert(`تمت إضافة المنتج (${productId}) إلى السلة`);
        }
    });
    
    // Handle add to wishlist button click
    $(document).on('click', '.add-to-wishlist', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the product item click event
        
        const productId = $(this).closest('.product-item').data('id');
        // If we have an add to wishlist function, use it
        if (typeof addToWishlist === 'function') {
            addToWishlist(productId);
        } else {
            // Otherwise, show a simple alert
            alert(`تمت إضافة المنتج (${productId}) إلى المفضلة`);
        }
    });

    // Initialize cart on page load
    CartService.init();
    
    // Update cart UI
    CartService.updateCartUI();
    
    // Add click handler for cart icon
    $('.cart, .cart-icon').on('click', function(e) {
        e.preventDefault();
        openCartModal();
    });

    // Initialize cart when the page loads
    if (typeof CartService !== 'undefined') {
        CartService.init();
        console.log('Cart initialized in main.js:', CartService.getCart());
    }
});

// Function to simulate loading featured products
async function loadFeaturedProducts() {
    const featuredGrid = $('.featured-products .featured-grid');
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل المنتجات المميزة...') : 'جاري تحميل المنتجات المميزة...';
    
    // Show loading state
    featuredGrid.html(`<div class="loading-products">${loadingText}</div>`);
    
    // Get current language
    const currentLocale = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading featured products with current locale:', currentLocale);
    
    try {
        // Fetch featured products from API - using the same API as most popular products
        const result = await ContentService.getMostPopularProducts();
        
        console.log('Featured Products API response:', result);
        
        if (result.success && result.data) {
            console.log('Featured products data:', result.data);
            
            // Check if we have products in the response
            let products = [];
            
            // Try to find products in different possible structures
            if (result.data.products && Array.isArray(result.data.products)) {
                products = result.data.products;
            } else if (Array.isArray(result.data)) {
                products = result.data;
            }
            
            if (products.length > 0) {
                // Clear loading state
                featuredGrid.empty();
                
                // Limit to 4 products for featured section
                const featuredProducts = products.slice(0, 4);
                
                // Process each product
                featuredProducts.forEach((product, index) => {
                    try {
                        console.log(`Processing featured product ${index + 1}:`, product);
                        
                        // Extract product data
                        const productId = product.documentId || product.id;
                        const productName = product.product_name || 'منتج بدون اسم';
                        
                        // Get product image URL
                        let imageUrl = '';
                        
                        // Handle product_image property
                        if (product.product_image) {
                            if (typeof product.product_image === 'string') {
                                imageUrl = API_BASE_URL + product.product_image;
                            } else if (product.product_image.url) {
                                imageUrl = API_BASE_URL + product.product_image.url;
                            } else if (product.product_image.formats && product.product_image.formats.medium) {
                                // Use medium format if available
                                imageUrl = API_BASE_URL + product.product_image.formats.medium.url;
                            } else if (product.product_image.formats && product.product_image.formats.small) {
                                // Use small format if medium is not available
                                imageUrl = API_BASE_URL + product.product_image.formats.small.url;
                            } else if (product.product_image.formats && product.product_image.formats.thumbnail) {
                                // Use thumbnail as last resort
                                imageUrl = API_BASE_URL + product.product_image.formats.thumbnail.url;
                            }
                        }
                        
                        // If no image found in product_image, try product_media
                        if (!imageUrl && product.product_media && product.product_media.length > 0) {
                            const media = product.product_media[0];
                            if (typeof media === 'string') {
                                imageUrl = API_BASE_URL + media;
                            } else if (media.url) {
                                imageUrl = API_BASE_URL + media.url;
                            } else if (media.formats && media.formats.medium) {
                                imageUrl = API_BASE_URL + media.formats.medium.url;
                            } else if (media.formats && media.formats.small) {
                                imageUrl = API_BASE_URL + media.formats.small.url;
                            } else if (media.formats && media.formats.thumbnail) {
                                imageUrl = API_BASE_URL + media.formats.thumbnail.url;
                            }
                        }
                        
                        console.log(`Featured product ${index + 1} image URL:`, imageUrl);
                        
                        // Extract price from description if product_price is null
                        let price = 'السعر عند الطلب';
                        if (product.product_price) {
                            price = formatPrice(product.product_price);
                        } else if (product.product_description) {
                            // Try to extract price from description
                            const description = product.product_description;
                            let priceMatch = null;
                            
                            if (description.includes('السعر:')) {
                                priceMatch = description.match(/السعر:([^.]*)/);
                            } else if (description.includes('يبدأ من')) {
                                priceMatch = description.match(/يبدأ من ([^.]*)/);
                            }
                            
                            if (priceMatch && priceMatch[1]) {
                                price = priceMatch[1].trim();
                            }
                        }
                        
                        // Get image not available text based on current language
                        const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                        
                        // Create featured product HTML
                        const productHTML = `
                            <div class="product-item" data-id="${productId}">
                                <div class="product-image">
                                    ${imageUrl ? 
                                        `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                        `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                                    }
                                    <div class="product-actions">
                                        <a href="#" class="add-to-cart"><i class="fas fa-shopping-cart"></i></a>
                                        <a href="#" class="add-to-wishlist"><i class="fas fa-heart"></i></a>
                                        <a href="product.html?id=${productId}" class="quick-view"><i class="fas fa-eye"></i></a>
                                    </div>
                                </div>
                                <div class="product-details">
                                    <h3>${productName}</h3>
                                    <div class="price-container">
                                        <p class="price">${price}</p>
                                    </div>
                                    <div class="product-rating">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        featuredGrid.append(productHTML);
                    } catch (error) {
                        console.error(`Error processing featured product ${index + 1}:`, error, product);
                    }
                });
                
                // Initialize product hover effects
                initializeProductHover();
            } else {
                // No products found
                console.error('No featured products found in API response');
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.';
                featuredGrid.html(`<div class="error-products">${errorText}</div>`);
            }
        } else {
            // API returned error or no data
            console.error('Failed to load featured products:', result);
            const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.';
            featuredGrid.html(`<div class="error-products">${errorText}</div>`);
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in loadFeaturedProducts:', error);
        const errorText = window.translateText ? window.translateText('عذراً، حدث خطأ أثناء تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، حدث خطأ أثناء تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.';
        featuredGrid.html(`<div class="error-products">${errorText}</div>`);
    }
}

// Function to load popular products from API
async function loadPopularProducts() {
    // In a real implementation, this would fetch data from an API
    const productsGrid = $('.popular-products .products-grid');
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل المنتجات...') : 'جاري تحميل المنتجات...';
    
    // Show loading state
    productsGrid.html(`<div class="loading-products">${loadingText}</div>`);
    
    // Get current language
    const currentLocale = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading popular products with current locale:', currentLocale);
    
    try {
        // Fetch popular products from API
        const result = await ContentService.getMostPopularProducts();
        
        console.log('Popular Products API full response:', result);
        
        // First, check if we have the expected structure with products array
        if (result.success && result.data && Array.isArray(result.data.products) && result.data.products.length > 0) {
            // Clear loading state
            productsGrid.empty();
            
            let productsAdded = 0;
            
            // Generate product items
            result.data.products.forEach((product, index) => {
                try {
                    console.log(`Processing popular product ${index + 1}:`, product);
                    
                    // Extract product data
                    const productId = product.documentId || product.id;
                    const productName = product.product_name || 'منتج بدون اسم';
                    
                    // Get product image URL
                    let imageUrl = '';
                    
                    // Handle different API response structures for images
                    if (product.product_image && product.product_image.url) {
                        imageUrl = API_BASE_URL + product.product_image.url;
                    } else if (product.product_media && product.product_media.length > 0 && product.product_media[0].url) {
                        imageUrl = API_BASE_URL + product.product_media[0].url;
                    }
                    
                    console.log(`Popular product ${index + 1} image URL:`, imageUrl);
                    
                    // Format price if available
                    const price = product.product_price 
                        ? formatPrice(product.product_price)
                        : window.translateText ? window.translateText('السعر عند الطلب') : 'السعر عند الطلب';
                    
                    // Get image not available text based on current language
                    const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                    
                    // Create product HTML with improved image handling
                    const productHTML = `
                        <div class="product-item" data-id="${productId}">
                            <div class="product-image">
                                ${imageUrl ? 
                                    `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                    `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                                }
                                <div class="product-actions">
                                    <a href="#" class="add-to-cart"><i class="fas fa-shopping-cart"></i></a>
                                    <a href="#" class="add-to-wishlist"><i class="fas fa-heart"></i></a>
                                    <a href="product.html?id=${productId}" class="quick-view"><i class="fas fa-eye"></i></a>
                                </div>
                            </div>
                            <div class="product-details">
                                <h3>${productName}</h3>
                                <div class="price-container">
                                    <p class="price">${price}</p>
                                </div>
                                <div class="product-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star-half-alt"></i>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    productsGrid.append(productHTML);
                    productsAdded++;
                } catch (error) {
                    console.error(`Error processing popular product ${index + 1}:`, error, product);
                }
            });
            
            console.log(`Added ${productsAdded} popular products to the grid`);
            
            // If no products were added successfully, show error
            if (productsAdded === 0) {
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                productsGrid.html(`<div class="error-products">${errorText}</div>`);
            }
            
            // Initialize product hover effects
            initializeProductHover();
        } 
        // Check if we have a similar structure to the month-offer API
        else if (result.success && result.data && result.data.id) {
            console.log('Found single data object with ID, checking for products array');
            
            // Check if there's a products array in the data
            const products = result.data.products || [];
            
            if (products.length > 0) {
                // Clear loading state
                productsGrid.empty();
                
                let productsAdded = 0;
                
                // Generate product items
                products.forEach((product, index) => {
                    try {
                        console.log(`Processing popular product ${index + 1}:`, product);
                        
                        // Extract product data
                        const productId = product.documentId || product.id;
                        const productName = product.product_name || 'منتج بدون اسم';
                        const productDescription = product.product_description || '';
                        
                        // Get product image URL
                        let imageUrl = '';
                        
                        if (product.product_image) {
                            if (typeof product.product_image === 'string') {
                                imageUrl = API_BASE_URL + product.product_image;
                            } else if (product.product_image.url) {
                                imageUrl = API_BASE_URL + product.product_image.url;
                            } else if (product.product_image.data && product.product_image.data.attributes && product.product_image.data.attributes.url) {
                                imageUrl = API_BASE_URL + product.product_image.data.attributes.url;
                            }
                        }
                        
                        console.log(`Popular product ${index + 1} image URL:`, imageUrl);
                        
                        // Extract price from description if product_price is null
                        let price = 'السعر عند الطلب';
                        if (product.product_price) {
                            price = formatPrice(product.product_price);
                        } else if (productDescription && productDescription.includes('السعر:')) {
                            // Try to extract price from description
                            const priceMatch = productDescription.match(/السعر:([^.]*)/);
                            if (priceMatch && priceMatch[1]) {
                                price = priceMatch[1].trim();
                            }
                        }
                        
                        // Get image not available text based on current language
                        const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                        
                        // Create product HTML with improved image handling
                        const productHTML = `
                            <div class="product-item" data-id="${productId}">
                                <div class="product-image">
                                    ${imageUrl ? 
                                        `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                        `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                                    }
                                    <div class="product-actions">
                                        <a href="#" class="add-to-cart"><i class="fas fa-shopping-cart"></i></a>
                                        <a href="#" class="add-to-wishlist"><i class="fas fa-heart"></i></a>
                                        <a href="product.html?id=${productId}" class="quick-view"><i class="fas fa-eye"></i></a>
                                    </div>
                                </div>
                                <div class="product-details">
                                    <h3>${productName}</h3>
                                    <div class="price-container">
                                        <p class="price">${price}</p>
                                    </div>
                                    <div class="product-rating">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        productsGrid.append(productHTML);
                        productsAdded++;
                    } catch (error) {
                        console.error(`Error processing popular product ${index + 1}:`, error, product);
                    }
                });
                
                console.log(`Added ${productsAdded} popular products to the grid`);
                
                // If no products were added successfully, show error
                if (productsAdded === 0) {
                    const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                    productsGrid.html(`<div class="error-products">${errorText}</div>`);
                    return;
                }
                
                // Initialize product hover effects
                initializeProductHover();
            } else {
                // No products found in the response
                console.error('No products found in API response');
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                productsGrid.html(`<div class="error-products">${errorText}</div>`);
            }
        } else if (result.success && result.data && typeof result.data === 'object') {
            // Handle case where API returns success but no products array or empty products array
            console.log('API returned success but no products array or empty products array');
            
            // Try to extract products from a different structure
            let products = [];
            
            // Check if data itself is an array
            if (Array.isArray(result.data)) {
                products = result.data;
            } else if (result.data.data && Array.isArray(result.data.data)) {
                // Some APIs nest data in a data property
                products = result.data.data;
            } else {
                // Try to find any array in the response that might contain products
                for (const key in result.data) {
                    if (Array.isArray(result.data[key]) && result.data[key].length > 0) {
                        products = result.data[key];
                        break;
                    }
                }
            }
            
            if (products.length > 0) {
                // Clear loading state
                productsGrid.empty();
                
                let productsAdded = 0;
                
                // Generate product items
                products.forEach((product, index) => {
                    try {
                        console.log(`Processing alternative product ${index + 1}:`, product);
                        
                        // Extract product data - handle different possible structures
                        const productId = product.documentId || product.id || index + 1;
                        const productName = product.product_name || product.name || product.title || 'منتج بدون اسم';
                        
                        // Get product image URL - handle different possible structures
                        let imageUrl = '';
                        
                        if (product.product_image) {
                            if (typeof product.product_image === 'string') {
                                imageUrl = API_BASE_URL + product.product_image;
                            } else if (product.product_image.url) {
                                imageUrl = API_BASE_URL + product.product_image.url;
                            } else if (product.product_image.data && product.product_image.data.attributes && product.product_image.data.attributes.url) {
                                imageUrl = API_BASE_URL + product.product_image.data.attributes.url;
                            }
                        } else if (product.image) {
                            if (typeof product.image === 'string') {
                                imageUrl = API_BASE_URL + product.image;
                            } else if (product.image.url) {
                                imageUrl = API_BASE_URL + product.image.url;
                            } else if (product.image.data && product.image.data.attributes && product.image.data.attributes.url) {
                                imageUrl = API_BASE_URL + product.image.data.attributes.url;
                            }
                        }
                        
                        console.log(`Alternative product ${index + 1} image URL:`, imageUrl);
                        
                        // Format price if available
                        const price = product.product_price || product.price 
                            ? formatPrice(product.product_price || product.price)
                            : window.translateText ? window.translateText('السعر عند الطلب') : 'السعر عند الطلب';
                        
                        // Get image not available text based on current language
                        const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                        
                        // Create product HTML with improved image handling
                        const productHTML = `
                            <div class="product-item" data-id="${productId}">
                                <div class="product-image">
                                    ${imageUrl ? 
                                        `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                        `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                                    }
                                    <div class="product-actions">
                                        <a href="#" class="add-to-cart"><i class="fas fa-shopping-cart"></i></a>
                                        <a href="#" class="add-to-wishlist"><i class="fas fa-heart"></i></a>
                                        <a href="product.html?id=${productId}" class="quick-view"><i class="fas fa-eye"></i></a>
                                    </div>
                                </div>
                                <div class="product-details">
                                    <h3>${productName}</h3>
                                    <div class="price-container">
                                        <p class="price">${price}</p>
                                    </div>
                                    <div class="product-rating">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        productsGrid.append(productHTML);
                        productsAdded++;
                    } catch (error) {
                        console.error(`Error processing alternative product ${index + 1}:`, error, product);
                    }
                });
                
                console.log(`Added ${productsAdded} alternative products to the grid`);
                
                // If no products were added successfully, show error
                if (productsAdded === 0) {
                    const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                    productsGrid.html(`<div class="error-products">${errorText}</div>`);
                    return;
                }
                
                // Initialize product hover effects
                initializeProductHover();
            } else {
                // No products found in any structure
                console.error('No products found in API response');
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                productsGrid.html(`<div class="error-products">${errorText}</div>`);
            }
        } else {
            // API returned error or no data
            console.error('Failed to load popular products:', result);
            const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
            productsGrid.html(`<div class="error-products">${errorText}</div>`);
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in loadPopularProducts:', error);
        const errorText = window.translateText ? window.translateText('عذراً، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
        productsGrid.html(`<div class="error-products">${errorText}</div>`);
    }
}

// Function to update pagination
function updatePagination(pagination) {
    console.log('Updating pagination with data:', pagination);
    const loadMoreBtn = $('.load-more-btn');
    
    // If there are more pages, show the load more button
    if (pagination.page < pagination.pageCount) {
        loadMoreBtn.text('المزيد').prop('disabled', false);
        loadMoreBtn.data('page', pagination.page + 1);
        console.log('Next page set to:', pagination.page + 1);
    } else {
        loadMoreBtn.text('لا توجد منتجات أخرى').prop('disabled', true);
        console.log('No more pages available');
    }
}

// Function to initialize product hover effects
function initializeProductHover() {
    $('.product-item').hover(
        function() {
            $(this).find('.product-actions').fadeIn(300);
        },
        function() {
            $(this).find('.product-actions').fadeOut(300);
        }
    );
    
    // Initialize product actions as hidden
    $('.product-actions').hide();
}

// Function to load categories from API
async function loadCategories() {
    const categoriesGrid = $('.categories-grid');
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل الفئات...') : 'جاري تحميل الفئات...';
    
    // Show loading state
    categoriesGrid.html(`<div class="loading-categories">${loadingText}</div>`);
    
    // Get current language
    const currentLocale = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading categories with current locale:', currentLocale);
    
    try {
        // Fetch categories from API
        const result = await ContentService.getCategories();
        
        console.log('Categories API response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            // Clear loading state
            categoriesGrid.empty();
            
            // Generate category items
            result.data.forEach(category => {
                try {
                    // Extract category data
                    const categoryId = category.documentId || category.id;
                    const categoryName = category.attributes?.name || category.name || 'فئة بدون اسم';
                    
                    // Get category image URL
                    let imageUrl = '';
                    
                    // Handle different API response structures for images
                    if (category.attributes && category.attributes.image && category.attributes.image.data) {
                        imageUrl = API_BASE_URL + category.attributes.image.data.attributes.url;
                    } else if (category.image && category.image.url) {
                        imageUrl = API_BASE_URL + category.image.url;
                    }
                    
                    // Get image not available text based on current language
                    const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                    
                    // Create category HTML
                    const categoryHTML = `
                        <div class="category-item">
                            <a href="category.html?id=${categoryId}">
                                ${imageUrl ? 
                                    `<img src="${imageUrl}" alt="${categoryName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-folder\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                    `<div class="placeholder-image"><i class="fas fa-folder"></i><span>${imageNotAvailableText}</span></div>`
                                }
                                <h3>${categoryName}</h3>
                            </a>
                        </div>
                    `;
                    
                    categoriesGrid.append(categoryHTML);
                } catch (error) {
                    console.error('Error processing category:', error, category);
                }
            });
        } else {
            // No categories found
            const noCategoriesText = window.translateText ? window.translateText('لا توجد فئات.') : 'لا توجد فئات.';
            categoriesGrid.html(`<div class="error-categories">${noCategoriesText}</div>`);
        }
    } catch (error) {
        console.error('Error in loadCategories:', error);
        const errorText = window.translateText ? window.translateText('عذراً، حدث خطأ أثناء تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، حدث خطأ أثناء تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.';
        categoriesGrid.html(`<div class="error-categories">${errorText}</div>`);
    }
}

// Function to load special products from API
async function loadSpecialProducts() {
    const productsGrid = $('.products-grid');
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل المنتجات المميزة...') : 'جاري تحميل المنتجات المميزة...';
    
    // Show loading state
    productsGrid.html(`<div class="loading-products">${loadingText}</div>`);
    
    // Get current language
    const currentLocale = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading special products with current locale:', currentLocale);
    
    // Fetch special products from API
    const result = await ContentService.getSpecialProducts();
    
    console.log('Special Products API full response:', result);
    
    if (result.success && result.data && result.data.products && result.data.products.length > 0) {
        // Clear loading state
        productsGrid.empty();
        
        let productsAdded = 0;
        
        // Generate product items
        result.data.products.forEach((product, index) => {
            try {
                console.log(`Processing special product ${index + 1}:`, product);
                
                // Extract product data
                const productId = product.documentId || product.id;
                const productName = product.product_name || 'منتج بدون اسم';
                
                // Get product image URL
                let imageUrl = '';
                
                // Handle different API response structures for images
                if (product.product_image && product.product_image.url) {
                    imageUrl = API_BASE_URL + product.product_image.url;
                } else if (product.product_media && product.product_media.length > 0 && product.product_media[0].url) {
                    imageUrl = API_BASE_URL + product.product_media[0].url;
                }
                
                console.log(`Special product ${index + 1} image URL:`, imageUrl);
                
                // Format price if available
                const price = product.product_price 
                    ? formatPrice(product.product_price)
                    : window.translateText ? window.translateText('السعر عند الطلب') : 'السعر عند الطلب';
                
                // Get image not available text based on current language
                const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                
                // Create product HTML with improved image handling
                const productHTML = `
                    <div class="product-card" data-id="${productId}">
                        <div class="product-image">
                            ${imageUrl ? 
                                `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                            }
                            <div class="product-overlay">
                                <div class="product-info">
                                    <p>${product.product_description || ''}</p>
                                    <h3>${productName}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                productsGrid.append(productHTML);
                productsAdded++;
            } catch (error) {
                console.error(`Error processing special product ${index + 1}:`, error, product);
            }
        });
        
        console.log(`Added ${productsAdded} special products to the grid`);
        
        // If no products were added successfully, show error
        if (productsAdded === 0) {
            const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.';
            productsGrid.html(`<div class="error-products">${errorText}</div>`);
        }
    } else {
        console.error('Failed to load special products:', result);
        // Show error message
        const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات المميزة. يرجى المحاولة مرة أخرى لاحقاً.';
        productsGrid.html(`<div class="error-products">${errorText}</div>`);
    }
}

// Function to load month offer from API
async function loadMonthOffer() {
    const offerContent = $('.monthly-offer .offer-content');
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل عرض الشهر...') : 'جاري تحميل عرض الشهر...';
    
    // Show loading state
    offerContent.html(`<div class="loading-products">${loadingText}</div>`);
    
    // Get current language
    const currentLocale = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading month offer with current locale:', currentLocale);
    
    try {
        // Fetch month offer from API
        const result = await ContentService.getMonthOffer();
        
        console.log('Month Offer API response:', result);
        
        if (result.success && result.data) {
            console.log('Month offer data:', result.data);
            
            // Check if we have products in the response
            const products = result.data.products || [];
            
            if (products.length > 0) {
                // Clear loading state
                offerContent.empty();
                
                // Process each product in the month offer
                products.forEach((product, index) => {
                    try {
                        console.log(`Processing month offer product ${index + 1}:`, product);
                        
                        // Extract product data
                        const productId = product.documentId || product.id;
                        const productName = product.product_name || 'منتج بدون اسم';
                        const productDescription = product.product_description || '';
                        
                        // Extract price from description if product_price is null
                        let price = 'السعر عند الطلب';
                        if (product.product_price) {
                            price = formatPrice(product.product_price);
                        } else if (productDescription) {
                            // Try to extract price from description - look for patterns like "السعر:" or "يبدأ من"
                            let priceMatch = null;
                            
                            if (productDescription.includes('السعر:')) {
                                priceMatch = productDescription.match(/السعر:([^.]*)/);
                            } else if (productDescription.includes('يبدأ من')) {
                                priceMatch = productDescription.match(/يبدأ من ([^.]*)/);
                            }
                            
                            if (priceMatch && priceMatch[1]) {
                                price = priceMatch[1].trim();
                            }
                        }
                        
                        // Create a short description (first 150 characters)
                        // Remove price information from the description for display
                        let shortDescription = productDescription;
                        if (shortDescription.includes('🔹السعر:')) {
                            shortDescription = shortDescription.split('🔹السعر:')[0].trim();
                        } else if (shortDescription.includes('السعر:')) {
                            shortDescription = shortDescription.split('السعر:')[0].trim();
                        }
                        
                        // Limit to 150 characters
                        shortDescription = shortDescription 
                            ? shortDescription.substring(0, 150) + (shortDescription.length > 150 ? '...' : '')
                            : '';
                        
                        // Get product image URL
                        let imageUrl = '';
                        
                        // Handle product_image property
                        if (product.product_image) {
                            if (typeof product.product_image === 'string') {
                                imageUrl = API_BASE_URL + product.product_image;
                            } else if (product.product_image.url) {
                                imageUrl = API_BASE_URL + product.product_image.url;
                            } else if (product.product_image.formats && product.product_image.formats.medium) {
                                // Use medium format if available
                                imageUrl = API_BASE_URL + product.product_image.formats.medium.url;
                            } else if (product.product_image.formats && product.product_image.formats.small) {
                                // Use small format if medium is not available
                                imageUrl = API_BASE_URL + product.product_image.formats.small.url;
                            } else if (product.product_image.formats && product.product_image.formats.thumbnail) {
                                // Use thumbnail as last resort
                                imageUrl = API_BASE_URL + product.product_image.formats.thumbnail.url;
                            }
                        }
                        
                        // If no image found in product_image, try product_media
                        if (!imageUrl && product.product_media && product.product_media.length > 0) {
                            const media = product.product_media[0];
                            if (typeof media === 'string') {
                                imageUrl = API_BASE_URL + media;
                            } else if (media.url) {
                                imageUrl = API_BASE_URL + media.url;
                            } else if (media.formats && media.formats.medium) {
                                imageUrl = API_BASE_URL + media.formats.medium.url;
                            } else if (media.formats && media.formats.small) {
                                imageUrl = API_BASE_URL + media.formats.small.url;
                            } else if (media.formats && media.formats.thumbnail) {
                                imageUrl = API_BASE_URL + media.formats.thumbnail.url;
                            }
                        }
                        
                        console.log(`Month offer product ${index + 1} image URL:`, imageUrl);
                        
                        // Get image not available text based on current language
                        const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                        
                        // Create month offer HTML with product data
                        const offerHTML = `
                            <div class="month-offer-item" data-id="${productId}">
                                <div class="offer-image">
                                    ${imageUrl ? 
                                        `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-gift\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                        `<div class="placeholder-image"><i class="fas fa-gift"></i><span>${imageNotAvailableText}</span></div>`
                                    }
                                </div>
                                <div class="offer-details">
                                    <h3>${productName}</h3>
                                    <p>${shortDescription}</p>
                                    <p class="price">${price}</p>
                                    <a href="#" class="offer-btn">تسوق الآن</a>
                                </div>
                            </div>
                        `;
                        
                        offerContent.append(offerHTML);
                    } catch (error) {
                        console.error(`Error processing month offer product ${index + 1}:`, error, product);
                    }
                });
                
                // Add "Show More" link after the offer content
                const showMoreText = window.translateText ? window.translateText('عرض المزيد') : 'عرض المزيد';
                $('.monthly-offer .more-link').text(showMoreText);
            } else {
                // No products found in the month offer
                console.log('No products found in month offer');
                createFallbackMonthOffer();
            }
        } else {
            // API returned error or no data
            console.error('Failed to load month offer:', result);
            createFallbackMonthOffer();
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in loadMonthOffer:', error);
        createFallbackMonthOffer();
    }
}

// Function to create a fallback month offer
function createFallbackMonthOffer() {
    const offerContent = $('.monthly-offer .offer-content');
    
    // Get translated text
    const offerTitle = window.translateText ? window.translateText('عرض الشهر') : 'عرض الشهر';
    const shopNowText = window.translateText ? window.translateText('تسوق الآن') : 'تسوق الآن';
    const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
    
    const fallbackHTML = `
        <div class="month-offer-item">
            <div class="offer-image">
                <div class="placeholder-image">
                    <i class="fas fa-gift"></i>
                    <span>${imageNotAvailableText}</span>
                </div>
            </div>
            <div class="offer-details">
                <h3>${offerTitle}</h3>
                <p>تسوق أحدث المنتجات بأفضل الأسعار</p>
                <a href="#" class="offer-btn">${shopNowText}</a>
            </div>
        </div>
    `;
    
    offerContent.html(fallbackHTML);
}

// Function to load social media links
async function loadSocialMediaLinks() {
    const socialLinksContainer = $('.footer-contact .social-links');
    
    try {
        // Fetch social media links from API
        const result = await ContentService.getSocialMedia();
        
        console.log('Social Media API response:', result);
        
        if (result.success && result.data) {
            console.log('Social media data:', result.data);
            
            // Clear any existing links
            socialLinksContainer.empty();
            
            // Create social media links
            const socialMedia = result.data;
            
            // Add Facebook link if available
            if (socialMedia.facebook) {
                socialLinksContainer.append(`<a href="${socialMedia.facebook}" target="_blank" class="facebook"><i class="fab fa-facebook-f"></i></a>`);
            }
            
            // Add Instagram link if available
            if (socialMedia.instagram) {
                socialLinksContainer.append(`<a href="${socialMedia.instagram}" target="_blank" class="instagram"><i class="fab fa-instagram"></i></a>`);
            }
            
            // Add TikTok link if available
            if (socialMedia.tiktok) {
                socialLinksContainer.append(`<a href="${socialMedia.tiktok}" target="_blank" class="tiktok"><i class="fab fa-tiktok"></i></a>`);
            }
            
            // Add YouTube link if available
            if (socialMedia.youtube) {
                socialLinksContainer.append(`<a href="${socialMedia.youtube}" target="_blank" class="youtube"><i class="fab fa-youtube"></i></a>`);
            }
            
            // Add Snapchat link if available
            if (socialMedia.snapchat) {
                socialLinksContainer.append(`<a href="${socialMedia.snapchat}" target="_blank" class="snapchat"><i class="fab fa-snapchat-ghost"></i></a>`);
            }
            
            // Add Twitter/X link if available
            if (socialMedia.X) {
                socialLinksContainer.append(`<a href="${socialMedia.X}" target="_blank" class="twitter"><i class="fab fa-x-twitter"></i></a>`);
            }
            
            // Add Threads link if available
            if (socialMedia.threads) {
                socialLinksContainer.append(`<a href="${socialMedia.threads}" target="_blank" class="threads"><i class="fab fa-threads"></i></a>`);
            }
            
            // Add LinkedIn link if available
            if (socialMedia.linkedin) {
                socialLinksContainer.append(`<a href="${socialMedia.linkedin}" target="_blank" class="linkedin"><i class="fab fa-linkedin-in"></i></a>`);
            }
            
            // If no social media links were added, add fallback links
            if (socialLinksContainer.children().length === 0) {
                createFallbackSocialLinks();
            }
        } else {
            // API returned error or no data
            console.error('Failed to load social media links:', result);
            createFallbackSocialLinks();
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in loadSocialMediaLinks:', error);
        createFallbackSocialLinks();
    }
}

// Function to create fallback social media links
function createFallbackSocialLinks() {
    const socialLinksContainer = $('.footer-contact .social-links');
    
    // Add fallback social media links
    socialLinksContainer.html(`
        <a href="#" class="facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" class="instagram"><i class="fab fa-instagram"></i></a>
        <a href="#" class="tiktok"><i class="fab fa-tiktok"></i></a>
    `);
}

// Function to load and apply site settings
async function loadSiteSettings() {
    try {
        // Fetch site settings from API
        const result = await ContentService.getSettings();
        
        console.log('Site Settings API response:', result);
        
        if (result.success && result.data) {
            console.log('Site settings data:', result.data);
            
            // Store settings in a global variable for easy access
            window.siteSettings = result.data;
            
            // Apply site name
            if (result.data.name) {
                document.title = result.data.name;
                $('.footer-bottom p').text(`حقوق الطبع والنشر © ${new Date().getFullYear()} ${result.data.name}. جميع الحقوق محفوظة`);
            }
            
            // Apply logo
            if (result.data.logo) {
                let logoUrl = '';
                
                if (typeof result.data.logo === 'string') {
                    logoUrl = API_BASE_URL + result.data.logo;
                } else if (result.data.logo.url) {
                    logoUrl = API_BASE_URL + result.data.logo.url;
                } else if (result.data.logo.formats && result.data.logo.formats.small) {
                    logoUrl = API_BASE_URL + result.data.logo.formats.small.url;
                }
                
                if (logoUrl) {
                    $('.logo img').attr('src', logoUrl);
                    $('.logo img').attr('alt', result.data.name || 'Jojiz Logo');
                }
            }
            
            // Apply contact information
            if (result.data.phone_number) {
                // Update hotline
                $('.hotline a').attr('href', `tel:${result.data.phone_number}`);
                $('.hotline a').text(result.data.phone_number);
                
                // Update footer contact
                $('.footer-contact ul li a[href^="tel:"]').attr('href', `tel:${result.data.phone_number}`);
                $('.footer-contact ul li a[href^="tel:"]').text(result.data.phone_number);
            }
            
            // Apply email
            if (result.data.email) {
                $('.footer-contact ul li a[href^="mailto:"]').attr('href', `mailto:${result.data.email}`);
                $('.footer-contact ul li a[href^="mailto:"]').text(result.data.email);
            }
            
            // Apply currency
            if (result.data.currency) {
                // Store currency for use in price formatting
                window.siteCurrency = result.data.currency;
                
                // Update cart currency
                $('.cart span').text(`0.00${result.data.currency}`);
            }
            
            return true;
        } else {
            // API returned error or no data
            console.error('Failed to load site settings:', result);
            return false;
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error('Error in loadSiteSettings:', error);
        return false;
    }
}

// Helper function to format price with site currency
function formatPrice(price) {
    if (!price) return window.translateText ? window.translateText('السعر عند الطلب') : 'السعر عند الطلب';
    
    const currency = window.siteCurrency || 'EGP';
    return `${price} ${currency}`;
}

// Function to add product to cart
async function addToCart(productId, quantity = 1) {
    // Use the CartService to add the item
    const result = await CartService.addItem(productId, quantity);
    
    if (result.success) {
        // Show success message
        showNotification('تمت إضافة المنتج إلى السلة بنجاح', 'success');
    } else {
        // Show error message
        showNotification(result.message || 'حدث خطأ أثناء إضافة المنتج إلى السلة', 'error');
    }
}

// Function to add product to wishlist
function addToWishlist(productId) {
    // Here you would implement the actual wishlist functionality
    // For now, we'll just show a notification
    showNotification('تمت إضافة المنتج إلى المفضلة', 'success');
}

// Function to show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    if (!$('.notification-container').length) {
        $('body').append('<div class="notification-container"></div>');
    }
    
    // Create notification
    const notification = $(`
        <div class="notification ${type}">
            <span class="message">${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    `);
    
    // Add notification to container
    $('.notification-container').append(notification);
    
    // Show notification
    setTimeout(() => {
        notification.addClass('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.removeClass('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Handle close button
    notification.find('.close-notification').on('click', function() {
        notification.removeClass('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Function to open cart modal
function openCartModal() {
    // Create cart modal if it doesn't exist
    if (!$('.cart-modal').length) {
        createCartModal();
    }
    
    // Update cart items
    updateCartItems();
    
    // Show modal
    $('.cart-modal').addClass('active');
}

// Function to create cart modal
function createCartModal() {
    const cartModal = $(`
        <div class="cart-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="close-modal"><i class="fas fa-times"></i></button>
                <div class="modal-body">
                    <h2 class="modal-title">سلة التسوق</h2>
                    <div class="cart-items">
                        <!-- Cart items will be loaded here -->
                    </div>
                    <div class="cart-summary">
                        <div class="cart-total">
                            <span>المجموع:</span>
                            <span class="total-amount">0.00 EGP</span>
                        </div>
                        <div class="cart-actions">
                            <button class="checkout-btn">إتمام الشراء</button>
                            <button class="continue-shopping-btn">مواصلة التسوق</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Add to body
    $('body').append(cartModal);
    
    // Handle close modal
    cartModal.find('.close-modal, .modal-overlay, .continue-shopping-btn').on('click', function() {
        closeCartModal();
    });
    
    // Handle checkout button
    cartModal.find('.checkout-btn').on('click', function() {
        closeCartModal();
        openCheckoutModal();
    });
}

// Function to update cart items
function updateCartItems() {
    const cart = CartService.getCart();
    const cartItemsContainer = $('.cart-items');
    
    // Clear container
    cartItemsContainer.empty();
    
    if (cart.items.length === 0) {
        // Show empty cart message
        cartItemsContainer.html('<div class="empty-cart">سلة التسوق فارغة</div>');
        $('.cart-total .total-amount').text('0.00 EGP');
        return;
    }
    
    // Add items to container
    cart.items.forEach(item => {
        const itemHTML = `
            <div class="cart-item" data-id="${item.productId}">
                <div class="item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i></div>';">` : 
                        `<div class="placeholder-image"><i class="fas fa-tshirt"></i></div>`
                    }
                </div>
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-price">${formatPrice(item.price)}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                        <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <button class="remove-item-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        cartItemsContainer.append(itemHTML);
    });
    
    // Update total
    $('.cart-total .total-amount').text(formatPrice(cart.total));
    
    // Handle quantity buttons
    $('.cart-item .quantity-btn.minus').on('click', function() {
        const input = $(this).siblings('.quantity-input');
        const value = parseInt(input.val()) - 1;
        if (value < 1) return;
        
        input.val(value);
        
        // Update quantity in cart
        const productId = $(this).closest('.cart-item').data('id');
        CartService.updateQuantity(productId, value);
        
        // Update total
        $('.cart-total .total-amount').text(formatPrice(CartService.getCart().total));
    });
    
    $('.cart-item .quantity-btn.plus').on('click', function() {
        const input = $(this).siblings('.quantity-input');
        const value = parseInt(input.val()) + 1;
        
        input.val(value);
        
        // Update quantity in cart
        const productId = $(this).closest('.cart-item').data('id');
        CartService.updateQuantity(productId, value);
        
        // Update total
        $('.cart-total .total-amount').text(formatPrice(CartService.getCart().total));
    });
    
    // Handle quantity input change
    $('.cart-item .quantity-input').on('change', function() {
        const value = parseInt($(this).val());
        if (value < 1) {
            $(this).val(1);
            return;
        }
        
        // Update quantity in cart
        const productId = $(this).closest('.cart-item').data('id');
        CartService.updateQuantity(productId, value);
        
        // Update total
        $('.cart-total .total-amount').text(formatPrice(CartService.getCart().total));
    });
    
    // Handle remove item button
    $('.cart-item .remove-item-btn').on('click', function() {
        const productId = $(this).closest('.cart-item').data('id');
        
        // Remove item from cart
        CartService.removeItem(productId);
        
        // Update cart items
        updateCartItems();
    });
}

// Function to close cart modal
function closeCartModal() {
    $('.cart-modal').removeClass('active');
}

// Function to open checkout modal
function openCheckoutModal() {
    // Check if user is logged in
    if (!AuthService.isLoggedIn()) {
        // Show login modal
        showNotification('يرجى تسجيل الدخول لإتمام عملية الشراء', 'info');
        // Redirect to login page
        window.location.href = 'login.html?redirect=checkout';
        return;
    }
    
    // Create checkout modal if it doesn't exist
    if (!$('.checkout-modal').length) {
        createCheckoutModal();
    }
    
    // Check if user has address
    checkUserAddress();
    
    // Update order summary
    updateOrderSummary();
    
    // Show modal
    $('.checkout-modal').addClass('active');
}

// Function to create checkout modal
function createCheckoutModal() {
    const checkoutModal = $(`
        <div class="checkout-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="close-modal"><i class="fas fa-times"></i></button>
                <div class="modal-body">
                    <h2 class="modal-title">إتمام الشراء</h2>
                    
                    <div class="checkout-steps">
                        <div class="step address-step active">
                            <h3>العنوان</h3>
                            <div class="step-content">
                                <div class="address-form">
                                    <div class="form-group">
                                        <label for="address">العنوان</label>
                                        <input type="text" id="address" class="form-input" placeholder="أدخل العنوان بالتفصيل">
                                    </div>
                                    <div class="form-group">
                                        <label>الموقع على الخريطة</label>
                                        <div id="map" style="height: 300px;"></div>
                                    </div>
                                    <input type="hidden" id="latitude" value="">
                                    <input type="hidden" id="longitude" value="">
                                    <button class="save-address-btn">حفظ العنوان</button>
                                </div>
                                <div class="saved-address" style="display: none;">
                                    <p class="address-text"></p>
                                    <button class="change-address-btn">تغيير العنوان</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step payment-step">
                            <h3>طريقة الدفع</h3>
                            <div class="step-content">
                                <div class="payment-methods">
                                    <div class="payment-method">
                                        <input type="radio" name="payment-method" id="cash-on-delivery" value="cash" checked>
                                        <label for="cash-on-delivery">الدفع عند الاستلام</label>
                                    </div>
                                    <div class="payment-method">
                                        <input type="radio" name="payment-method" id="credit-card" value="card">
                                        <label for="credit-card">بطاقة ائتمان</label>
                                    </div>
                                </div>
                                <button class="continue-to-summary-btn">متابعة</button>
                            </div>
                        </div>
                        
                        <div class="step summary-step">
                            <h3>ملخص الطلب</h3>
                            <div class="step-content">
                                <div class="order-items">
                                    <!-- Order items will be loaded here -->
                                </div>
                                <div class="order-summary">
                                    <div class="summary-row">
                                        <span>المجموع الفرعي:</span>
                                        <span class="subtotal-amount">0.00 EGP</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>رسوم التوصيل:</span>
                                        <span class="shipping-amount">0.00 EGP</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span>المجموع:</span>
                                        <span class="total-amount">0.00 EGP</span>
                                    </div>
                                </div>
                                <button class="place-order-btn">تأكيد الطلب</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Add to body
    $('body').append(checkoutModal);
    
    // Handle close modal
    checkoutModal.find('.close-modal, .modal-overlay').on('click', function() {
        closeCheckoutModal();
    });
    
    // Handle save address button
    checkoutModal.find('.save-address-btn').on('click', function() {
        saveUserAddress();
    });
    
    // Handle change address button
    checkoutModal.find('.change-address-btn').on('click', function() {
        $('.saved-address').hide();
        $('.address-form').show();
    });
    
    // Handle continue to summary button
    checkoutModal.find('.continue-to-summary-btn').on('click', function() {
        // Check if address is saved
        if (!$('.saved-address').is(':visible')) {
            showNotification('يرجى حفظ العنوان أولاً', 'error');
            return;
        }
        
        // Go to summary step
        $('.address-step, .payment-step').removeClass('active');
        $('.summary-step').addClass('active');
    });
    
    // Handle place order button
    checkoutModal.find('.place-order-btn').on('click', function() {
        placeOrder();
    });
    
    // Initialize map
    initMap();
}

// Function to check if user has address
async function checkUserAddress() {
    const result = await CartService.getUserAddress();
    
    if (result.success) {
        // User has address
        $('.address-form').hide();
        $('.saved-address').show();
        $('.address-text').text(result.data.address);
        
        // Set latitude and longitude
        $('#latitude').val(result.data.latitude);
        $('#longitude').val(result.data.longitude);
        
        // Go to payment step
        $('.address-step').removeClass('active');
        $('.payment-step').addClass('active');
    } else {
        // User doesn't have address
        $('.address-form').show();
        $('.saved-address').hide();
    }
}

// Function to save user address
async function saveUserAddress() {
    const address = $('#address').val();
    const latitude = $('#latitude').val();
    const longitude = $('#longitude').val();
    
    if (!address) {
        showNotification('يرجى إدخال العنوان', 'error');
        return;
    }
    
    if (!latitude || !longitude) {
        showNotification('يرجى تحديد الموقع على الخريطة', 'error');
        return;
    }
    
    // Save address
    const result = await CartService.updateUserAddress(address, latitude, longitude);
    
    if (result.success) {
        // Address saved successfully
        showNotification('تم حفظ العنوان بنجاح', 'success');
        
        // Update UI
        $('.address-form').hide();
        $('.saved-address').show();
        $('.address-text').text(address);
        
        // Go to payment step
        $('.address-step').removeClass('active');
        $('.payment-step').addClass('active');
    } else {
        // Error saving address
        showNotification(result.message || 'حدث خطأ أثناء حفظ العنوان', 'error');
    }
}

// Function to update order summary
function updateOrderSummary() {
    const cart = CartService.getCart();
    const orderItemsContainer = $('.order-items');
    
    // Clear container
    orderItemsContainer.empty();
    
    // Add items to container
    cart.items.forEach(item => {
        const itemHTML = `
            <div class="order-item">
                <div class="item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i></div>';">` : 
                        `<div class="placeholder-image"><i class="fas fa-tshirt"></i></div>`
                    }
                </div>
                <div class="item-details">
                    <h3 class="item-name">${item.name}</h3>
                    <div class="item-price">${formatPrice(item.price)}</div>
                    <div class="item-quantity">الكمية: ${item.quantity}</div>
                </div>
                <div class="item-total">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `;
        
        orderItemsContainer.append(itemHTML);
    });
    
    // Calculate shipping cost (fixed for now)
    const shippingCost = 30;
    
    // Update summary
    $('.subtotal-amount').text(formatPrice(cart.total));
    $('.shipping-amount').text(formatPrice(shippingCost));
    $('.total-amount').text(formatPrice(cart.total + shippingCost));
}

// Function to place order
async function placeOrder() {
    // Get payment method
    const paymentMethod = $('input[name="payment-method"]:checked').val();
    
    // Get shipping address
    const shippingAddress = $('.address-text').text();
    
    // Place order
    const result = await CartService.createOrder(paymentMethod, shippingAddress);
    
    if (result.success) {
        // Order placed successfully
        showNotification('تم تأكيد الطلب بنجاح', 'success');
        
        // Close checkout modal
        closeCheckoutModal();
        
        // Show order confirmation
        showOrderConfirmation(result.data);
    } else {
        // Error placing order
        showNotification(result.message || 'حدث خطأ أثناء تأكيد الطلب', 'error');
    }
}

// Function to show order confirmation
function showOrderConfirmation(orderData) {
    // Create confirmation modal
    const confirmationModal = $(`
        <div class="confirmation-modal active">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="close-modal"><i class="fas fa-times"></i></button>
                <div class="modal-body">
                    <div class="confirmation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2 class="modal-title">تم تأكيد الطلب بنجاح</h2>
                    <p class="confirmation-message">شكراً لك على طلبك. سيتم التواصل معك قريباً لتأكيد الطلب.</p>
                    <div class="order-details">
                        <div class="detail-row">
                            <span>رقم الطلب:</span>
                            <span>${orderData.id || orderData.documentId || 'غير متوفر'}</span>
                        </div>
                        <div class="detail-row">
                            <span>المجموع:</span>
                            <span>${formatPrice(orderData.total || 0)}</span>
                        </div>
                        <div class="detail-row">
                            <span>حالة الطلب:</span>
                            <span>${orderData.order_status === 'pending' ? 'قيد الانتظار' : orderData.order_status}</span>
                        </div>
                        <div class="detail-row">
                            <span>طريقة الدفع:</span>
                            <span>${orderData.meta && orderData.meta.payment_method === 'cash' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}</span>
                        </div>
                    </div>
                    <button class="continue-shopping-btn">مواصلة التسوق</button>
                </div>
            </div>
        </div>
    `);
    
    // Add to body
    $('body').append(confirmationModal);
    
    // Handle close modal
    confirmationModal.find('.close-modal, .modal-overlay, .continue-shopping-btn').on('click', function() {
        confirmationModal.removeClass('active');
        setTimeout(() => {
            confirmationModal.remove();
        }, 300);
    });
}

// Function to close checkout modal
function closeCheckoutModal() {
    $('.checkout-modal').removeClass('active');
}

// Function to initialize map
function initMap() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        // Load Google Maps API
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        return;
    }
    
    // Default location (Cairo, Egypt)
    const defaultLocation = { lat: 30.0444, lng: 31.2357 };
    
    // Create map
    const map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });
    
    // Create marker
    const marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
    });
    
    // Handle marker drag
    marker.addListener('dragend', function() {
        const position = marker.getPosition();
        $('#latitude').val(position.lat());
        $('#longitude').val(position.lng());
        
        // Get address from coordinates
        getAddressFromCoordinates(position.lat(), position.lng());
    });
    
    // Handle map click
    map.addListener('click', function(event) {
        marker.setPosition(event.latLng);
        $('#latitude').val(event.latLng.lat());
        $('#longitude').val(event.latLng.lng());
        
        // Get address from coordinates
        getAddressFromCoordinates(event.latLng.lat(), event.latLng.lng());
    });
    
    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user's location
                map.setCenter(userLocation);
                marker.setPosition(userLocation);
                
                // Set latitude and longitude
                $('#latitude').val(userLocation.lat);
                $('#longitude').val(userLocation.lng);
                
                // Get address from coordinates
                getAddressFromCoordinates(userLocation.lat, userLocation.lng);
            },
            function(error) {
                console.error('Error getting user location:', error);
            }
        );
    }
}

// Function to get address from coordinates
function getAddressFromCoordinates(lat, lng) {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        return;
    }
    
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    geocoder.geocode({ location: latlng }, function(results, status) {
        if (status === 'OK' && results[0]) {
            $('#address').val(results[0].formatted_address);
        } else {
            console.error('Geocoder failed due to:', status);
        }
    });
} 
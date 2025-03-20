// Function to load popular products from API
async function loadPopularProducts() {
    // Get current language
    const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading popular products for language:', currentLang);
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل المنتجات...') : 'جاري تحميل المنتجات...';
    
    // Show loading state
    $('.featured-carousel').html(`<div class="loading-products">${loadingText}</div>`);
    
    try {
        // Fetch popular products from API
        const result = await ContentService.getPopularProducts();
        
        console.log('Popular Products API response:', result);
        
        // First, check if we have the expected structure with products array
        if (result.success && result.data && Array.isArray(result.data.products) && result.data.products.length > 0) {
            // Clear loading state
            $('.featured-carousel').empty();
            
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
                    } else if (product.product_image?.data?.attributes?.url) {
                        imageUrl = API_BASE_URL + product.product_image.data.attributes.url;
                    }
                    
                    console.log(`Popular product ${index + 1} image URL:`, imageUrl);
                    
                    // Format price if available
                    const price = product.product_price || 0;
                    const oldPrice = product.old_price || 0;
                    
                    // Determine badge
                    let badge = '';
                    if (product.is_new) {
                        badge = 'جديد';
                    } else if (oldPrice > price) {
                        const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
                        badge = `خصم ${discount}%`;
                    }
                    
                    // Get image not available text based on current language
                    const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                    
                    // Create product card HTML
                    const productHtml = `
                        <div class="featured-card" data-product-id="${productId}">
                            ${badge ? `<div class="featured-badge ${oldPrice > price ? 'sale' : ''}">${badge}</div>` : ''}
                            <div class="featured-image">
                                ${imageUrl ? 
                                    `<img src="${imageUrl}" alt="${productName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-tshirt\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                    `<div class="placeholder-image"><i class="fas fa-tshirt"></i><span>${imageNotAvailableText}</span></div>`
                                }
                                <div class="featured-actions">
                                    <button class="action-btn" onclick="addToCart(event, ${productId})">
                                        <i class="fas fa-shopping-cart"></i>
                                    </button>
                                    <button class="action-btn product-view-btn" onclick="viewProduct(event, ${productId})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="featured-info">
                                <h3 class="featured-title">${productName}</h3>
                                <div class="featured-price">
                                    <span class="current-price">${price} جنيه</span>
                                    ${oldPrice > 0 ? `<span class="old-price">${oldPrice} جنيه</span>` : ''}
                                </div>
                                <div class="featured-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star-half-alt"></i>
                                    <span class="rating-count">(32 تقييم)</span>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    $('.featured-carousel').append(productHtml);
                    productsAdded++;
                } catch (error) {
                    console.error(`Error processing popular product ${index + 1}:`, error, product);
                }
            });
            
            console.log(`Added ${productsAdded} popular products to the grid`);
            
            // If no products were added successfully, show error
            if (productsAdded === 0) {
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                $('.featured-carousel').html(`<div class="products-error">${errorText}</div>`);
            }
        } else {
            // Try to extract products from a different structure
            let products = [];
            
            // Check if data itself is an array
            if (Array.isArray(result.data)) {
                products = result.data;
            } else if (result.data.data && Array.isArray(result.data.data)) {
                // Some APIs nest data in a data property
                products = result.data.data;
            }
            
            if (products.length > 0) {
                // Process products similar to above
                $('.featured-carousel').empty();
                let productsAdded = 0;
                
                products.forEach((product, index) => {
                    try {
                        // Similar product processing logic as above
                        const productId = product.id || index + 1;
                        const productName = product.title || product.name || 'منتج بدون اسم';
                        let imageUrl = '';
                        
                        if (product.images?.data?.[0]?.attributes?.url) {
                            imageUrl = API_BASE_URL + product.images.data[0].attributes.url;
                        }
                        
                        const price = product.price || 0;
                        const oldPrice = product.old_price || 0;
                        
                        // Create product card HTML (same as above)
                        const productHtml = `
                            <div class="featured-card" data-product-id="${productId}">
                                ${oldPrice > price ? `<div class="featured-badge sale">خصم ${Math.round(((oldPrice - price) / oldPrice) * 100)}%</div>` : ''}
                                <div class="featured-image">
                                    <img src="${imageUrl}" alt="${productName}" onerror="this.src='img/placeholder.jpg'">
                                    <div class="featured-actions">
                                        <button class="action-btn" onclick="addToCart(event, ${productId})">
                                            <i class="fas fa-shopping-cart"></i>
                                        </button>
                                        <button class="action-btn product-view-btn" onclick="viewProduct(event, ${productId})">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="featured-info">
                                    <h3 class="featured-title">${productName}</h3>
                                    <div class="featured-price">
                                        <span class="current-price">${price} جنيه</span>
                                        ${oldPrice > 0 ? `<span class="old-price">${oldPrice} جنيه</span>` : ''}
                                    </div>
                                    <div class="featured-rating">
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star"></i>
                                        <i class="fas fa-star-half-alt"></i>
                                        <span class="rating-count">(32 تقييم)</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        $('.featured-carousel').append(productHtml);
                        productsAdded++;
                    } catch (error) {
                        console.error(`Error processing product ${index + 1}:`, error, product);
                    }
                });
                
                if (productsAdded === 0) {
                    const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                    $('.featured-carousel').html(`<div class="products-error">${errorText}</div>`);
                }
            } else {
                // No products found in any structure
                console.error('No products found in API response');
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
                $('.featured-carousel').html(`<div class="products-error">${errorText}</div>`);
            }
        }
    } catch (error) {
        console.error('Error in loadPopularProducts:', error);
        const errorText = window.translateText ? window.translateText('عذراً، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
        $('.featured-carousel').html(`<div class="products-error">${errorText}</div>`);
    }
}

// Add to cart function
function addToCart(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Adding product to cart:', productId);
    // TODO: Implement cart functionality
}

// View product function
function viewProduct(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Viewing product:', productId);
    // TODO: Implement product view functionality
}

// Initialize when document is ready
$(document).ready(function() {
    loadPopularProducts();
}); 
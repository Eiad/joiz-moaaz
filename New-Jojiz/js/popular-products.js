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
                        <div class="product-card" data-id="${productId}">
                            <div class="product-image">
                                <img src="${imageUrl}" alt="${productName}">
                                <div class="product-actions">
                                    <button class="action-btn" onclick="addToCartFromPopular(event, this)"
                                        data-product-id="${productId}"
                                        data-product-name="${productName}"
                                        data-product-price="${price}">
                                        <i class="fas fa-shopping-cart"></i>
                                    </button>
                                    <button class="action-btn add-to-wishlist" onclick="addToWishlistFromPopular(event, this)"
                                        data-product-id="${productId}">
                                        <i class="far fa-heart"></i>
                                    </button>
                                    <button class="action-btn product-view-btn" onclick="viewProductModal(event, this)"
                                        data-product-id="${productId}"
                                        data-product-name="${productName}"
                                        data-product-price="${price}"
                                        data-product-image="${imageUrl}">
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
                            <div class="product-card" data-id="${productId}">
                                <div class="product-image">
                                    <img src="${imageUrl}" alt="${productName}">
                                    <div class="product-actions">
                                        <button class="action-btn" onclick="addToCartFromPopular(event, this)"
                                            data-product-id="${productId}"
                                            data-product-name="${productName}"
                                            data-product-price="${price}">
                                            <i class="fas fa-shopping-cart"></i>
                                        </button>
                                        <button class="action-btn add-to-wishlist" onclick="addToWishlistFromPopular(event, this)"
                                            data-product-id="${productId}">
                                            <i class="far fa-heart"></i>
                                        </button>
                                        <button class="action-btn product-view-btn" onclick="viewProductModal(event, this)"
                                            data-product-id="${productId}"
                                            data-product-name="${productName}"
                                            data-product-price="${price}"
                                            data-product-image="${imageUrl}">
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

// Add this function to handle add to cart
function addToCartFromPopular(event, button) {
    event.preventDefault();
    
    // Get the parent product card
    const productCard = button.closest('.product-card');
    if (!productCard) return;
    
    // Get product details
    const productName = productCard.querySelector('.featured-title').textContent;
    
    // Get price text and clean it
    const priceElement = productCard.querySelector('.current-price');
    if (!priceElement) return;
    
    const priceText = priceElement.textContent;
    // Extract only numbers and decimal point
    const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
    const productPrice = parseFloat(cleanedPrice);
    
    // Get product image
    const productImage = productCard.querySelector('.product-image img')?.src;
    
    // Add to cart using the existing function
    addToCartItem(productName, productPrice, productImage);
}

// Initialize local favorites
function initLocalFavorites() {
    if (!localStorage.getItem('localFavorites')) {
        localStorage.setItem('localFavorites', JSON.stringify([]));
    }
    updateFavoriteButtons();
}

// Get favorites from localStorage
function getLocalFavorites() {
    return JSON.parse(localStorage.getItem('localFavorites')) || [];
}

// Save favorites to localStorage
function saveLocalFavorites(favorites) {
    localStorage.setItem('localFavorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

// Update all wishlist buttons state
function updateFavoriteButtons() {
    const favorites = getLocalFavorites();
    
    // Update all wishlist buttons
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        const productId = button.dataset.productId;
        const icon = button.querySelector('i');
        
        if (favorites.includes(productId)) {
            button.classList.add('active');
            icon.classList.remove('fa-heart');
            icon.classList.add('fa-heart-broken');
        } else {
            button.classList.remove('active');
            icon.classList.remove('fa-heart-broken');
            icon.classList.add('fa-heart');
        }
    });
    
    // Update wishlist badge in header
    const wishlistBadge = document.querySelector('.wishlist-badge');
    if (favorites.length > 0) {
        if (!wishlistBadge) {
            const badge = document.createElement('span');
            badge.className = 'wishlist-badge';
            badge.textContent = favorites.length;
            document.querySelector('.wishlist')?.appendChild(badge);
        } else {
            wishlistBadge.textContent = favorites.length;
        }
    } else if (wishlistBadge) {
        wishlistBadge.remove();
    }
}

// Toggle favorite status
function toggleLocalFavorite(productId) {
    const favorites = getLocalFavorites();
    
    // Check if product is already in favorites
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(productId);
        showNotification('تمت إضافة المنتج إلى المفضلة', 'success');
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        showNotification('تمت إزالة المنتج من المفضلة', 'success');
    }
    
    // Save favorites
    saveLocalFavorites(favorites);
    
    // Update button state
    updateFavoriteButtons();
    
    return { success: true };
}

// Update the product card template to include wishlist button
function createProductCard(product) {
    const productHtml = `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-actions">
                    <button class="action-btn" onclick="addToCartFromPopular(event, this)"
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="action-btn add-to-wishlist" onclick="toggleLocalFavorite('${product.id}')"
                        data-product-id="${product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="action-btn quick-view-btn" onclick="openQuickViewModal(event, '${product.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${product.price} جنيه</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice} جنيه</span>` : ''}
                </div>
                <div class="product-rating">
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
    return productHtml;
}

// Quick view modal functionality
async function openQuickViewModal(event, product) {
    event.preventDefault();
    const modal = document.querySelector('.quick-view-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    try {
        // Get the product description from the first image
        const description = product.description || product.product_description || `امنحي طفلتك إطلالة ساحرة بفستان الأميرة الوردي المصمم بعناية ليمنحها راحة وأناقة في المناسبات. يتميز الفستان بتصميمه الرقيق مع لمسات من الدانتيل والتطريز الناعم، بالإضافة إلى تنورة منفوشة من التول تمنحها إحساساً بالحركة والخفة. وصف المنتج: تصميم فاخر يناسب الحفلات والمناسبات الخاصة. خامات ناعمة ومريحة لبشرة الأطفال. تطريز أنيق يضفي لمسة من الفخامة. تنورة منفوشة لإطلالة ملكية ساحرة.`;

        const modalContent = `
            <div class="product-loading">
                جاري تحميل المنتج...
            </div>
            <div class="product-content">
                <div class="product-gallery">
                    <div class="main-image">
                        <img src="${product.imageUrl || product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='images/placeholder.jpg';">
                    </div>
                    <div class="thumbnail-images">
                        ${generateThumbnails(product)}
                    </div>
                </div>
                <div class="product-info">
                    <h2 class="product-title">${product.name || product.product_name}</h2>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span class="rating-count">(32 تقييم)</span>
                    </div>
                    <div class="product-price">
                        <span class="price">${product.price || product.product_price} جنيه</span>
                    </div>
                    <div class="product-description">
                        ${description}
                    </div>
                    <div class="product-meta">
                        <div class="product-category">
                            الفئة: <a href="#">${product.category || 'فساتين سواريه'}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = modalContent;
        modal.classList.add('active');
        
        // Hide loading after content is loaded
        const loadingEl = modal.querySelector('.product-loading');
        const contentEl = modal.querySelector('.product-content');
        loadingEl.style.display = 'none';
        contentEl.style.display = 'flex';
        
        // Setup modal event listeners and slider
        setupModalEventListeners(modal, product);
        
    } catch (error) {
        console.error('Error opening quick view modal:', error);
    }
}

// Helper function to generate thumbnails HTML
function generateThumbnails(product) {
    const images = product.images || [
        product.imageUrl || product.image,
        product.imageUrl || product.image // Duplicate for testing if no additional images
    ];

    return images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
            <img src="${image}" alt="${product.name || product.product_name} - ${index + 1}" 
                 onerror="this.onerror=null; this.src='images/placeholder.jpg';">
        </div>
    `).join('');
}

function setupModalEventListeners(modal, product) {
    // Close modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = closeQuickViewModal;
    
    // Close on outside click
    window.onclick = (event) => {
        if (event.target === modal) {
            closeQuickViewModal();
        }
    };
    
    // Thumbnail image slider
    const thumbnails = modal.querySelectorAll('.thumbnail');
    const mainImage = modal.querySelector('.main-image img');
    
    thumbnails.forEach(thumb => {
        thumb.onclick = () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            thumb.classList.add('active');
            // Update main image
            const newImageSrc = thumb.dataset.image;
            if (newImageSrc) {
                mainImage.src = newImageSrc;
            }
        };
    });
}

function closeQuickViewModal() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function updateWishlistButton(button, productId) {
    const favorites = getLocalFavorites();
    const icon = button.querySelector('i');
    
    if (favorites.includes(productId)) {
        button.classList.add('active');
        icon.classList.remove('fa-heart');
        icon.classList.add('fa-heart-broken');
    } else {
        button.classList.remove('active');
        icon.classList.remove('fa-heart-broken');
        icon.classList.add('fa-heart');
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize favorites
    initLocalFavorites();
    
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        createNotificationContainer();
    }
    
    // Setup modal close handlers
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeQuickViewModal);
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeQuickViewModal();
            }
        });
    }
});

// Initialize when document is ready
$(document).ready(function() {
    loadPopularProducts();
});

// Add these functions to handle the actions
function addToWishlistFromPopular(event, button) {
    event.preventDefault();
    const productId = button.dataset.productId;
    if (!productId) return;
    
    toggleLocalFavorite(productId);
}

function viewProductModal(event, button) {
    event.preventDefault();
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const productPrice = button.dataset.productPrice;
    const productImage = button.dataset.productImage;
    
    if (!productId) return;
    
    openQuickViewModal(event, {
        id: productId,
        name: productName,
        price: productPrice,
        imageUrl: productImage
    });
} 
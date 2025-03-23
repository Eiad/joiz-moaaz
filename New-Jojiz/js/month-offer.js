// Function to format price with currency
function formatPrice(price) {
    if (!price && price !== 0) return 'السعر عند الطلب';
    return `${price} جنيه`;
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
            
            // Try different possible structures for products array
            let products = [];
            
            if (Array.isArray(result.data)) {
                // If data is directly an array of products
                console.log('Data is an array');
                products = result.data;
            } else if (result.data.products && Array.isArray(result.data.products)) {
                // If products are in a products property
                console.log('Found products array in data.products');
                products = result.data.products;
            } else if (result.data.data && Array.isArray(result.data.data)) {
                // If products are in a data property
                console.log('Found products array in data.data');
                products = result.data.data;
            } else if (result.data.attributes && result.data.attributes.products) {
                // If products are in attributes.products
                console.log('Found products in attributes.products');
                products = result.data.attributes.products;
            }
            
            console.log('Extracted products:', products);
            
            if (products.length > 0) {
                // Clear loading state
                offerContent.empty();
                
                // Process each product in the month offer
                products.forEach((product, index) => {
                    try {
                        console.log(`Processing month offer product ${index + 1}:`, product);
                        
                        // Extract product data with fallbacks
                        const productId = product.documentId || product.id || index;
                        const productName = product.product_name || product.name || product.title || 'منتج بدون اسم';
                        const productDescription = product.product_description || product.description || '';
                        
                        // Extract price from description if product_price is null
                        let price = 'السعر عند الطلب';
                        if (product.product_price || product.price) {
                            price = formatPrice(product.product_price || product.price);
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
                            } else if (product.product_image.data && product.product_image.data.attributes && product.product_image.data.attributes.url) {
                                imageUrl = API_BASE_URL + product.product_image.data.attributes.url;
                            } else if (product.product_image.formats && product.product_image.formats.medium) {
                                imageUrl = API_BASE_URL + product.product_image.formats.medium.url;
                            } else if (product.product_image.formats && product.product_image.formats.small) {
                                imageUrl = API_BASE_URL + product.product_image.formats.small.url;
                            } else if (product.product_image.formats && product.product_image.formats.thumbnail) {
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
                            } else if (media.data && media.data.attributes && media.data.attributes.url) {
                                imageUrl = API_BASE_URL + media.data.attributes.url;
                            } else if (media.formats && media.formats.medium) {
                                imageUrl = API_BASE_URL + media.formats.medium.url;
                            } else if (media.formats && media.formats.small) {
                                imageUrl = API_BASE_URL + media.formats.small.url;
                            } else if (media.formats && media.formats.thumbnail) {
                                imageUrl = API_BASE_URL + media.formats.thumbnail.url;
                            }
                        }
                        
                        // Try image property as last resort
                        if (!imageUrl && product.image) {
                            if (typeof product.image === 'string') {
                                imageUrl = API_BASE_URL + product.image;
                            } else if (product.image.url) {
                                imageUrl = API_BASE_URL + product.image.url;
                            } else if (product.image.data && product.image.data.attributes && product.image.data.attributes.url) {
                                imageUrl = API_BASE_URL + product.image.data.attributes.url;
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
                                    <a href="#" class="offer-btn" onclick="addToCartFromOffer(event, this)" data-product-id="${productId}" data-product-name="${productName}" data-product-price="${product.product_price || product.price || 0}">
                                        <i class="fas fa-shopping-cart"></i>
                                        تسوق الآن
                                    </a>
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

// Add this function to handle add to cart
function addToCartFromOffer(event, button) {
    event.preventDefault();
    
    // Get the parent offer card
    const offerCard = button.closest('.month-offer-item');
    if (!offerCard) return;
    
    // Get product details
    const productName = offerCard.querySelector('h3').textContent;
    
    // Get price text and clean it
    const priceElement = offerCard.querySelector('.price');
    if (!priceElement) return;
    
    const priceText = priceElement.textContent;
    // Extract only numbers and decimal point
    const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
    const productPrice = parseFloat(cleanedPrice);
    
    // Get product image
    const productImage = offerCard.querySelector('.offer-image img')?.src;
    
    // Add to cart using the existing function
    addToCartItem(productName, productPrice, productImage);
}

// Initialize when document is ready
$(document).ready(function() {
    loadMonthOffer();
}); 
// Update the product card template
const productHTML = `
    <div class="featured-card">
        <div class="featured-badge">${badge}</div>
        <div class="featured-image">
            <img src="${imageUrl}" alt="${productName}">
            <div class="featured-actions">
                <button class="action-btn" onclick="addToCartFromFeatured(event, this)" 
                    data-product-id="${productId}" 
                    data-product-name="${productName}" 
                    data-product-price="${productPrice}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="action-btn product-view-btn" onclick="viewProduct(event)">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <!-- ... rest of the product card ... -->
    </div>
`;

// Add this function to handle add to cart
function addToCartFromFeatured(event, button) {
    event.preventDefault();
    
    // Get the parent featured card
    const featuredCard = button.closest('.featured-card');
    if (!featuredCard) return;
    
    // Get product details
    const productName = featuredCard.querySelector('.featured-title').textContent;
    
    // Get price text and clean it
    const priceElement = featuredCard.querySelector('.current-price');
    if (!priceElement) return;
    
    const priceText = priceElement.textContent;
    // Extract only numbers and decimal point
    const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
    const productPrice = parseFloat(cleanedPrice);
    
    // Get product image
    const productImage = featuredCard.querySelector('.featured-image img')?.src;
    
    // Add to cart using the existing function
    addToCartItem(productName, productPrice, productImage);
} 
// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCart();
    
    // Update cart display
    updateCartDisplay();
    
    // Add event listener for checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            if (cartItems.length === 0) {
                e.preventDefault();
                alert('سلة التسوق فارغة. يرجى إضافة منتجات قبل متابعة الدفع.');
            }
        });
    }
});

// Load cart items from localStorage
function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (cartItems.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'flex';
        }
        return;
    }
    
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Clear existing items
    if (cartItemsContainer) {
        // Keep the empty cart message
        const message = cartItemsContainer.querySelector('.empty-cart-message');
        cartItemsContainer.innerHTML = '';
        if (message) {
            cartItemsContainer.appendChild(message);
            message.style.display = 'none';
        }
        
        // Add each cart item
        cartItems.forEach((item, index) => {
            const cartItemElement = createCartItemElement(item, index);
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    // Update totals
    updateCartTotals();
}

// Create cart item element
function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
            <h4 class="item-name">${item.name}</h4>
            <div class="item-price">${item.price} جنيه</div>
        </div>
        <div class="item-quantity">
            <button class="quantity-btn decrease" data-index="${index}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn increase" data-index="${index}">+</button>
        </div>
        <div class="item-total">${(item.price * item.quantity).toFixed(2)} جنيه</div>
        <button class="remove-item" data-index="${index}">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;
    
    // Add event listeners
    cartItem.querySelector('.decrease').addEventListener('click', function() {
        updateItemQuantity(index, -1);
    });
    
    cartItem.querySelector('.increase').addEventListener('click', function() {
        updateItemQuantity(index, 1);
    });
    
    cartItem.querySelector('.remove-item').addEventListener('click', function() {
        removeCartItem(index);
    });
    
    return cartItem;
}

// Update item quantity
function updateItemQuantity(index, change) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems[index]) {
        cartItems[index].quantity += change;
        
        if (cartItems[index].quantity <= 0) {
            // Remove item if quantity is 0 or less
            cartItems.splice(index, 1);
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        loadCart();
        updateCartDisplay();
    }
}

// Remove cart item
function removeCartItem(index) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if (cartItems[index]) {
        cartItems.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        loadCart();
        updateCartDisplay();
    }
}

// Update cart totals
function updateCartTotals() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    // Calculate shipping (free over 700 EGP, otherwise 50 EGP)
    const shipping = subtotal > 700 ? 0 : 50;
    
    // Calculate total
    const total = subtotal + shipping;
    
    // Update display
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} جنيه`;
    if (shippingElement) shippingElement.textContent = shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} جنيه`;
    if (totalElement) totalElement.textContent = `${total.toFixed(2)} جنيه`;
}

// Update cart display in header
function updateCartDisplay() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    // Update cart total in header
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        cartTotal.textContent = `${total.toFixed(2)}EGP`;
    }
} 
document.addEventListener('DOMContentLoaded', function() {
    // Get slider elements
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentSlide = 0;
    
    // Function to show a specific slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the current slide and activate its dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }
    
    // Next slide function
    function nextSlide() {
        currentSlide++;
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }
        showSlide(currentSlide);
    }
    
    // Previous slide function
    function prevSlide() {
        currentSlide--;
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }
        showSlide(currentSlide);
    }
    
    // Event listeners for buttons
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
});

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const filtersSidebar = document.getElementById('filtersSidebar');
    const closeFiltersBtn = document.getElementById('closeFilters');

    // Toggle filter sidebar
    filterToggleBtn.addEventListener('click', function() {
        filtersSidebar.classList.toggle('active');
    });

    // Close filter sidebar when clicking X button
    closeFiltersBtn.addEventListener('click', function() {
        filtersSidebar.classList.remove('active');
    });

    // Close filter sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (filtersSidebar.classList.contains('active') && 
            !filtersSidebar.contains(event.target) && 
            event.target !== filterToggleBtn && 
            !filterToggleBtn.contains(event.target)) {
            filtersSidebar.classList.remove('active');
        }
    });

    // Handle filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Get all checked filters
            const checkedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.id);
            const checkedRatings = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(input => input.id);
            const checkedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(input => input.id);

            // Get all products
            const products = document.querySelectorAll('.product-card');

            // Filter products
            products.forEach(product => {
                const productCategory = product.dataset.category;
                const productRating = product.dataset.rating;
                const productBrand = product.dataset.brand;

                let showProduct = true;

                // Check category filter
                if (checkedCategories.length > 0 && !checkedCategories.includes(`category-${productCategory}`)) {
                    showProduct = false;
                }

                // Check rating filter
                if (checkedRatings.length > 0 && !checkedRatings.includes(`rating-${productRating}`)) {
                    showProduct = false;
                }

                // Check brand filter
                if (checkedBrands.length > 0) {
                    const brandId = `brand-${Array.from(document.querySelectorAll('input[name="brand"]')).findIndex(input => input.nextElementSibling.textContent.trim().includes(productBrand)) + 1}`;
                    if (!checkedBrands.includes(brandId)) {
                        showProduct = false;
                    }
                }

                // Show or hide product
                product.style.display = showProduct ? 'block' : 'none';
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Get all products
    const products = document.querySelectorAll('.product-card');
    // How many products to show per page
    const productsPerPage = 6;
    
    // Function to show products for a specific page
    function showPage(pageNumber) {
        // Hide all products first
        products.forEach(product => product.style.display = 'none');
        
        // Calculate which products to show
        const start = (pageNumber - 1) * productsPerPage;
        const end = start + productsPerPage;
        
        // Show only the products for this page
        for(let i = start; i < end && i < products.length; i++) {
            products[i].style.display = 'block';
        }
        
        // Update active page in pagination
        document.querySelectorAll('.pagination a').forEach(a => {
            a.classList.remove('active');
            if(a.textContent == pageNumber) {
                a.classList.add('active');
            }
        });
    }
    
    // Add click handlers to pagination links
    document.querySelectorAll('.pagination a').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            if(!this.classList.contains('next')) {
                const pageNumber = parseInt(this.textContent);
                showPage(pageNumber);
            }
        });
    });
    
    // Show first page by default
    showPage(1);
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.popular-products .products-slider');
    const prevBtn = document.querySelector('.popular-products .prev-btn');
    const nextBtn = document.querySelector('.popular-products .next-btn');
    const cards = document.querySelectorAll('.popular-products .product-card');
    
    let currentIndex = 0;
    const cardWidth = 310; // card width + gap
    const visibleCards = Math.floor(slider.offsetWidth / cardWidth);
    const maxIndex = cards.length - visibleCards;

    function updateSlider(smooth = true) {
        const offset = -currentIndex * cardWidth;
        slider.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
        slider.style.transform = `translateX(${offset}px)`;
    }
    
    function nextSlide() {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        } else {
            // Optional: Loop back to start
            currentIndex = 0;
            updateSlider();
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        } else {
            // Optional: Loop to end
            currentIndex = maxIndex;
            updateSlider();
        }
    }

    // Auto slide
    let autoSlideInterval;
    
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 3000);
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    });
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            nextSlide();
        } else if (touchEndX - touchStartX > 50) {
            prevSlide();
        }
        startAutoSlide();
    });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Initialize
    updateSlider(false);
    startAutoSlide();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newVisibleCards = Math.floor(slider.offsetWidth / cardWidth);
        if (newVisibleCards !== visibleCards) {
            currentIndex = 0;
            updateSlider(false);
        }
    });
});

// Main page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if not exists
    if (!localStorage.getItem('cartItems')) {
        localStorage.setItem('cartItems', JSON.stringify([]));
    }
    
    // Update cart display
    updateCartDisplay();
    
    // Add event listeners to all "Add to Cart" buttons
    setupAddToCartButtons();
    
    // Setup slider functionality
    setupSlider();
    
    // Setup product sliders
    setupProductSlider();
    
    // Setup deal carousel
    setupDealCarousel();
});

// Setup "Add to Cart" buttons
function setupAddToCartButtons() {
    // We're now using the inline onclick handlers in the HTML
    // No need to add event listeners here
    console.log("Cart buttons initialized with inline handlers");
}

// Function to handle View Product button clicks from HTML
function viewProduct(event) {
    event.preventDefault();
    
    // Get the parent featured card
    const featuredCard = event.target.closest('.featured-card') || 
                         event.target.closest('.product-card');
    
    if (!featuredCard) return;
    
    // Get product details
    const productName = featuredCard.querySelector('.featured-title')?.textContent || 
                        featuredCard.querySelector('.product-title')?.textContent;
    
    const priceElement = featuredCard.querySelector('.current-price');
    const oldPriceElement = featuredCard.querySelector('.old-price');
    const ratingStarsElement = featuredCard.querySelector('.featured-rating') || 
                              featuredCard.querySelector('.product-rating');
    const ratingCountElement = featuredCard.querySelector('.rating-count');
    const productImage = featuredCard.querySelector('.featured-image img')?.src || 
                         featuredCard.querySelector('.product-image img')?.src;
    
    // Get the modal elements
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalProductTitle');
    const modalCurrentPrice = document.getElementById('modalCurrentPrice');
    const modalOldPrice = document.getElementById('modalOldPrice');
    const modalRatingStars = document.getElementById('modalRatingStars');
    const modalRatingCount = document.getElementById('modalRatingCount');
    const modalImage = document.getElementById('modalProductImage');
    const modalAvailability = document.getElementById('modalAvailability');
    const modalDescription = document.getElementById('modalDescription');
    
    // Set modal content
    modalTitle.textContent = productName;
    modalCurrentPrice.textContent = priceElement ? priceElement.textContent : '';
    modalOldPrice.textContent = oldPriceElement ? oldPriceElement.textContent : '';
    modalOldPrice.style.display = oldPriceElement ? 'inline-block' : 'none';
    
    // Set rating stars
    if (ratingStarsElement) {
        modalRatingStars.innerHTML = ratingStarsElement.innerHTML.replace(/<span.*<\/span>/, '');
    } else {
        modalRatingStars.innerHTML = '';
    }
    
    // Set rating count
    if (ratingCountElement) {
        modalRatingCount.textContent = ratingCountElement.textContent;
    } else {
        modalRatingCount.textContent = '';
    }
    
    // Set product image
    if (productImage) {
        modalImage.src = productImage;
        modalImage.alt = productName;
    }
    
    // Set availability (you can customize this based on your data)
    modalAvailability.innerHTML = '<span class="in-stock">متوفر في المخزون</span>';
    
    // Set description (you can customize this or get it from data attributes)
    modalDescription.textContent = 'وصف المنتج: ' + productName + ' هو منتج عالي الجودة مصنوع من أفضل المواد.';
    
    // Show the modal
    modal.style.display = 'block';
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // Close when clicking outside the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
    
    // Setup quantity buttons
    const minusBtn = modal.querySelector('.quantity-btn.minus');
    const plusBtn = modal.querySelector('.quantity-btn.plus');
    const quantityInput = modal.querySelector('.quantity-input');
    
    minusBtn.onclick = function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    };
    
    plusBtn.onclick = function() {
        let value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
    };
    
    // Setup add to cart button in modal
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    addToCartBtn.onclick = function() {
        // Get price text and clean it
        const priceText = modalCurrentPrice.textContent;
        const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
        const productPrice = parseFloat(cleanedPrice);
        
        // Get quantity
        const quantity = parseInt(quantityInput.value);
        
        // Add to cart multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
            addToCartItem(productName, productPrice, modalImage.src);
        }
        
        // Close the modal
        modal.style.display = 'none';
    };
}

// Function to handle Add to Cart button clicks from HTML
function addToCart(event) {
    event.preventDefault();
    
    // Get the parent featured card
    const featuredCard = event.target.closest('.featured-card') || 
                         event.target.closest('.product-card');
    
    if (!featuredCard) return;
    
    // Get product details
    const productName = featuredCard.querySelector('.featured-title')?.textContent || 
                        featuredCard.querySelector('.product-title')?.textContent;
    
    // Get price text and clean it
    const priceElement = featuredCard.querySelector('.current-price');
    if (!priceElement) return;
    
    const priceText = priceElement.textContent;
    // Extract only numbers and decimal point
    const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
    const productPrice = parseFloat(cleanedPrice);
    
    // Check if price is valid
    if (isNaN(productPrice)) {
        console.error('Invalid price format:', priceText);
        alert('Error: Could not determine product price');
        return;
    }
    
    // Get product image
    const productImage = featuredCard.querySelector('.featured-image img')?.src || 
                         featuredCard.querySelector('.product-image img')?.src;
    
    // Add to cart using the existing function
    addToCartItem(productName, productPrice, productImage);
}

// Function to handle Add to Cart from Deal section
function addToCartFromDeal(event, button) {
    event.preventDefault();
    
    // Get the parent deal card
    const dealCard = button.closest('.deal-card');
    if (!dealCard) return;
    
    // Get product details
    const productName = dealCard.querySelector('.deal-title').textContent;
    
    // Get price text and clean it
    const priceElement = dealCard.querySelector('.current-price');
    if (!priceElement) return;
    
    const priceText = priceElement.textContent;
    // Extract only numbers and decimal point
    const cleanedPrice = priceText.replace(/[^0-9.]/g, '');
    const productPrice = parseFloat(cleanedPrice);
    
    // Check if price is valid
    if (isNaN(productPrice)) {
        console.error('Invalid price format:', priceText);
        alert('Error: Could not determine product price');
        return;
    }
    
    // Get product image
    const productImage = dealCard.querySelector('.deal-image img').src;
    
    // Add to cart using the existing function
    addToCartItem(productName, productPrice, productImage);
}

// Renamed the original addToCart function to avoid conflicts
function addToCartItem(name, price, image) {
    // Get current cart
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(item => item.name === name);
    
    if (existingItemIndex !== -1) {
        // Increase quantity if already in cart
        cartItems[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cartItems.push({
            name,
            price,
            image,
            quantity: 1
        });
    }
    
    // Save updated cart
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart display
    updateCartDisplay();
    
    // Show success message
    showAddToCartMessage(name);
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

// Show "Added to Cart" message
function showAddToCartMessage(productName) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'add-to-cart-message';
    messageElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>تمت إضافة "${productName}" إلى سلة التسوق</span>
    `;
    
    // Add to body
    document.body.appendChild(messageElement);
    
    // Show message
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Setup main slider
function setupSlider() {
    const slides = document.querySelectorAll('.main-slider .slide');
    const dots = document.querySelectorAll('.main-slider .dot');
    const prevBtn = document.querySelector('.main-slider .prev-btn');
    const nextBtn = document.querySelector('.main-slider .next-btn');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    
    // Show slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
}

// Setup product slider
function setupProductSlider() {
    const slider = document.querySelector('.products-slider');
    const prevBtn = document.querySelector('.popular-products .prev-btn');
    const nextBtn = document.querySelector('.popular-products .next-btn');
    
    if (!slider) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events for drag scrolling
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        slider.scrollLeft = scrollLeft - walk;
    });
    
    // Button navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    }
}

// Setup deal carousel
function setupDealCarousel() {
    const carousel = document.querySelector('.deal-carousel');
    
    if (!carousel) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events for drag scrolling
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Update auth link based on login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    const authLink = document.getElementById('authLink');
    
    if (authLink && isLoggedIn && currentUser) {
        // User is logged in, update auth link
        const userData = JSON.parse(localStorage.getItem('user_' + currentUser));
        if (userData) {
            // Change LOGIN/REGISTER to LOGOUT
            authLink.textContent = 'LOGOUT (' + userData.name + ')';
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                window.location.reload();
            };
        }
    }
    
    // Override add to cart functions to check login
    window.originalAddToCart = window.addToCart;
    window.addToCart = function(event) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            event.preventDefault();
            alert('Please log in to add items to your cart');
            window.location.href = 'login.html';
            return false;
        }
        
        // Call original function if it exists
        if (typeof window.originalAddToCart === 'function') {
            return window.originalAddToCart(event);
        }
    };
    
    window.originalAddToCartFromDeal = window.addToCartFromDeal;
    window.addToCartFromDeal = function(event, button) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            event.preventDefault();
            alert('Please log in to add items to your cart');
            window.location.href = 'login.html';
            return false;
        }
        
        // Call original function if it exists
        if (typeof window.originalAddToCartFromDeal === 'function') {
            return window.originalAddToCartFromDeal(event, button);
        }
    };
});
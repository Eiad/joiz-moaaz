// Function to load banners from API
async function loadBanners() {
    // Get current language
    const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading banners for language:', currentLang);
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل البانرات...') : 'جاري تحميل البانرات...';
    
    // Show loading state
    $('.banner-carousel').html(`<div class="banner-loading">${loadingText}</div>`);
    
    // Fetch banners from API
    const result = await ContentService.getBanners();
    
    console.log('Banner API response:', result);
    
    if (result.success && result.data && result.data.length > 0) {
        console.log('Banner data:', result.data);
        
        // Clear loading state
        $('.banner-carousel').empty();
        
        let bannersAdded = 0;
        
        // Generate banner slides
        result.data.forEach((banner, index) => {
            try {
                const isActive = bannersAdded === 0 ? 'active' : '';
                let imageUrl = '';
                
                // Try different possible data structures
                if (banner.attributes && banner.attributes.image && banner.attributes.image.data) {
                    // New API structure
                    imageUrl = API_BASE_URL + banner.attributes.image.data.attributes.url;
                } else if (banner.image && banner.image.url) {
                    // Old API structure
                    imageUrl = API_BASE_URL + banner.image.url;
                } else if (banner.attributes && banner.attributes.image && banner.attributes.image.url) {
                    // Alternative structure
                    imageUrl = API_BASE_URL + banner.attributes.image.url;
                } else {
                    console.error('Unknown banner structure:', banner);
                    return; // Skip this banner
                }
                
                console.log(`Banner ${index + 1} image URL:`, imageUrl);
                
                // Get image not available text based on current language
                const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                
                const slideHtml = `
                    <div class="banner-slide ${isActive}">
                        <div class="banner-content">
                            <div class="banner-image">
                                <img src="${imageUrl}" alt="Banner ${index + 1}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-image\\'></i><span>${imageNotAvailableText}</span></div>';">
                            </div>
                        </div>
                    </div>
                `;
                
                $('.banner-carousel').append(slideHtml);
                bannersAdded++;
            } catch (error) {
                console.error('Error processing banner:', error, banner);
            }
        });
        
        // If no banners were added successfully, show fallback
        if (bannersAdded === 0) {
            createFallbackBanner();
            return;
        }
        
        // Generate dots
        $('.slider-dots').empty();
        for (let i = 0; i < bannersAdded; i++) {
            const isActive = i === 0 ? 'active' : '';
            $('.slider-dots').append(`<span class="dot ${isActive}" data-slide="${i}"></span>`);
        }
        
        // Initialize carousel
        initializeCarousel();
    } else {
        // Show error message
        const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل البانرات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل البانرات. يرجى المحاولة مرة أخرى لاحقاً.';
        $('.banner-carousel').html(`<div class="banner-error">${errorText}</div>`);
        
        // Create a fallback banner if needed
        if (!result.success || !result.data || result.data.length === 0) {
            createFallbackBanner();
        }
    }
}

// Function to create a fallback banner
function createFallbackBanner() {
    console.log('Creating fallback banner');
    
    // Get translated text
    const welcomeText = window.translateText ? window.translateText('مرحباً بك في متجر جوجيز') : 'مرحباً بك في متجر جوجيز';
    const shopText = window.translateText ? window.translateText('تسوق أحدث المنتجات بأفضل الأسعار') : 'تسوق أحدث المنتجات بأفضل الأسعار';
    
    const fallbackHtml = `
        <div class="banner-slide active">
            <div class="banner-content">
                <div class="banner-image">
                    <div style="background-color: #f8f9fa; height: 300px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px;">
                        <div>
                            <h2 style="color: #333; margin-bottom: 10px;">${welcomeText}</h2>
                            <p style="color: #666;">${shopText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Clear any existing content
    $('.banner-carousel').empty();
    $('.banner-carousel').html(fallbackHtml);
    
    // Add a single dot for the fallback banner
    $('.slider-dots').empty();
    $('.slider-dots').html('<span class="dot active" data-slide="0"></span>');
    
    // Initialize carousel
    initializeCarousel();
}

// Function to initialize carousel
function initializeCarousel() {
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
    $('.next-btn').off('click').on('click', function() {
        if (isRTL) {
            prevSlide();
        } else {
            nextSlide();
        }
    });
    
    $('.prev-btn').off('click').on('click', function() {
        if (isRTL) {
            nextSlide();
        } else {
            prevSlide();
        }
    });
    
    // Dot navigation
    $('.dot').off('click').on('click', function() {
        const slideIndex = $(this).data('slide');
        goToSlide(slideIndex);
    });
    
    // Pause carousel on hover
    $('.banner-carousel').off('mouseenter mouseleave').hover(
        function() {
            clearInterval(slideInterval);
        },
        function() {
            slideInterval = setInterval(nextSlide, 5000);
        }
    );
    
    // Custom events for carousel navigation
    $(document).off('carousel:next carousel:prev');
    $(document).on('carousel:next', function() {
        nextSlide();
    });
    
    $(document).on('carousel:prev', function() {
        prevSlide();
    });
    
    // Listen for carousel direction change events
    $(document).off('carouselDirectionChanged').on('carouselDirectionChanged', function(e, isRTL) {
        // Update RTL state
        isRTL = isRTL;
    });
}

// Initialize when document is ready
$(document).ready(function() {
    loadBanners();
}); 
// Global variable to track current language
let currentLanguage = 'ar';

// Function to get current language - can be called from any file
function getCurrentLanguage() {
    return currentLanguage;
}

$(document).ready(function() {
    // Default language is Arabic (RTL)
    currentLanguage = 'ar';
    
    // Check if there's a saved language preference in localStorage
    const savedLang = localStorage.getItem('jojiz-language');
    if (savedLang) {
        currentLanguage = savedLang;
        applyLanguage(currentLanguage);
    } else {
        // Set default language to Arabic
        applyLanguage('ar');
    }
    
    // Language toggle click handler
    $('.lang-toggle, .lang-switch').click(function(e) {
        e.preventDefault();
        
        // Toggle between Arabic and English
        currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        
        // Save preference to localStorage
        localStorage.setItem('jojiz-language', currentLanguage);
        
        // Apply the language changes
        applyLanguage(currentLanguage);
        
        // Reload content with new language
        reloadContent(currentLanguage);
        
        // Prevent default action
        return false;
    });
    
    // Function to apply language changes
    function applyLanguage(lang) {
        if (lang === 'ar') {
            // Set to Arabic (RTL)
            $('html').attr('dir', 'rtl');
            $('html').attr('lang', 'ar');
            $('.lang-toggle').html('ar <img src="images/language.svg" alt="Language" class="lang-icon">');
            
            // Update text content for Arabic
            updateTextContent('ar');
            
            // Update carousel direction for RTL
            updateCarouselDirection(true);
        } else {
            // Set to English (LTR)
            $('html').attr('dir', 'ltr');
            $('html').attr('lang', 'en');
            $('.lang-toggle').html('en <img src="images/language.svg" alt="Language" class="lang-icon">');
            
            // Update text content for English
            updateTextContent('en');
            
            // Update carousel direction for LTR
            updateCarouselDirection(false);
        }
        
        // Force layout recalculation
        $('body').hide().show(0);
        
        // Reinitialize any components that need it
        reinitializeComponents();
    }
    
    // Function to reload content with new language
    function reloadContent(lang) {
        // Reload dynamic content based on the new language
        if (typeof loadBanners === 'function') {
            loadBanners();
        }
        
        if (typeof loadPopularProducts === 'function') {
            loadPopularProducts();
        }
        
        if (typeof loadCategories === 'function') {
            loadCategories();
        }
        
        if (typeof loadFeaturedProducts === 'function') {
            loadFeaturedProducts();
        }
        
        // Trigger a custom event that other scripts can listen for
        $(document).trigger('languageChanged', [lang]);
    }
    
    // Function to update text content based on language
    function updateTextContent(lang) {
        const translations = {
            // Header
            'BACKEND.WELCOME': {
                ar: 'مرحبا بكم',
                en: 'Welcome'
            },
            'BACKEND.LOGIN/ BACKEND.REGISTER': {
                ar: 'تسجيل الدخول / التسجيل',
                en: 'Login / Register'
            },
            'BACKEND.HOTLINE 24/7': {
                ar: 'الخط الساخن 24/7',
                en: 'Hotline 24/7'
            },
            'تغيير اللغة': {
                ar: 'تغيير اللغة',
                en: 'Change Language'
            },
            'المتجر': {
                ar: 'المتجر',
                en: 'Store'
            },
            'الصفحة الرئيسية': {
                ar: 'الصفحة الرئيسية',
                en: 'Home'
            },
            'بحث': {
                ar: 'بحث',
                en: 'Search'
            },
            'اللغة': {
                ar: 'اللغة',
                en: 'Language'
            },
            
            // Banner
            'شحن مجاني': {
                ar: 'شحن مجاني',
                en: 'Free Shipping'
            },
            'علي كل السوارية': {
                ar: 'علي كل السوارية',
                en: 'On All Evening Dresses'
            },
            'خصم 30%': {
                ar: 'خصم 30%',
                en: '30% Discount'
            },
            'على جميع المنتجات': {
                ar: 'على جميع المنتجات',
                en: 'On All Products'
            },
            'مجموعة جديدة': {
                ar: 'مجموعة جديدة',
                en: 'New Collection'
            },
            'تسوق الآن': {
                ar: 'تسوق الآن',
                en: 'Shop Now'
            },
            
            // Features
            'الدعم الفني': {
                ar: 'الدعم الفني',
                en: 'Technical Support'
            },
            'مساعدة الخبراء في استكشاف الأخطاء وإصلاحها والاستفسارات.': {
                ar: 'مساعدة الخبراء في استكشاف الأخطاء وإصلاحها والاستفسارات.',
                en: 'Expert help with troubleshooting and inquiries.'
            },
            'تتبع الطلبات والتحديثات': {
                ar: 'تتبع الطلبات والتحديثات',
                en: 'Order Tracking & Updates'
            },
            'تتبع حالة طلبك بشكل مباشر في الوقت الفعلي.': {
                ar: 'تتبع حالة طلبك بشكل مباشر في الوقت الفعلي.',
                en: 'Track your order status in real-time.'
            },
            'توصيل سريع': {
                ar: 'توصيل سريع',
                en: 'Fast Delivery'
            },
            'شحن سريع وموثوق إلى باب منزلك.': {
                ar: 'شحن سريع وموثوق إلى باب منزلك.',
                en: 'Fast and reliable shipping to your doorstep.'
            },
            'دعم العملاء': {
                ar: 'دعم العملاء',
                en: 'Customer Support'
            },
            'اتصل بنا للحصول على دعم العملاء بسرعة وفعالية في أي وقت.': {
                ar: 'اتصل بنا للحصول على دعم العملاء بسرعة وفعالية في أي وقت.',
                en: 'Contact us for quick and efficient customer support anytime.'
            },
            
            // Section Titles
            'مجموعة المنتجات': {
                ar: 'مجموعة المنتجات',
                en: 'Product Collection'
            },
            'الأكثر رواجا': {
                ar: 'الأكثر رواجا',
                en: 'Most Popular'
            },
            'عرض الشهر': {
                ar: 'عرض الشهر',
                en: 'Monthly Offer'
            },
            'المنتجات المميزة': {
                ar: 'المنتجات المميزة',
                en: 'Featured Products'
            },
            'الفئات': {
                ar: 'الفئات',
                en: 'Categories'
            },
            
            // Buttons
            'الكل': {
                ar: 'الكل',
                en: 'All'
            },
            'المزيد': {
                ar: 'المزيد',
                en: 'More'
            },
            'عرض المزيد': {
                ar: 'عرض المزيد',
                en: 'Show More'
            },
            'تسجيل الدخول': {
                ar: 'تسجيل الدخول',
                en: 'Login'
            },
            'إنشاء حساب': {
                ar: 'إنشاء حساب',
                en: 'Register'
            },
            'تسجيل الخروج': {
                ar: 'تسجيل الخروج',
                en: 'Logout'
            },
            
            // Loading and Error Messages
            'جاري تحميل البانرات...': {
                ar: 'جاري تحميل البانرات...',
                en: 'Loading banners...'
            },
            'عذراً، لا يمكن تحميل البانرات. يرجى المحاولة مرة أخرى لاحقاً.': {
                ar: 'عذراً، لا يمكن تحميل البانرات. يرجى المحاولة مرة أخرى لاحقاً.',
                en: 'Sorry, banners could not be loaded. Please try again later.'
            },
            'جاري تحميل المنتجات...': {
                ar: 'جاري تحميل المنتجات...',
                en: 'Loading products...'
            },
            'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.': {
                ar: 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.',
                en: 'Sorry, products could not be loaded. Please try again later.'
            },
            'جاري تحميل الفئات...': {
                ar: 'جاري تحميل الفئات...',
                en: 'Loading categories...'
            },
            'عذراً، لا يمكن تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.': {
                ar: 'عذراً، لا يمكن تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.',
                en: 'Sorry, categories could not be loaded. Please try again later.'
            },
            'صورة غير متوفرة': {
                ar: 'صورة غير متوفرة',
                en: 'Image not available'
            },
            'السعر عند الطلب': {
                ar: 'السعر عند الطلب',
                en: 'Price on request'
            },
            
            // Categories
            'فساتين العيد': {
                ar: 'فساتين العيد',
                en: 'Eid Dresses'
            },
            'فساتين قطن': {
                ar: 'فساتين قطن',
                en: 'Cotton Dresses'
            },
            'فساتين سوارية': {
                ar: 'فساتين سوارية',
                en: 'Evening Dresses'
            },
            
            // Footer
            'روابط سريعة': {
                ar: 'روابط سريعة',
                en: 'Quick Links'
            },
            'اتصل بنا': {
                ar: 'اتصل بنا',
                en: 'Contact Us'
            },
            'الأسئلة الشائعة': {
                ar: 'الأسئلة الشائعة',
                en: 'FAQ'
            },
            'حقوق الطبع والنشر © 2025 Jojiz. جميع الحقوق محفوظة': {
                ar: 'حقوق الطبع والنشر © 2025 Jojiz. جميع الحقوق محفوظة',
                en: 'Copyright © 2025 Jojiz. All rights reserved'
            }
        };
        
        // Loop through all elements with text content
        $('*').each(function() {
            const $element = $(this);
            const originalText = $element.data('original-text') || $element.text().trim();
            
            // Skip empty elements or elements with only whitespace
            if (!originalText) return;
            
            // Skip elements with HTML content
            if ($element.children().length > 0) return;
            
            // Store original text if not already stored
            if (!$element.data('original-text')) {
                $element.data('original-text', originalText);
            }
            
            // Check if this text has a translation
            if (translations[originalText] && translations[originalText][lang]) {
                $element.text(translations[originalText][lang]);
            }
        });
        
        // Update placeholders for inputs
        $('input[placeholder]').each(function() {
            const $input = $(this);
            const originalPlaceholder = $input.data('original-placeholder') || $input.attr('placeholder');
            
            // Store original placeholder if not already stored
            if (!$input.data('original-placeholder')) {
                $input.data('original-placeholder', originalPlaceholder);
            }
            
            // Check if this placeholder has a translation
            if (translations[originalPlaceholder] && translations[originalPlaceholder][lang]) {
                $input.attr('placeholder', translations[originalPlaceholder][lang]);
            }
        });
    }
    
    // Function to update carousel direction based on language direction
    function updateCarouselDirection(isRTL) {
        // Trigger custom event for carousel direction change
        $(document).trigger('carouselDirectionChanged', [isRTL]);
    }
    
    // Function to reinitialize components after language change
    function reinitializeComponents() {
        // Any components that need reinitialization after language change
    }
    
    // Expose the translation function globally
    window.translateText = function(text, lang) {
        lang = lang || currentLanguage;
        const translations = {
            // Add all translations here (same as above)
            // This is a simplified version for demonstration
            'جاري تحميل المنتجات...': {
                ar: 'جاري تحميل المنتجات...',
                en: 'Loading products...'
            },
            'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.': {
                ar: 'عذراً، لا يمكن تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.',
                en: 'Sorry, products could not be loaded. Please try again later.'
            },
            'صورة غير متوفرة': {
                ar: 'صورة غير متوفرة',
                en: 'Image not available'
            },
            'السعر عند الطلب': {
                ar: 'السعر عند الطلب',
                en: 'Price on request'
            }
        };
        
        if (translations[text] && translations[text][lang]) {
            return translations[text][lang];
        }
        
        return text;
    };
    
    // Make getCurrentLanguage available globally
    window.getCurrentLanguage = getCurrentLanguage;
}); 
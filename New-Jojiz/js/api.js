const API_BASE_URL = 'https://adminjojiz.jojiz.net';

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

    // Get popular products
    getPopularProducts: async (locale = null) => {
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
            console.error('Error fetching popular products:', error);
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
            
            return { 
                success: true, 
                data: data.data || [],
                meta: data.meta || null
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
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
    }
}; 
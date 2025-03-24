// Function to load categories from API
async function loadCategories() {
    // Get current language
    const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : $('html').attr('lang') || 'ar';
    
    console.log('Loading categories for language:', currentLang);
    
    // Get loading text based on current language
    const loadingText = window.translateText ? window.translateText('جاري تحميل الفئات...') : 'جاري تحميل الفئات...';
    
    // Show loading state
    $('.categories-grid').html(`<div class="loading-categories">${loadingText}</div>`);
    
    try {
        // Fetch categories from API
        const result = await ContentService.getCategories();
        
        console.log('Categories API response:', result);
        
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            // Clear loading state
            $('.categories-grid').empty();
            
            let categoriesAdded = 0;
            
            // Generate category items
            result.data.forEach((category, index) => {
                try {
                    console.log(`Processing category ${index + 1}:`, category);
                    
                    // Extract category data
                    const categoryId = category.id;
                    let categoryName;
                    
                    // Handle different possible API response structures
                    if (category.attributes && category.attributes.title) {
                        categoryName = category.attributes.title;
                    } else if (category.attributes && category.attributes.name) {
                        categoryName = category.attributes.name;
                    } else if (category.title) {
                        categoryName = category.title;
                    } else if (category.name) {
                        categoryName = category.name;
                    } else {
                        console.warn(`Category ${index + 1} has no name/title:`, category);
                        return; // Skip this category
                    }
                    
                    // Get category image URL
                    let imageUrl = '';
                    
                    // Handle different API response structures for images
                    if (category.attributes?.image?.data?.attributes?.url) {
                        imageUrl = API_BASE_URL + category.attributes.image.data.attributes.url;
                    } else if (category.image?.url) {
                        imageUrl = API_BASE_URL + category.image.url;
                    }
                    
                    console.log(`Category ${index + 1} image URL:`, imageUrl);
                    
                    // Get image not available text based on current language
                    const imageNotAvailableText = window.translateText ? window.translateText('صورة غير متوفرة') : 'صورة غير متوفرة';
                    
                    // Create category card HTML
                    const categoryHtml = `
                        <a href="products.html?categoryid=${categoryId}" class="category-item">
                            <div class="category-image">
                                ${imageUrl ? 
                                    `<img src="${imageUrl}" alt="${categoryName}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-image\\'><i class=\\'fas fa-folder\\'></i><span>${imageNotAvailableText}</span></div>';">` : 
                                    `<div class="placeholder-image"><i class="fas fa-folder"></i><span>${imageNotAvailableText}</span></div>`
                                }
                            </div>
                            <h3 class="category-title">${categoryName}</h3>
                        </a>
                    `;
                    
                    $('.categories-grid').append(categoryHtml);
                    categoriesAdded++;
                } catch (error) {
                    console.error(`Error processing category ${index + 1}:`, error, category);
                }
            });
            
            console.log(`Added ${categoriesAdded} categories to the grid`);
            
            // If no categories were added successfully, show error
            if (categoriesAdded === 0) {
                const errorText = window.translateText ? window.translateText('عذراً، لا يمكن عرض الفئات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن عرض الفئات. يرجى المحاولة مرة أخرى لاحقاً.';
                $('.categories-grid').html(`<div class="categories-error">${errorText}</div>`);
            }
        } else {
            console.error('No categories found in API response');
            const errorText = window.translateText ? window.translateText('عذراً، لا يمكن تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، لا يمكن تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.';
            $('.categories-grid').html(`<div class="categories-error">${errorText}</div>`);
        }
    } catch (error) {
        console.error('Error in loadCategories:', error);
        const errorText = window.translateText ? window.translateText('عذراً، حدث خطأ أثناء تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.') : 'عذراً، حدث خطأ أثناء تحميل الفئات. يرجى المحاولة مرة أخرى لاحقاً.';
        $('.categories-grid').html(`<div class="categories-error">${errorText}</div>`);
    }
}

// Initialize when document is ready
$(document).ready(function() {
    loadCategories();
}); 
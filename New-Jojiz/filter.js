document.addEventListener('DOMContentLoaded', function() {
    // Get all filter checkboxes
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const ratingFilters = document.querySelectorAll('input[name="rating"]');
    const brandFilters = document.querySelectorAll('input[name="brand"]');
    
    // Get all products
    const products = document.querySelectorAll('.product-card');
    
    // Add event listeners to all filter checkboxes
    categoryFilters.forEach(filter => filter.addEventListener('change', applyFilters));
    ratingFilters.forEach(filter => filter.addEventListener('change', applyFilters));
    brandFilters.forEach(filter => filter.addEventListener('change', applyFilters));
    
    // Update initial counts
    updateFilterCounts();
    
    function applyFilters() {
        const selectedCategories = Array.from(categoryFilters)
            .filter(f => f.checked)
            .map(f => f.id.replace('category-', ''));
            
        const selectedRatings = Array.from(ratingFilters)
            .filter(f => f.checked)
            .map(f => f.id.replace('rating-', ''));
            
        const selectedBrands = Array.from(brandFilters)
            .filter(f => f.checked)
            .map(f => f.id.replace('brand-', ''));
        
        products.forEach(product => {
            const category = product.dataset.category;
            const rating = product.dataset.rating;
            const brand = product.dataset.brand;
            
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(rating);
            const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(brand);
            
            if (categoryMatch && ratingMatch && brandMatch) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    }
    
    function updateFilterCounts() {
        // Update category counts
        categoryFilters.forEach(filter => {
            const category = filter.id.replace('category-', '');
            const count = document.querySelectorAll(`.product-card[data-category="${category}"]`).length;
            filter.parentElement.querySelector('span').textContent = `(${count})`;
        });
        
        // Update rating counts
        ratingFilters.forEach(filter => {
            const rating = filter.id.replace('rating-', '');
            const count = document.querySelectorAll(`.product-card[data-rating="${rating}"]`).length;
            filter.parentElement.querySelector('span').textContent = `(${count})`;
        });
        
        // Update brand counts
        brandFilters.forEach(filter => {
            const brand = filter.id.replace('brand-', '');
            const count = document.querySelectorAll(`.product-card[data-brand="${brand}"]`).length;
            filter.parentElement.querySelector('span').textContent = `(${count})`;
        });
    }
}); 

document.addEventListener('DOMContentLoaded', function() {
    const sortSelect = document.getElementById('sort-by');
    const productsGrid = document.querySelector('.products-grid');

    sortSelect.addEventListener('change', function() {
        const products = Array.from(document.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            switch(this.value) {
                case 'price-low':
                    // Get prices and convert them to numbers
                    const priceA = Number(a.querySelector('.current-price').textContent.replace(/[^0-9.-]+/g, ''));
                    const priceB = Number(b.querySelector('.current-price').textContent.replace(/[^0-9.-]+/g, ''));
                    return priceA - priceB;
                
                case 'price-high':
                    const priceHighA = Number(a.querySelector('.current-price').textContent.replace(/[^0-9.-]+/g, ''));
                    const priceHighB = Number(b.querySelector('.current-price').textContent.replace(/[^0-9.-]+/g, ''));
                    return priceHighB - priceHighA;
                
                // Add more sorting options here if needed
                default:
                    return 0;
            }
        });

        // Clear and re-append sorted products
        productsGrid.innerHTML = '';
        products.forEach(product => productsGrid.appendChild(product));
    });
});
// Order success page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load order details from localStorage
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!order) {
        // Redirect to home if no order found
        window.location.href = 'index.html';
        return;
    }
    
    // Display order details
    displayOrderDetails(order);
});

// Display order details
function displayOrderDetails(order) {
    // Set order number
    const orderNumberElement = document.getElementById('order-number');
    if (orderNumberElement) {
        orderNumberElement.textContent = order.id;
    }
    
    // Set order date
    const orderDateElement = document.getElementById('order-date');
    if (orderDateElement) {
        const orderDate = new Date(order.date);
        orderDateElement.textContent = orderDate.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Set payment method
    const paymentMethodElement = document.getElementById('payment-method');
    if (paymentMethodElement) {
        paymentMethodElement.textContent = order.payment.method === 'cash' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان';
    }
    
    // Set order total
    const orderTotalElement = document.getElementById('order-total');
    if (orderTotalElement) {
        orderTotalElement.textContent = `${order.payment.total.toFixed(2)} جنيه`;
    }
} 
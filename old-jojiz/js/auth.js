$(document).ready(function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Tab switching functionality
    $('.auth-tab').click(function() {
        const tabId = $(this).data('tab');
        
        // Update active tab
        $('.auth-tab').removeClass('active');
        $(this).addClass('active');
        
        // Show corresponding form
        $('.auth-form').removeClass('active');
        $('.' + tabId + '-form').addClass('active');
    });
    
    // Form switching links
    $('.auth-switch a').click(function(e) {
        e.preventDefault();
        const switchTo = $(this).data('switch');
        
        // Trigger click on the corresponding tab
        $('.auth-tab[data-tab="' + switchTo + '"]').click();
    });
    
    // Toggle password visibility
    $('.toggle-password').click(function() {
        const passwordField = $(this).siblings('input');
        const passwordFieldType = passwordField.attr('type');
        
        // Toggle password visibility
        if (passwordFieldType === 'password') {
            passwordField.attr('type', 'text');
            $(this).find('i').removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            $(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });
    
    // Login form submission
    $('.login-form form').submit(async function(e) {
        e.preventDefault();
        
        // Get form data
        const identifier = $('#login-email').val();
        const password = $('#login-password').val();
        
        // Validate form
        if (!identifier || !password) {
            showMessage('error', 'Please fill in all required fields');
            return;
        }
        
        // Show loading state
        const submitBtn = $(this).find('.auth-submit');
        const originalText = submitBtn.text();
        submitBtn.prop('disabled', true).text('جاري تسجيل الدخول...');
        
        // Call login API
        const result = await AuthService.login(identifier, password);
        
        // Reset button state
        submitBtn.prop('disabled', false).text(originalText);
        
        if (result.success) {
            showMessage('success', 'تم تسجيل الدخول بنجاح');
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('error', result.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.');
        }
    });
    
    // Registration form submission
    $('.register-form form').submit(async function(e) {
        e.preventDefault();
        
        // Get form data
        const username = $('#register-name').val();
        const email = $('#register-email').val();
        const phone = $('#register-phone').val();
        const password = $('#register-password').val();
        const confirmPassword = $('#register-confirm-password').val();
        const termsAgreed = $('#terms').is(':checked');
        
        // Validate form
        if (!username || !email || !password || !confirmPassword) {
            showMessage('error', 'يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('error', 'كلمات المرور غير متطابقة');
            return;
        }
        
        if (!termsAgreed) {
            showMessage('error', 'يرجى الموافقة على الشروط والأحكام');
            return;
        }
        
        // Show loading state
        const submitBtn = $(this).find('.auth-submit');
        const originalText = submitBtn.text();
        submitBtn.prop('disabled', true).text('جاري إنشاء الحساب...');
        
        try {
            // Step 1: Register user without phone number
            const registerResult = await AuthService.register(username, email, password);
            
            if (!registerResult.success) {
                // If registration fails, show error and stop
                submitBtn.prop('disabled', false).text(originalText);
                showMessage('error', registerResult.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
                return;
            }
            
            // Step 2: If phone number is provided, update user with phone number
            if (phone && phone.trim() !== '') {
                const userId = registerResult.data.user.id;
                submitBtn.text('جاري تحديث رقم الهاتف...');
                
                const updateResult = await AuthService.updateUserPhone(userId, phone);
                
                if (!updateResult.success) {
                    console.error('Failed to update phone number:', updateResult.message);
                    // Continue with registration success even if phone update fails
                    // But log the error for debugging
                }
            }
            
            // Registration successful
            submitBtn.prop('disabled', false).text(originalText);
            showMessage('success', 'تم إنشاء الحساب بنجاح');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('Registration process error:', error);
            submitBtn.prop('disabled', false).text(originalText);
            showMessage('error', 'حدث خطأ أثناء عملية التسجيل. يرجى المحاولة مرة أخرى.');
        }
    });
    
    // Social login buttons
    $('.google-btn').click(function() {
        showMessage('info', 'تسجيل الدخول باستخدام Google غير متاح حاليًا');
    });
    
    $('.facebook-btn').click(function() {
        showMessage('info', 'تسجيل الدخول باستخدام Facebook غير متاح حاليًا');
    });
    
    // Forgot password link
    $('.forgot-password').click(function(e) {
        e.preventDefault();
        showMessage('info', 'ميزة استعادة كلمة المرور غير متاحة حاليًا');
    });
});

// Function to check authentication status
function checkAuthStatus() {
    if (AuthService.isLoggedIn()) {
        // If user is already logged in, redirect to home page
        window.location.href = 'index.html';
    }
}

// Function to show messages
function showMessage(type, message) {
    // Remove any existing message
    $('.auth-message').remove();
    
    // Create message element
    const messageClass = type === 'error' ? 'auth-message-error' : 
                         type === 'success' ? 'auth-message-success' : 
                         'auth-message-info';
    
    const messageHtml = `<div class="auth-message ${messageClass}">${message}</div>`;
    
    // Add message to the active form
    $('.auth-form.active form').prepend(messageHtml);
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
        $('.auth-message').fadeOut(300, function() {
            $(this).remove();
        });
    }, 5000);
} 
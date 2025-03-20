document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Redirect to home page if already logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    // Show login form when "Sign In" is clicked
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Hide register form, show login form
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        
        // Update title and subtitle
        document.querySelector('.login-box h2').textContent = 'Sign In';
        document.querySelector('.subtitle').textContent = 'Sign in to your account to continue shopping';
        
        // Update footer
        document.querySelector('.auth-footer').innerHTML = 
            '<p>Don\'t have an account? <a href="#" id="showRegisterBtn">Create Account</a></p>';
        
        // Add event listener to "Create Account" link
        document.getElementById('showRegisterBtn').addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
    });
    
    // Function to show register form
    function showRegisterForm() {
        // Hide login form, show register form
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        
        // Update title and subtitle
        document.querySelector('.login-box h2').textContent = 'Create Account';
        document.querySelector('.subtitle').textContent = 'Sign up to access your account and manage your orders';
        
        // Update footer
        document.querySelector('.auth-footer').innerHTML = 
            '<p>Already have an account? <a href="#" id="showLoginBtn">Sign In</a></p>';
        
        // Add event listener to "Sign In" link
        document.getElementById('showLoginBtn').addEventListener('click', function(e) {
            e.preventDefault();
            showLoginBtn.click();
        });
    }
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user_' + email));
        
        // Check if user exists and password matches
        if (userData && userData.password === password) {
            // Set login status
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', email);
            
            // Redirect to home page
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password!');
        }
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Check if user already exists
        if (localStorage.getItem('user_' + email)) {
            alert('An account with this email already exists!');
            return;
        }
        
        // Store user data in localStorage
        const userData = {
            name: name,
            email: email,
            password: password
        };
        
        // Save user to localStorage
        localStorage.setItem('user_' + email, JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        
        // Redirect to home page
        alert('Account created successfully! You are now logged in.');
        window.location.href = 'index.html';
    });
}); 
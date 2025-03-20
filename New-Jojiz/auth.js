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
}); 
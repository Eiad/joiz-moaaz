document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const menuToggle = document.getElementById('menuToggle');
    const closeSidenav = document.getElementById('closeSidenav');
    const mobileSidenav = document.getElementById('mobileSidenav');
    const sidenavOverlay = document.getElementById('sidenavOverlay');
    const mobileAuthLink = document.getElementById('mobileAuthLink');
    
    // Open sidenav
    menuToggle.addEventListener('click', function() {
        mobileSidenav.style.width = '280px';
        sidenavOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close sidenav
    function closeSideNav() {
        mobileSidenav.style.width = '0';
        sidenavOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    closeSidenav.addEventListener('click', closeSideNav);
    sidenavOverlay.addEventListener('click', closeSideNav);
    
    // Check login status for mobile nav
    function checkMobileLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = localStorage.getItem('currentUser');
        
        if (isLoggedIn && currentUser) {
            // User is logged in, update auth link
            const userData = JSON.parse(localStorage.getItem('user_' + currentUser));
            if (userData) {
                // Change LOGIN/REGISTER to LOGOUT
                mobileAuthLink.textContent = 'LOGOUT (' + userData.name + ')';
                mobileAuthLink.href = '#';
                mobileAuthLink.onclick = function(e) {
                    e.preventDefault();
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('currentUser');
                    window.location.reload();
                };
            }
        }
    }
    
    // Run this when page loads
    checkMobileLoginStatus();
}); 
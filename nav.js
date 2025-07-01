import { auth } from './firebaseConfig.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('nav.js: DOMContentLoaded');
    const profileLink = document.querySelector('.dropdown-content a[href="profile.html"]');
    const logoutLink = document.getElementById('logout-link');
    const loginLink = document.querySelector('.dropdown-content a[href="login.html"]');
    const signupLink = document.querySelector('.dropdown-content a[href="signup.html"]');

    // Initial state: hide profile/logout, show login/signup (unless already on login/signup page)
    if (profileLink) profileLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'block';
    if (signupLink) signupLink.style.display = 'block';

    onAuthStateChanged(auth, (user) => {
        console.log('nav.js: onAuthStateChanged - user:', user);
        if (user) {
            // User is signed in
            if (profileLink) profileLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
        } else {
            // User is signed out
            if (profileLink) profileLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
            if (signupLink) signupLink.style.display = 'block';

            // Force redirect to login if not on login/signup page
            const currentPage = window.location.pathname.split('/').pop();
            console.log('nav.js: currentPage (not logged in):', currentPage);
            if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
                console.log('nav.js: Redirecting to login.html');
                window.location.href = 'login.html';
            }
        }
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default link behavior
            try {
                console.log('nav.js: Logout initiated');
                await signOut(auth);
                alert('You have been logged out.');
                // Redirection is handled by onAuthStateChanged, but explicit for clarity
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('nav.js: Error logging out:', error);
                alert('Error logging out: ' + error.message);
            }
        });
    }
});
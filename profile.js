import { auth } from './firebaseConfig.js';
import { signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('user-email');
    const userDisplayNameSpan = document.getElementById('user-display-name');
    const userUidSpan = document.getElementById('user-uid');
    const logoutBtn = document.getElementById('logout-btn');
    const displayNameInput = document.getElementById('display-name-input');
    const updateProfileBtn = document.getElementById('update-profile-btn');
    const profileUpdateMessage = document.getElementById('profile-update-message');

    // Listen for authentication state to populate profile details
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userEmailSpan.textContent = user.email || 'N/A';
            userDisplayNameSpan.textContent = user.displayName || 'N/A';
            userUidSpan.textContent = user.uid;
            if (user.displayName) {
                displayNameInput.value = user.displayName;
            }
        } else {
            // User is signed out, nav.js will handle redirection if necessary
            userEmailSpan.textContent = 'N/A';
            userDisplayNameSpan.textContent = 'N/A';
            userUidSpan.textContent = 'N/A';
            displayNameInput.value = '';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                alert('You have been logged out.');
                // Redirection is handled by nav.js onAuthStateChanged listener
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Error logging out: ' + error.message);
            }
        });
    }

    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', async () => {
            const newDisplayName = displayNameInput.value.trim();
            const currentUser = auth.currentUser;

            if (currentUser && newDisplayName !== '' && newDisplayName !== currentUser.displayName) {
                try {
                    await updateProfile(currentUser, {
                        displayName: newDisplayName
                    });
                    userDisplayNameSpan.textContent = newDisplayName;
                    profileUpdateMessage.textContent = 'Profile updated successfully!';
                    profileUpdateMessage.style.color = 'green';
                    profileUpdateMessage.style.display = 'block';
                    console.log('Display name updated:', newDisplayName);
                } catch (error) {
                    profileUpdateMessage.textContent = 'Error updating profile: ' + error.message;
                    profileUpdateMessage.style.color = 'red';
                    profileUpdateMessage.style.display = 'block';
                    console.error('Error updating display name:', error);
                }
            } else if (newDisplayName === currentUser.displayName) {
                profileUpdateMessage.textContent = 'Display name is already the same.';
                profileUpdateMessage.style.color = 'orange';
                profileUpdateMessage.style.display = 'block';
            } else {
                profileUpdateMessage.textContent = 'Please enter a valid display name.';
                profileUpdateMessage.style.color = 'red';
                profileUpdateMessage.style.display = 'block';
            }
            // Hide message after a few seconds
            setTimeout(() => {
                profileUpdateMessage.style.display = 'none';
            }, 3000);
        });
    }
}); 
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#email').value;
      const password = loginForm.querySelector('#password').value;

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful:', userCredential.user);
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Login error:', error.message);
        loginError.textContent = error.message;
        loginError.style.display = 'block';
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = signupForm.querySelector('#signup-email').value;
      const password = signupForm.querySelector('#signup-password').value;
      const confirmPassword = signupForm.querySelector('#confirm-password').value;

      if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match.';
        signupError.style.display = 'block';
        return;
      }

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Sign up successful:', userCredential.user);
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Sign up error:', error.message);
        signupError.textContent = error.message;
        signupError.style.display = 'block';
      }
    });
  }
});
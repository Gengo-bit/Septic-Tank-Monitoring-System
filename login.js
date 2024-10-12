// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
    authDomain: "septic-tank-capacity.firebaseapp.com",
    projectId: "septic-tank-capacity",
    appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24"
  };
  
  firebase.initializeApp(firebaseConfig);
  
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // If the user is authenticated, redirect to home.html
        window.location.href = 'home.html';
    }
    // do nothing
});

  document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-form');
      const errorMessage = document.getElementById('error-message');
  
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
  
          firebase.auth().signInWithEmailAndPassword(email, password)
              .then((userCredential) => {
                  // Redirect to home page after successful login
                  window.location.href = 'home.html';
              })
              .catch((error) => {
                  // Handle errors
                  errorMessage.textContent = error.message;
              });
      });
  });  

// Show Login Modal
const loginToggleBtn = document.getElementById('login-toggle-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.getElementById('close-modal');

loginToggleBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex'; // Ensure the modal is visible
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none'; // Hide the modal
});

window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none'; // Hide modal when clicking outside
    }
});

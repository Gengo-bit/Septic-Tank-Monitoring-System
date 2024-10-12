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



// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
  authDomain: "septic-tank-capacity.firebaseapp.com",
  databaseURL: "https://septic-tank-capacity-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "septic-tank-capacity",
  storageBucket: "septic-tank-capacity.appspot.com",
  messagingSenderId: "445055846573",
  appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24",
  measurementId: "G-M9K3YTLTRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add event listener for form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get username and password values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Firebase Authentication (replace 'admin' check with actual Firebase auth)
    signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
            // Signed in
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to the main website
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Login failed: ${errorMessage} (Code: ${errorCode})`);
        });
});

// Add event listeners for Register and Forgot Password buttons
document.getElementById('registerBtn').addEventListener('click', function() {
    window.location.href = 'register.html'; // Redirect to the register page
});

document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
    window.location.href = 'forgot-password.html'; // Redirect to the forgot password page
});

// Import and configure Firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// Handle Login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'index.html'; // Redirect to home page after login
        })
        .catch(error => {
            alert('Login failed: ' + error.message);
        });
});
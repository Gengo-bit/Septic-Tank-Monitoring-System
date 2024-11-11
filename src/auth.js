import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

// Handle Login
document.getElementById('login-modal').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = 'home.html';
        })
        .catch(error => {
            alert('Login failed: ' + error.message);
        });
});

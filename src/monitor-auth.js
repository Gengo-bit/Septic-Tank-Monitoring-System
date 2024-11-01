import { getAuth } from "firebase/auth"; // Add this at the beginning of the file
const auth = getAuth(); // Initialize auth

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // If user is authenticated, redirect to home.html if referrer is not home.html
        const referrer = document.referrer;
        if (!referrer.includes('home.html')) {
            window.location.href = 'home.html';
        }

        // Home button event listener within onAuthStateChanged
        document.getElementById('homeButton').addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'home.html';
        });
    } else {
        // Redirect to index.html if not authenticated
        window.location.href = 'index.html';
    }
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('beforeunload', () => {
    firebase.auth().signOut().catch((error) => {
        console.error('Error signing out: ', error);
    });
});

    // Add event listener to the Logout button
    document.getElementById('Logout-btn').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            // Redirect to index.html after successful logout
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout Error: ', error);
        });
    });
    
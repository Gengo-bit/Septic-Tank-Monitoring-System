firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // If the user is authenticated, check if they came from home.html
        const referrer = document.referrer;
        if (!referrer.includes('home.html')) {
            // Redirect to home.html if not coming from home.html
            window.location.href = 'home.html';
        }
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

// home button
document.getElementById('homeButton').addEventListener('click', (event) => {
        event.preventDefault(); // Prevents default link behavior
        const user = auth.currentUser;
        if (user) {
            // User is authenticated, redirect to home page
            window.location.href = 'home.html';
        } else {
            // User not authenticated, redirect to login page
            window.location.href = 'index.html';
        }
});
    
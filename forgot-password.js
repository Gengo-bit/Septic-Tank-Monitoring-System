// Add event listener for form submission
document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;

    // Use Firebase Authentication to send a password reset email
    firebase.auth().sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('A reset link has been sent to ' + email + '.');
            window.location.href = 'login.html'; // Redirect to the login page
        })
        .catch((error) => {
            alert(error.message); // Show error message
        });
});

// Add event listener for Back to Login button
document.getElementById('loginBtn').addEventListener('click', function() {
    window.location.href = 'login.html'; // Redirect to the login page
});

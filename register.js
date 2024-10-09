// Add event listener for form submission
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Use Firebase Authentication to create a new user
    firebase.auth().createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User registered successfully
            alert('Registration successful! Welcome, ' + username + '!');
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

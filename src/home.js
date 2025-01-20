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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => { // Authentication check
  if (user) {
    
    const userEmail = user.email;  // Get user's email

    // Retrieve the user's data from Firestore 
    db.collection('users').doc(userEmail).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();

          // Update the profilePicUrl element to the stored pic
          if (userData.profilePicUrl) {
            document.querySelector('.profile-pic').src = userData.profilePicUrl;
          }

          // Update the @User element to the st ored username
          if (userData.username) {
            document.querySelector('.username-display').textContent = userData.username;
          }
        } else {
          console.log("No user data found!");
        }
      })
      .catch((error) => {
        console.error("Error retrieving user data: ", error);
      });
  } else {
    // If no user is logged in, redirect to login
    window.location.href = '../index.html';
  }
});

// Event listener for Logout button
document.getElementById('logout-btn').addEventListener('click', function() {
  firebase.auth().signOut().then(() => {
    window.location.href = '../index.html';
  }).catch((error) => {
    console.error('Logout Error: ', error);
  });
});

// Redirect to index.html if not logged in
auth.onAuthStateChanged((user) => {
  if (!user) {
      window.location.href = '../index.html';
  }
});

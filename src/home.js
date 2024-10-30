// Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication check and load user-specific data
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, proceed with fetching data
    const userUID = user.uid;
    
    // Fetch the document from Firestore corresponding to this user
    const docRef = db.collection('septicTankData').doc(userUID);
    
    docRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        updateUI(userData);
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.error("Error fetching document: ", error);
    });
  } else {
    // If no user is logged in, redirect to login
    window.location.href = 'index.html';
  }
});

    // Add event listener to the Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout Error: ', error);
    });
});

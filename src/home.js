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

// Update the UI with the fetched data
function updateUI(userData) {
  const capacity = userData.capacity;
  const timestamp = userData.timestamp;
  
  // Update the capacity display (for example, you can put it in a specific div)
  document.getElementById('capacity-display').innerText = `Capacity: ${capacity}%`;

  // Convert timestamp to readable date
  const date = new Date(timestamp * 1000);
  document.getElementById('date-display').innerText = `Date: ${date.toLocaleDateString()}`;
  
  // Continue updating other parts of the UI as needed
}

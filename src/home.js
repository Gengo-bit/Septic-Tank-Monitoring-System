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

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-open');
    });

    // Add event listener to the Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout Error: ', error);
    });
});

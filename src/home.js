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
const database = firebase.database();

auth.onAuthStateChanged((user) => { // Authentication check
  if (user) {
    const userId = user.uid;
    console.log('Current user UID:', userId);
    const tankList = document.querySelector('.tank-list');
    
    database.ref('users/' + userId).once('value')
      .then((snapshot) => {
        console.log('Database snapshot exists:', snapshot.exists());
        const userData = snapshot.val();
        console.log('Database data received:', userData);

        if (userData) {
          // Get all keys from userData
          const keys = Object.keys(userData);
          console.log('Found keys:', keys);

          // Create tanks for all septicTankData entries
          keys.forEach(key => {
            if (key.startsWith('septicTankData')) {
              // Get tank number ('' for first tank, or the actual number)
              const tankNum = key === 'septicTankData' ? '1' : key.replace('septicTankData', '');
              console.log('Creating tank box for tank:', tankNum);

              const tankBox = document.createElement('div');
              tankBox.className = 'tank-box';
              tankBox.innerHTML = `<p><a href="../monitor/monitor.html?tank=${tankNum}">Septic Tank ${tankNum}</a></p>`;
              tankList.appendChild(tankBox);
              console.log(`Tank ${tankNum} box created`);
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error reading from database:', error);
      });

    const userEmail = user.email;
    console.log('User email:', userEmail); // Log user email

    // Retrieve the user's data from Firestore 
    db.collection('users').doc(userEmail).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log('Firestore user data:', userData); // Log Firestore data

          if (userData.profilePicUrl) {
            document.querySelector('.profile-pic').src = userData.profilePicUrl;
            console.log('Profile picture updated');
          }

          if (userData.username) {
            document.querySelector('.username-display').textContent = userData.username;
            console.log('Username updated');
          }
        } else {
          console.log("No user data found in Firestore!");
        }
      })
      .catch((error) => {
        console.error("Error retrieving user data: ", error);
      });
  } else {
    console.log('No user authenticated, redirecting to login');
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
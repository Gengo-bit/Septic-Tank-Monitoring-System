// Firebase, chart.js imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, query, limitToLast, onChildAdded, set, get } from "firebase/database";
import Chart from "chart.js/auto";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app); 
const firestore = getFirestore(app); 
const googleProvider = new GoogleAuthProvider();

// CSS
const styles = `
  .capacity-text {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 300;
  }

  .status-text {
    color: var(--text-color);
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 300;
  }

  .status {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 300;
  }

  .time-until-full, .rate-too-low {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--secondary-text);
  }
`;
// Function to save user data in Firestore
async function saveUserInFirestore(user, isAdmin = false) {
  try {
    // Store the user data in Firestore under "users" collection with `isAdmin` field
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      isAdmin: isAdmin
    });
    console.log('User saved in Firestore with admin status:', isAdmin);
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

// Sign-Up with Email and Password
function signUpWithEmail(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // On sign-up, assign admin role if needed. Example: Make the first user the admin
      const isAdmin = (user.email === "admin@example.com"); // Change to your logic for determining admin
      await saveUserInFirestore(user, isAdmin);  // Save the user data in Firestore

      toggleUI(true);
      console.log('User signed up and logged in:', user);
    })
    .catch((error) => {
      console.error("Sign-up failed: ", error.message);
      alert("Sign-up failed: " + error.message);  // Show error to user
    });
}

// Function to toggle UI based on authentication state
function toggleUI(isLoggedIn, isAdmin = false) {
  if (isLoggedIn) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Show/hide admin-specific features based on isAdmin flag
    if (isAdmin) {
      document.getElementById('admin-section').style.display = 'block';  // Example admin section
    } else {
      document.getElementById('admin-section').style.display = 'none';
    }
  } else {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
  }
}

// Check if user is an admin
async function checkIfAdmin(user) {
  const docRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();
    return userData.isAdmin;
  } else {
    console.log("No such document!");
    return false;
  }
}

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isAdmin = await checkIfAdmin(user);  // Check if the user is an admin
    toggleUI(true, isAdmin);  // Pass the isAdmin flag to toggle UI
  } else {
    toggleUI(false);
  }
});

// Event listeners for form buttons
document.getElementById('sign-up-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signUpWithEmail(email, password);  // Trigger sign-up
});
// Function to toggle UI based on authentication state
function toggleUI(isLoggedIn) {
  if (isLoggedIn) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
  } else {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
  }
}

// Sign-Up with Email and Password
function signUpWithEmail(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User signed up
      toggleUI(true);  // Show dashboard
      console.log('User signed up and logged in:', userCredential.user);
    })
    .catch((error) => {
      console.error("Sign-up failed: ", error.message);
      alert("Sign-up failed: " + error.message);  // Show error to user
    });
}

// Sign-In with Email and Password
function signInWithEmail(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User signed in
      toggleUI(true);  // Show dashboard
      console.log('User signed in:', userCredential.user);
    })
    .catch((error) => {
      console.error("Login failed: ", error.message);
      alert("Login failed: " + error.message);  // Show error to user
    });
}

// Sign-In with Google
function signInWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // User signed in with Google
      toggleUI(true);  // Show dashboard
      console.log('User signed in with Google:', result.user);
    })
    .catch((error) => {
      console.error("Google Sign-In failed: ", error.message);
      alert("Google Sign-In failed: " + error.message);
    });
}

// Sign out
function logout() {
  signOut(auth).then(() => {
    toggleUI(false);  // Show login form after logout
    console.log('User signed out');
  }).catch((error) => {
    console.error("Logout failed: ", error.message);
  });
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    toggleUI(true);  // User is logged in, show the dashboard
  } else {
    toggleUI(false);  // User is not logged in, show the login form
  }
});

// Event listeners for form buttons
document.getElementById('sign-up-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signUpWithEmail(email, password);  // Trigger sign-up
});

document.getElementById('sign-in-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmail(email, password);  // Trigger sign-in
});

document.getElementById('google-sign-in-btn').addEventListener('click', () => {
  signInWithGoogle();  // Trigger Google sign-in
});

document.getElementById('logout-btn').addEventListener('click', () => {
  logout();  // Trigger logout
});

// Parameterized tank dimensions
let tankHeight = 35;  // default value, will be updated from Firebase
let tankLength = 45;  // default value, will be updated from Firebase
let tankWidth = 45;   // default value, will be updated from Firebase
let septicTankCapacity = calculateSepticTankCapacity(); // Initialize septic tank capacity

// Function to calculate septic tank capacity
function calculateSepticTankCapacity() {
  return (tankLength * tankWidth * tankHeight) / 1000;  // capacity in liters
}

// Fetch tank dimensions and capacity percentage from Firebase on page load
function fetchTankDataFromFirebase() {
  const tankSettingsRef = ref(database, 'tankSettings');
  const capacityRef = ref(database, 'septicTankData');  // Assuming capacity % is stored here

  // Fetch tank dimensions
  get(tankSettingsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      tankHeight = data.tankHeight || tankHeight;
      tankLength = data.tankLength || tankLength;
      tankWidth = data.tankWidth || tankWidth;
      septicTankCapacity = calculateSepticTankCapacity();  // Recalculate capacity with new dimensions

      // Fetch current capacity percentage
      get(query(capacityRef, limitToLast(1))).then((capacitySnapshot) => {
        if (capacitySnapshot.exists()) {
          const capacityData = Object.values(capacitySnapshot.val())[0];
          const capacityPercentage = capacityData.capacity || 0;

          // Recalculate the volume and update the charts
          const currentVolume = (capacityPercentage / 100) * septicTankCapacity;
          updateCapacityChart(capacityPercentage);
          updateHistoricalChart(capacityPercentage, capacityData.date, capacityData.timestamp);
        }
      }).catch((error) => console.error('Error fetching capacity data:', error));
    } else {
      console.log('No tank settings found in Firebase');
    }
  }).catch((error) => console.error('Error fetching tank settings:', error));
}

// Save new tank dimensions to Firebase when user clicks Save
function saveTankDimensions(height, length, width) {
  const tankSettingsRef = ref(database, 'tankSettings');

  tankHeight = height;
  tankLength = length;
  tankWidth = width;
  septicTankCapacity = calculateSepticTankCapacity();  // Recalculate capacity

  set(tankSettingsRef, {
    tankHeight: tankHeight,
    tankLength: tankLength,
    tankWidth: tankWidth
  }).then(() => {
    console.log('Tank settings saved to Firebase');
    fetchTankDataFromFirebase();  // Re-fetch data to update charts
  }).catch((error) => console.error('Error saving tank settings:', error));
}
// Function to update the capacity chart after changing dimensions
function updateCapacityChart(capacityPercentage) {
  const available = 100 - capacityPercentage;
  capacityChart.data.datasets[0].data = [capacityPercentage, available];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `
    <span class="capacity-text">Capacity: ${capacityPercentage}%</span>`;

  let status;
  if (capacityPercentage < 75) {
    status = 'Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: green;"><strong>${status}</strong></span>`;
  } else if (capacityPercentage >= 75 && capacity <= 85) {
    status = 'Above Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: yellow;"><strong>${status}</strong></span>`;
  } else if (capacityPercentage >= 86 && capacityPercentage <= 95) {
    status = 'Critical';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: orange;"><strong>${status}</strong></span>`;
  } else if (capacityPercentage > 95) {
    status = 'Full';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: red;"><strong>${status}</strong></span>`;
  }
}
// Event listener for the Save button in the Settings modal
document.getElementById('save-settings').addEventListener('click', () => {
  const newHeight = parseFloat(document.getElementById('input-tankHeight').value);
  const newLength = parseFloat(document.getElementById('input-tankLength').value);
  const newWidth = parseFloat(document.getElementById('input-tankWidth').value);

  saveTankDimensions(newHeight, newLength, newWidth);  // Save new dimensions to Firebase
  document.getElementById('settingsModal').style.display = 'none';  // Close the settings modal
});

// Fetch tank dimensions and capacity on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchTankDataFromFirebase();  // Fetch the dimensions and capacity from Firebase
});

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// variables for the prediction logic
let previousVolume = null;
let previousTimestamp = null;

// Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#FF5A5F', '#82CFFF'],  // Updated colors
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting legend colors
          },
          font: {
            family: 'Poppins',  // Matching font
            size: 14
          }
        }
      }
    }
  }
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
  type: 'line',
  data: {
    labels: [],  // Timestamps
    datasets: [{
      label: 'Septic Tank Levels Over Time',
      data: [],  // Capacity percentages over time
      borderColor: '#82CFFF',
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting legend colors
          },
          font: {
            family: 'Poppins',
            size: 14
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time and Date',  // X-axis label
          font: {
            size: 14,
            family: 'Poppins'
          },
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting X-axis label colors
          }
        },
        ticks: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting X-axis ticks color
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Septic Tank Capacity (%)',  // Y-axis label
          font: {
            size: 14,
            family: 'Poppins'
          },
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting Y-axis label colors
          }
        },
        ticks: {
          color: function(context) {
            return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';  // Adapting Y-axis ticks color
          }
        },
        min: 0,  // Start Y-axis from 0
        max: 100 // Maximum value for the Y-axis
      }
    }
  }
});

// update capacity and status
function updateCapacity(capacity) {
  const available = 100 - capacity;
  capacityChart.data.datasets[0].data = [capacity, available];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `
    <span class="capacity-text">Capacity: ${capacity}%</span>`;

  let status;
  if (capacity < 75) {
    status = 'Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: green;"><strong>${status}</strong></span>`;
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: yellow;"><strong>${status}</strong></span>`;
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: orange;"><strong>${status}</strong></span>`;
  } else if (capacity > 95) {
    status = 'Full';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: red;"><strong>${status}</strong></span>`;
  }
}

// update the historical chart
function updateHistoricalChart(capacity, date, timestamp) {
  const label = `${date} ${timestamp}`;  // combine date and timestamp for display
  historicalChart.data.labels.push(label);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// prediction
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    // difference in volume and time
    const deltaVolume = currentVolume - previousVolume;  // in liters
    const deltaTime = currentTime - previousTimestamp;   // in seconds

    // flow rate (liters per second)
    const flowRate = deltaVolume / deltaTime;

    // remaining volume (in liters)
    const remainingVolume = septicTankCapacity - currentVolume;

    // estimated time to full (in seconds)
    const estimatedTimeToFull = remainingVolume / flowRate;

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // convert to hours
      document.getElementById("prediction").innerHTML = 
        `<span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = 
        `<span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  // Store current values for next calculation
  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

// node tree
const septicDataRef = ref(database, 'septicTankData');
const limitedDataRef = query(septicDataRef, limitToLast(10)); // limit last 10 entries only(if daghan na kaayo)

// real time update listener
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // capacity
  const date = data.date;  // date 
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString(); // timestamp
  const currentVolume = (capacity / 100) * septicTankCapacity;  // calculate current volume based on capacity

  // update capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, date, timestamp);
  
  // prediction
  calculatePrediction(currentVolume, data.timestamp);
});
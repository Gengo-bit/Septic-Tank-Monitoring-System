// Firebase, chart.js imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase Firestore instance
const firestore = getFirestore(app);
const auth = getAuth();

// UI Elements
const authModal = document.getElementById('authModal');
const closeAuth = document.querySelector('.close-auth');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const resetForm = document.getElementById('resetForm');

// Open the authentication modal
authModal.style.display = 'flex';

// Close the modal when the close button is clicked
closeAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Switch between forms
document.getElementById('showSignUp').addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});
document.getElementById('showLogin').addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});
document.getElementById('showReset').addEventListener('click', () => {
    loginForm.style.display = 'none';
    resetForm.style.display = 'block';
});
document.getElementById('backToLogin').addEventListener('click', () => {
    resetForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Handle login
document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // Signed in 
            authModal.style.display = 'none';
            console.log("Logged in successfully:", userCredential.user);
        })
        .catch(error => {
            console.error("Error logging in:", error.message);
        });
});

// Handle sign up
document.getElementById('signupBtn').addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // Signed up 
            authModal.style.display = 'none';
            console.log("User created successfully:", userCredential.user);
            
            // Store user data in Firestore
            setDoc(doc(firestore, "users", userCredential.user.uid), {
                email: email,
                role: "admin"  // You can modify the role based on your needs
            });
        })
        .catch(error => {
            console.error("Error signing up:", error.message);
        });
});

// Handle password reset
document.getElementById('resetBtn').addEventListener('click', () => {
    const email = document.getElementById('resetEmail').value;
    sendPasswordResetEmail(auth, email)
        .then(() => {
            console.log("Password reset email sent!");
        })
        .catch(error => {
            console.error("Error sending password reset email:", error.message);
        });
});

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user);
    } else {
        authModal.style.display = 'flex';  // Show login modal if not logged in
    }
});

// Sign out function
document.getElementById('signOutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("User signed out successfully");
    }).catch((error) => {
        console.error("Error signing out:", error.message);
    });
});


//import { doc, getDoc } from "firebase/firestore";

function checkAdmin(uid) {
    const userRef = doc(firestore, "users", uid);
    getDoc(userRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().role === "admin") {
            console.log("User is admin.");
            // Allow access to admin features
        } else {
            console.log("User is not an admin.");
            // Redirect or restrict access
        }
    });
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app); 

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
// Parameterized tank dimensions
let tankHeight = 35;  //cm
let tankLength = 45;  //cm
let tankWidth = 45;   //cm
let septicTankCapacity = calculateSepticTankCapacity(); // Initialize septic tank capacity

// Function to calculate septic tank capacity
function calculateSepticTankCapacity() {
  return (tankLength * tankWidth * tankHeight) / 1000;  // capacity in liters
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
      let hoursToFull = estimatedTimeToFull / 3600; // convert to hours
      if (hoursToFull >= 1) {
        // If the time to full is more than or equal to 1 hour, display in hours
        document.getElementById("prediction").innerHTML = 
          `<span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull.toFixed(2)} hours</strong></span>`;
      } else {
        // If the time to full is less than 1 hour, convert to minutes
        const minutesToFull = (hoursToFull * 60).toFixed(0); // convert to minutes
        document.getElementById("prediction").innerHTML = 
          `<span class="time-until-full">The Septic Tank will be full in <strong>${minutesToFull} minutes</strong></span>`;
      }
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
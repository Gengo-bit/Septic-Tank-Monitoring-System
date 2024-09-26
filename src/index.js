// Firebase, chart.js imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, query, limitToLast, onChildAdded, set, get } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
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
const database = getDatabase(app);
const auth = getAuth(); // Initialize Firebase Auth

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
let tankHeight = 35;  // default value, will be updated from Firebase
let tankLength = 45;  // default value, will be updated from Firebase
let tankWidth = 45;   // default value, will be updated from Firebase
let septicTankCapacity = calculateSepticTankCapacity(); // Initialize septic tank capacity

// Function to calculate septic tank capacity
function calculateSepticTankCapacity() {
  return (tankLength * tankWidth * tankHeight) / 1000;  // capacity in liters
}

// Save new tank dimensions to Firebase
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

// Fetch tank dimensions and capacity percentage from Firebase
function fetchTankDataFromFirebase() {
  const tankSettingsRef = ref(database, 'tankSettings');
  const capacityRef = ref(database, 'septicTankData');

  get(tankSettingsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      tankHeight = data.tankHeight || tankHeight;
      tankLength = data.tankLength || tankLength;
      tankWidth = data.tankWidth || tankWidth;
      septicTankCapacity = calculateSepticTankCapacity();  // Recalculate capacity with new dimensions

      get(query(capacityRef, limitToLast(1))).then((capacitySnapshot) => {
        if (capacitySnapshot.exists()) {
          const capacityData = Object.values(capacitySnapshot.val())[0];
          const capacityPercentage = capacityData.capacity || 0;

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

// Function to update the capacity chart
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
  } else if (capacityPercentage >= 75 && capacityPercentage <= 85) {
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

// Function to update the historical chart
function updateHistoricalChart(capacity, date, timestamp) {
  const label = `${date} ${timestamp}`;
  historicalChart.data.labels.push(label);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Prediction function (if needed)
function calculatePrediction(currentVolume, currentTime) {
  // Implement prediction logic
}

// Charts initialization
let capacityChart, historicalChart;
function initializeCharts() {
  const ctx = document.getElementById('capacityChart').getContext('2d');
  capacityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Available'],
      datasets: [{
        label: 'Septic Tank Capacity',
        data: [0, 100],  // Initial values
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
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
            },
            font: {
              family: 'Poppins',
              size: 14
            }
          }
        }
      }
    }
  });

  const historicalCtx = document.getElementById('historicalChart').getContext('2d');
  historicalChart = new Chart(historicalCtx, {
    type: 'line',
    data: {
      labels: [],  // Timestamps
      datasets: [{
        label: 'Septic Tank Levels Over Time',
        data: [],
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
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
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
            text: 'Time and Date',
            font: {
              size: 14,
              family: 'Poppins'
            },
            color: function(context) {
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
            }
          },
          ticks: {
            color: function(context) {
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Septic Tank Capacity (%)',
            font: {
              size: 14,
              family: 'Poppins'
            },
            color: function(context) {
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
            }
          },
          ticks: {
            color: function(context) {
              return context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A';
            }
          },
          min: 0,  // Start Y-axis from 0
          max: 100  // Maximum value for the Y-axis
        }
      }
    }
  });
}

// Authentication and initialization logic
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, proceed with septic tank monitoring functionalities
      initializeCharts();  // Initialize the charts
      fetchTankDataFromFirebase();  // Fetch the data from Firebase
      document.getElementById("main-content").style.display = "block";  // Show the main content
      document.getElementById("login-container").style.display = "none";  // Hide the login form
    } else {
      // No user is signed in, show login form
      document.getElementById("main-content").style.display = "none";  // Hide the main content
      document.getElementById("login-container").style.display = "flex";  // Show the login form
    }
  });
});

// Handle login form submission
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Successfully logged in, show main content
      document.getElementById("main-content").style.display = "block";
      document.getElementById("login-container").style.display = "none";
    })
    .catch((error) => {
      // Display error message to the user
      document.getElementById("login-error").textContent = error.message;
    });
});

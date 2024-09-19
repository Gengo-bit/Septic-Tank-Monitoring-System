// Import necessary Firebase functions and Chart.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onChildAdded } from "firebase/database";
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
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Variables for the prediction logic
let previousVolume = null;
let previousTimestamp = null;
const septicTankCapacity = 1000; // TENTATIVE PANI

// Capacity Chart
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('capacityChart').getContext('2d');
  const capacity = 60;  // Replace with Firebase data dynamically

  // Check if it's dark mode or light mode
  const isDarkMode = document.body.classList.contains('dark-mode');  // Replace with your own condition

  // Set colors based on theme
  const usedCapacityColor = isDarkMode ? '#4CAF50' : '#388E3C';  // Green variants
  const remainingCapacityColor = isDarkMode ? '#424242' : '#ddd';  // Grey variants

  new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: ['Used Capacity', 'Remaining Capacity'],
          datasets: [{
              data: [capacity, 100 - capacity],
              backgroundColor: [usedCapacityColor, remainingCapacityColor],
              borderWidth: 0  // Make sure it blends well without extra borders
          }]
      },
      options: {
          responsive: true,
          cutout: '70%',  // Make the center part bigger for a cleaner look
          plugins: {
              legend: {
                  display: true,
                  labels: {
                      color: isDarkMode ? '#fff' : '#000'  // Adjust text color for the legend
                  }
              }
          },
          animation: {
              animateScale: true  // Adds a pop-in animation
          }
      }
  });
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
document.addEventListener('DOMContentLoaded', () => {
  const historicalCtx = document.getElementById('historicalChart').getContext('2d');

  // Check if it's dark mode or light mode
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Set theme-specific colors
  const lineColor = isDarkMode ? '#66BB6A' : '#2E7D32';  // Green variants for lines
  const backgroundColor = isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(46, 125, 50, 0.2)';  // Subtle backgrounds
  const gridColor = isDarkMode ? '#424242' : '#ddd';  // Grid line color

  new Chart(historicalCtx, {
      type: 'line',
      data: {
          labels: historicalLabels,
          datasets: [{
              label: 'Capacity Over Time',
              data: historicalData,
              borderColor: lineColor,
              backgroundColor: backgroundColor,
              fill: true,  // Add a filled area under the line
              tension: 0.4  // Add some curve to the line for better aesthetics
          }]
      },
      options: {
          responsive: true,
          scales: {
              x: {
                  grid: {
                      color: gridColor  // Gridline color for X-axis
                  },
                  ticks: {
                      color: isDarkMode ? '#fff' : '#000'  // X-axis text color
                  }
              },
              y: {
                  grid: {
                      color: gridColor  // Gridline color for Y-axis
                  },
                  ticks: {
                      color: isDarkMode ? '#fff' : '#000'  // Y-axis text color
                  }
              }
          },
          plugins: {
              legend: {
                  labels: {
                      color: isDarkMode ? '#fff' : '#000'  // Legend text color
                  }
              }
          },
          animation: {
              duration: 1000,  // Add smooth transition animations
              easing: 'easeOutBounce'  // Makes animation slightly bouncy
          }
      }
  });
});

// Function to update capacity and status
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

// Function to update the historical chart
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(timestamp);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to calculate and update the estimated time until full
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    const deltaVolume = currentVolume - previousVolume;
    const deltaTime = currentTime - previousTimestamp;

    const flowRate = deltaVolume / deltaTime; // liters per second

    const remainingVolume = septicTankCapacity - currentVolume; // liters
    const estimatedTimeToFull = remainingVolume / flowRate; // seconds

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // convert seconds to hours
      document.getElementById("prediction").innerHTML = `
        <span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = `
        <span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

// Set up real-time listener from Firebase Realtime Database
const septicDataRef = ref(database, 'septicTankData');

// Listening for real-time data updates
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // Get capacity percentage from Firebase
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();
  const currentVolume = capacity * septicTankCapacity / 100;  // Calculate current volume based on capacity

  // Update both the capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
  calculatePrediction(currentVolume, data.timestamp);  // Update prediction
});

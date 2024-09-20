// Import necessary Firebase functions and Chart.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, query, limitToLast, onChildAdded } from "firebase/database";
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

// Function to get the current value of the CSS variable
function getTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
}

// Function to update chart colors dynamically
function updateChartColors() {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

  // Update capacity chart colors
  capacityChart.options.plugins.legend.labels.color = textColor;
  capacityChart.update();  // This will refresh the chart

  // Update historical chart colors
  historicalChart.options.plugins.legend.labels.color = textColor;
  historicalChart.options.scales.x.title.color = textColor;
  historicalChart.options.scales.x.ticks.color = textColor;
  historicalChart.options.scales.y.title.color = textColor;
  historicalChart.options.scales.y.ticks.color = textColor;
  historicalChart.update();  // This will refresh the chart
}

// Add CSS styles dynamically to the document
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
const tankHeight = 35; // cm
const tankLength = 45; // cm
const tankWidth = 45;  // cm
const septicTankCapacity = (tankLength * tankWidth * tankHeight) / 1000; // Total capacity in liters

// Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#ff6384', '#36a2eb'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getTextColor()  // Set the legend color to the CSS variable
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
      borderColor: '#42a5f5',
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: getTextColor()  // Set the legend color to the CSS variable
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time and Date',  // X-axis label
          font: {
            size: 14
          },
          color: getTextColor()  // Set X-axis title color to the CSS variable
        },
        ticks: {
          color: getTextColor()  // Set X-axis tick color to the CSS variable
        }
      },
      y: {
        title: {
          display: true,
          text: 'Septic Tank Capacity (%)',  // Y-axis label
          font: {
            size: 14
          },
          color: getTextColor()  // Set Y-axis title color to the CSS variable
        },
        ticks: {
          color: getTextColor()  // Set Y-axis tick color to the CSS variable
        },
        min: 0,  // Start Y-axis from 0
        max: 100 // Maximum value for the Y-axis
      }
    }
  }
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
function updateHistoricalChart(capacity, date, timestamp) {
  const label = `${date} ${timestamp}`;  // Combine date and timestamp for display
  historicalChart.data.labels.push(label);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to calculate and update the estimated time until full
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    // Calculate the difference in volume and time
    const deltaVolume = currentVolume - previousVolume;  // in liters
    const deltaTime = currentTime - previousTimestamp;   // in seconds

    // Calculate flow rate (liters per second)
    const flowRate = deltaVolume / deltaTime;

    // Calculate remaining volume (in liters)
    const remainingVolume = septicTankCapacity - currentVolume;

    // Calculate estimated time to full (in seconds)
    const estimatedTimeToFull = remainingVolume / flowRate;

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // Convert to hours
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

// Set up real-time listener from Firebase Realtime Database
const septicDataRef = ref(database, 'septicTankData');
const limitedDataRef = query(septicDataRef, limitToLast(10)); // Fetch only the last 10 entries

// Listening for real-time data updates
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // Get capacity percentage from Firebase
  const date = data.date;  // Get date from Firebase
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();
  const currentVolume = (capacity / 100) * septicTankCapacity;  // Calculate current volume based on capacity

  // Update both the capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, date, timestamp);
  
  // Calculate and update the prediction using current volume and timestamp
  calculatePrediction(currentVolume, data.timestamp);
});

// Function to handle theme switching
function recreateCharts() {
  // Toggle between light and dark mode
  const isDarkMode = document.body.classList.toggle('darkmode');
  
  // Update chart colors after switching the theme
  updateChartColors();
}

// Event listener for the theme switch button
document.getElementById('theme-switch').addEventListener('click', () => {
  setTimeout(recreateCharts, 300);  // Delay to allow theme switch transition
});

// Update charts whenever the theme changes
document.getElementById('theme-switch').addEventListener('click', () => {
  setTimeout(() => {
    updateChartColors();
  }, 300);  // Give it some time to toggle theme
});

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
const tankHeight = 50; // cm
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
    maintainAspectRatio: false
  }
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
  type: 'line',
  data: {
    labels: [],  // Timestamps
    datasets: [{
      label: 'Septic Tank Capacity Over Time',
      data: [],  // Capacity percentages over time
      borderColor: '#42a5f5',
      backgroundColor: 'rgba(66, 165, 245, 0.2)',  // Light blue fill for better readability
      borderWidth: 2,
      fill: true,
      tension: 0.4 // Smooth out the line curve
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM DD, YYYY, HH:mm:ss',
          displayFormats: {
            day: 'MMM D',
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time and Date',
          font: {
            family: 'Poppins',
            size: 14,
            weight: 'bold',
          },
          color: '#333'  // Text color for x-axis
        }
      },
      y: {
        beginAtZero: true,
        max: 100,  // Y-axis for capacity percentage
        title: {
          display: true,
          text: 'Septic Tank Capacity (%)',
          font: {
            family: 'Poppins',
            size: 14,
            weight: 'bold',
          },
          color: '#333'  // Text color for y-axis
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            family: 'Montserrat',
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}% on ${context.label}`;
          }
        }
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

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

// Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#36a2eb', '#d3d3d3'],  // Initial color for "Normal"
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,  // Adjust aspect ratio for better fit
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Update the capacity based on Firebase data
function updateCapacity(capacity) {
  let status;
  let color;

  if (capacity < 75) {
    status = 'Normal';
    color = '#36a2eb';  // Blue for "Normal"
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    color = '#ffce56';  // Yellow for "Above Normal"
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    color = '#ffa500';  // Orange for "Critical"
  } else {
    status = 'Full';
    color = '#ff6384';  // Red for "Full"
  }

  // Update capacity display and chart
  document.getElementById("capacity").textContent = `Capacity: ${capacity}% (${status})`;
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();
}

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
    maintainAspectRatio: true,
    aspectRatio: 3,  // Make the chart wider and less tall
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Update the historical chart with new data
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(new Date(timestamp * 1000).toLocaleTimeString());
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to predict when the tank will be full
function predictFullTank(capacityHistory) {
  if (capacityHistory.length < 2) {
    return "Not enough data for prediction";
  }

  const lastEntry = capacityHistory[capacityHistory.length - 1];
  const secondLastEntry = capacityHistory[capacityHistory.length - 2];

  const timeDiff = (lastEntry[1] - secondLastEntry[1]) / 3600; // Time difference in hours
  const capacityDiff = lastEntry[0] - secondLastEntry[0]; // Capacity difference

  if (capacityDiff <= 0) {
    return "Capacity not increasing";
  }

  const remainingCapacity = 100 - lastEntry[0]; // Remaining capacity
  const estimatedTime = (remainingCapacity / capacityDiff) * timeDiff; // Time until full in hours

  if (estimatedTime > 0) {
    const days = Math.floor(estimatedTime / 24);
    const hours = Math.floor(estimatedTime % 24);
    return `Estimated Time Until Full: ${days} days, ${hours} hours`;
  }

  return "Not enough data for prediction";
}

// Track capacity history for prediction
const capacityHistory = [];

// Fetch and update data from Firebase
const septicDataRef = ref(database, 'septicTankData');

onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  console.log("Snapshot: ", snapshot.val());
  const capacity = data.capacity;
  const timestamp = data.timestamp / 1000;  // Convert timestamp to seconds if necessary

  console.log("Capacity: ", capacity);
  console.log("Timestamp: ", timestamp);

  // Add the new data to the capacity history for prediction
  capacityHistory.push([capacity, timestamp]);

  // Update the charts and prediction
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
  const predictionText = predictFullTank(capacityHistory);
  document.getElementById("prediction").textContent = predictionText;

  console.log("Prediction: ", predictionText);
});

// Test the prediction UI update (this can be removed after testing)
window.onload = function() {
  document.getElementById("prediction").textContent = "Loading prediction...";
};

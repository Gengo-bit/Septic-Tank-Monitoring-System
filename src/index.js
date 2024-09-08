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

// Capacity Chart with animations
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#36a2eb', '#d3d3d3'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500
    },
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Function to display the status separately
function displayStatus(status) {
  const statusElement = document.getElementById("status");
  statusElement.textContent = `Status: ${status}`;
  statusElement.style.fontSize = '1.5em';
  statusElement.style.fontWeight = 'bold';
  statusElement.style.marginBottom = '10px';
}

// Update the capacity based on Firebase data
function updateCapacity(capacity) {
  let status;
  let color;

  if (capacity < 75) {
    status = 'Normal';
    color = '#36a2eb';
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    color = '#ffce56';
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    color = '#ffa500';
  } else if (capacity > 95) {
    status = 'Full';
    color = '#ff6384';
  }

  // Update capacity and status display
  document.getElementById("capacity").textContent = `Capacity: ${capacity}%`;
  document.getElementById("status").textContent = `Status: ${status}`;
  
  // Add transition effects for color change
  document.getElementById("status").className = status.toLowerCase();

  // Update the chart with the new data
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();
}

// Historical Chart with wider aspect ratio
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
    aspectRatio: 3,
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

  const timeDiff = (lastEntry[1] - secondLastEntry[1]) / 3600;
  const capacityDiff = lastEntry[0] - secondLastEntry[0];

  if (capacityDiff <= 0) {
    return "Capacity not increasing";
  }

  const remainingCapacity = 100 - lastEntry[0];
  const estimatedTime = (remainingCapacity / capacityDiff) * timeDiff;

  if (estimatedTime > 0) {
    const days = Math.floor(estimatedTime / 24);
    const hours = Math.floor(estimatedTime % 24);
    return `Estimated Time Until Full: ${days} days, ${hours} hours`;
  }

  return "Not enough data for prediction";
}

// Firebase listener to get live data from the database
onChildAdded(ref(database, 'sensor_data'), (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;
  const timestamp = data.timestamp;

  // Update the chart and the historical data
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
});

// Example capacity history for predictions
const capacityHistory = [
  [65, 1725500000],
  [70, 1725550000],
  [75, 1725600000],
  [85, 1725650000]
];

// Generate and display prediction
const predictionText = predictFullTank(capacityHistory);
document.getElementById("prediction").textContent = predictionText;

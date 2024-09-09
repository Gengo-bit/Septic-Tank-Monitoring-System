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

// Define colors for light and dark modes
const lightModeColors = {
    background: ['#52fa52', '#e0e0e0'],  // Light green for used, light gray for available
    borderColor: '#333',                 // Darker text for light mode
    gridColor: '#cccccc',                // Light grid lines
    tickColor: '#000'                    // Black ticks in light mode
};

const darkModeColors = {
    background: ['#ffa500', '#333'],     // Orange for used, dark background for available
    borderColor: '#f5f5f5',              // Lighter text for dark mode
    gridColor: '#555555',                // Dark grid lines
    tickColor: '#fff'                    // White ticks in dark mode
};

// Function to update chart colors based on mode
function updateChartColors(mode) {
    const colors = mode === 'darkmode' ? darkModeColors : lightModeColors;

    // Update Capacity Chart Colors
    capacityChart.data.datasets[0].backgroundColor = colors.background;
    capacityChart.options.plugins.legend.labels.color = colors.borderColor;
    capacityChart.options.scales = {
        x: { grid: { color: colors.gridColor }, ticks: { color: colors.tickColor } },
        y: { grid: { color: colors.gridColor }, ticks: { color: colors.tickColor } }
    };
    capacityChart.update();

    // Update Historical Chart Colors
    historicalChart.data.datasets[0].borderColor = colors.borderColor;
    historicalChart.options.scales = {
        x: { grid: { color: colors.gridColor }, ticks: { color: colors.tickColor } },
        y: { grid: { color: colors.gridColor }, ticks: { color: colors.tickColor } }
    };
    historicalChart.update();
}

// Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: lightModeColors.background,  // Use light mode by default
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,  // Adjust aspect ratio for better fit
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: lightModeColors.borderColor  // Start with light mode colors
        }
      }
    },
    scales: {
      x: { grid: { color: lightModeColors.gridColor }, ticks: { color: lightModeColors.tickColor } },
      y: { grid: { color: lightModeColors.gridColor }, ticks: { color: lightModeColors.tickColor } }
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
      borderColor: '#003d00',
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 3,  // Make the chart wider and less tall
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: lightModeColors.borderColor  // Start with light mode colors
        }
      }
    },
    scales: {
      x: { grid: { color: lightModeColors.gridColor }, ticks: { color: lightModeColors.tickColor } },
      y: { grid: { color: lightModeColors.gridColor }, ticks: { color: lightModeColors.tickColor } }
    }
  }
});

// Function to update the capacity and status
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

  // Update capacity and status display
  document.getElementById("capacity").textContent = `Capacity: ${capacity}%`;
  document.getElementById("status").textContent = `Status: ${status}`;
  
  // Update the chart with the new data
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();
}

// Function to update the historical chart
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
  [65, 1725500000],  // Example: 65% capacity at timestamp X
  [70, 1725550000],  // Example: 70% capacity at timestamp Y
  [75, 1725600000],  // Example: 75% capacity at timestamp Z
  [85, 1725650000]   // Example: 85% capacity at timestamp W
];

// Generate and display prediction
const predictionText = predictFullTank(capacityHistory);
document.getElementById("prediction").textContent = predictionText;
console.log("Prediction:", predictionText);

// Initial load: set chart colors based on current mode
const currentMode = document.body.classList.contains('darkmode') ? 'darkmode' : 'light-mode';
updateChartColors(currentMode);

// Toggle theme and update chart colors when the theme is changed
document.getElementById('theme-switch').addEventListener('click', () => {
    const newMode = document.body.classList.contains('darkmode') ? 'darkmode' : 'light-mode';
    updateChartColors(newMode);
});

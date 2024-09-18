// Import necessary Firebase functions and Chart.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onChildAdded } from "firebase/database";
import Chart from "chart.js/auto";
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

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

// Update chart colors based on light or dark mode
function updateChartColors(mode) {
  const colors = mode === 'darkmode' ? darkModeColors : lightModeColors;

  // Update Capacity Chart Colors
  capacityChart.data.datasets[0].backgroundColor = colors.background;
  capacityChart.options.plugins.legend.labels.color = colors.borderColor;
  capacityChart.options.scales.x.grid.color = colors.gridColor;
  capacityChart.options.scales.y.grid.color = colors.gridColor;
  capacityChart.options.scales.x.ticks.color = colors.tickColor;
  capacityChart.options.scales.y.ticks.color = colors.tickColor;
  capacityChart.update();

  // Update Historical Chart Colors
  historicalChart.data.datasets[0].borderColor = colors.borderColor;
  historicalChart.options.scales.x.grid.color = colors.gridColor;
  historicalChart.options.scales.y.grid.color = colors.gridColor;
  historicalChart.options.scales.x.ticks.color = colors.tickColor;
  historicalChart.options.scales.y.ticks.color = colors.tickColor;
  historicalChart.update();
}

// Capacity Chart
const capacityCtx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(capacityCtx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#52fa52', '#003d00'],
      borderWidth: 10 // Adjusted border width
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
    labels: [], // This will be updated dynamically
    datasets: [{
      label: 'Septic Tank Levels Over Time',
      data: [], // This will be updated dynamically
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.1,
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'll HH:mm' },
        title: { display: true, text: 'Date & Time' }
      },
      y: {
        title: { display: true, text: 'Tank Capacity (%)' },
        min: 0, max: 100
      }
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { enabled: true, mode: 'x', drag: true, speed: 0.1 }
      }
    }
  }
});

// Function to update capacity and status
function updateCapacity(capacity) {
  let status, color;

  if (capacity < 75) {
    status = 'Normal';
    color = '#36a2eb';  // Blue
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    color = '#ffce56';  // Yellow
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    color = '#ffa500';  // Orange
  } else {
    status = 'Full';
    color = '#ff6384';  // Red
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
  const dateTimeISO = new Date(timestamp * 1000).toISOString();
  historicalChart.data.labels.push(dateTimeISO);  // Use ISO string for Chart.js
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Firebase listener for live data
onChildAdded(ref(database, 'septicTankData'), (snapshot) => {
  const data = snapshot.val();
  const { capacity, timestamp } = data;

  updateCapacity(capacity);  // Update capacity and chart
  updateHistoricalChart(capacity, timestamp);  // Update historical chart
});

// Initial load: set chart colors based on current mode
const currentMode = document.body.classList.contains('darkmode') ? 'darkmode' : 'light-mode';
updateChartColors(currentMode);

// Toggle theme and update chart colors
document.getElementById('theme-switch').addEventListener('click', () => {
  const newMode = document.body.classList.contains('darkmode') ? 'darkmode' : 'light-mode';
  updateChartColors(newMode);
});

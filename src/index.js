// Import necessary Firebase functions and Chart.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue } from "firebase/database";
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

// Capacity Chart
const capacityCtx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(capacityCtx, {
  type: 'doughnut',
  data: {
    labels: ['Used', 'Available'],
    datasets: [{
      label: 'Septic Tank Capacity',
      data: [0, 100],  // Initial values: 0% used, 100% available
      backgroundColor: ['#36a2eb', '#d3d3d3'],  // Initial color for "Normal"
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  }
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
  type: 'line',
  data: {
    labels: [],  // Placeholder for timestamps
    datasets: [{
      label: 'Septic Tank Capacity Over Time',
      data: [],  // Placeholder for data
      borderColor: '#36a2eb',
      fill: false,
      tension: 0.1,
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
          displayFormats: {
            day: 'MMM D'
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
      }
    }
  }
});

// Function to update capacity and status
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
  } else if (capacity > 95) {
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
  const dateTimeISO = new Date(timestamp * 1000).toISOString();
  historicalChart.data.labels.push(dateTimeISO);  // Use ISO string for Chart.js
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Firebase listener for the latest capacity data
const capacityRef = ref(database, 'septicTankData');
onValue(capacityRef, (snapshot) => {
  const data = snapshot.val();

  // Extract the last entry
  const keys = Object.keys(data);
  const latestKey = keys[keys.length - 1];
  const latestData = data[latestKey];
  const { capacity, timestamp } = latestData;

  updateCapacity(capacity);  // Update capacity and chart
  updateHistoricalChart(capacity, timestamp);  // Update historical chart
});

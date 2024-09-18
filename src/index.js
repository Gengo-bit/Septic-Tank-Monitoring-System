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
          color: '#333'  // Static color
        }
      }
    },
    scales: {
      x: { grid: { color: '#cccccc' }, ticks: { color: '#000' } },
      y: { grid: { color: '#cccccc' }, ticks: { color: '#000' } }
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
  document.getElementById("capacity").textContent = `Capacity: ${capacity}%xxxx`;
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
  const { capacity, date, timestamp} = latestData;

  updateCapacity(capacity);  // Update capacity and chart
  updateHistoricalChart(capacity, timestamp);  // Update historical chart
});

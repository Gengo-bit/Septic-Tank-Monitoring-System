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

// Function to update the historical chart
function updateHistoricalChart(capacity, timestamp) {
  const dateTimeISO = new Date(timestamp * 1000).toISOString();
  historicalChart.data.labels.push(dateTimeISO);  // Use ISO string for Chart.js
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}
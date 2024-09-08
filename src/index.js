import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onChildAdded } from "firebase/database";
import Chart from "chart.js/auto";

// Firebase configuration
const firebaseConfig = {
  apiKey: "API_KEY",
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

// Fetch data from Firebase and update capacity and historical data
const septicDataRef = ref(database, 'septicTankData');
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;
  const timestamp = data.timestamp;

  // Update the charts
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
});

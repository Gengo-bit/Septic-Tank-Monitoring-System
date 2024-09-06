import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onChildAdded } from "firebase/database";
import Chart from "chart.js/auto";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Chart.js for the capacity chart
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
    responsive: true,  // Make the chart responsive
    maintainAspectRatio: true,  // Ensure the aspect ratio is maintained
    aspectRatio: 2,  // Set a custom aspect ratio (wider and less tall)
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Function to update the capacity and apply thresholds
function updateCapacity(capacity) {
  let color;
  let status;

  // Determine the color and status based on the capacity
  if (capacity < 75) {
    color = '#36a2eb';  // Blue for Normal
    status = 'Normal';
  } else if (capacity >= 75 && capacity <= 85) {
    color = '#ffce56';  // Yellow for Above Normal
    status = 'Above Normal';
  } else if (capacity >= 86 && capacity <= 95) {
    color = '#ffa500';  // Orange for Critical
    status = 'Critical';
  } else {
    color = '#ff6384';  // Red for Full
    status = 'Full';
  }

  // Update the doughnut chart with the correct color
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();

  // Update the webpage to display the current capacity and status
  document.getElementById("capacity").textContent = `Capacity: ${capacity}% (${status})`;
}

// Initialize Chart.js for the historical chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Septic Tank Levels Over Time',
      data: [],
      borderColor: '#42a5f5',
      fill: false
    }]
  },
  options: {
    responsive: true,  // Make the chart responsive
    maintainAspectRatio: true,  // Ensure the aspect ratio is maintained
    aspectRatio: 3,  // Set a custom aspect ratio (wider and less tall)
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

// Function to update the historical chart
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(timestamp);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to estimate when the tank will be full
function predictFullTank(capacityHistory) {
  if (capacityHistory.length < 2) {
    return "Not enough data for prediction.";
  }

  const recentData = capacityHistory.slice(-2);  // Get the last two data points
  const [capacity1, time1] = recentData[0];
  const [capacity2, time2] = recentData[1];

  // Calculate the fill rate (percent per second)
  const fillRate = (capacity2 - capacity1) / (time2 - time1);

  if (fillRate <= 0) {
    return "Tank is not filling up.";
  }

  // Estimate time until the tank reaches 100%
  const remainingCapacity = 100 - capacity2;
  const timeUntilFull = remainingCapacity / fillRate;  // Time in seconds

  // Convert the estimated time to a readable format
  const predictedDate = new Date(Date.now() + timeUntilFull * 1000);
  return `Estimated full tank time: ${predictedDate.toLocaleString()}`;
}

// Fetch data from Firebase and update capacity and prediction
const septicDataRef = ref(database, 'septicTankData');
const capacityHistory = [];

// Listening for real-time data updates
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();  // Example timestamp format

  // Add the new data to the capacity history
  capacityHistory.push([capacity, data.timestamp]);

  // Update the charts and prediction
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
  document.getElementById("prediction").textContent = predictFullTank(capacityHistory);
});
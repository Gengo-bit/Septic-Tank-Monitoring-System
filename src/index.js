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
      backgroundColor: ['#ff6384', '#36a2eb'],
      borderWidth: 1
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

// Function to update the capacity and apply thresholds
function updateCapacity(capacity) {
  let color;
  let status;

  if (capacity < 75) {
    color = '#36a2eb';  // Blue for Normal
    status = 'Normal';
  } else if (capacity >= 75 && capacity <= 85) {
    color = '#ffce56';  // Yellow for AboveNormal
    status = 'Above Normal';
  } else if (capacity >= 86 && capacity <= 95) {
    color = '#ffa500';  // Orange for Critical
    status = 'Critical';
  } else {
    color = '#ff6384';  // Red for Full
    status = 'Full';
  }

  // Update the doughnut chart color based on the current capacity
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();

  // Update the webpage with the current capacity and status
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

// Set up real-time listener from Firebase Realtime Database
const septicDataRef = ref(database, 'septicTankData');

// Listening for real-time data updates
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // Get capacity percentage from Firebase
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();

  // Update both the capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
});
// Function to estimate when the tank will be full
function predictFullTank(capacityHistory) {
  if (capacityHistory.length < 2) {
    return "Not enough data for prediction.";
  }

  const recentData = capacityHistory.slice(-2); // Use the last two data points
  const [capacity1, time1] = recentData[0];
  const [capacity2, time2] = recentData[1];

  // Calculate the fill rate (percent per second)
  const fillRate = (capacity2 - capacity1) / (time2 - time1);
  
  if (fillRate <= 0) {
    return "Tank is not filling up.";
  }

  // Estimate the time until the tank reaches 100%
  const remainingCapacity = 100 - capacity2;
  const timeUntilFull = remainingCapacity / fillRate;  // Time in seconds

  // Convert to a human-readable date/time format
  const predictedDate = new Date(Date.now() + timeUntilFull * 1000);
  return `Estimated full tank time: ${predictedDate.toLocaleString()}`;
}

// Assuming you fetch historical data from Firebase like this:
const capacityHistory = [];  // This should be populated with (capacity, timestamp) from Firebase

// Call the prediction function with real data
document.getElementById("prediction").textContent = predictFullTank(capacityHistory);


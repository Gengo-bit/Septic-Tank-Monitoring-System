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

// Variables for the prediction logic
let previousVolume = null;
let previousTimestamp = null;
const septicTankCapacity = 1000; // Adjust according to your actual septic tank volume in liters

// Capacity Chart
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
    responsive: true,
    maintainAspectRatio: false
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
      borderColor: '#42a5f5',
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

// Function to update capacity and status
function updateCapacity(capacity) {
  const available = 100 - capacity;
  capacityChart.data.datasets[0].data = [capacity, available];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `<span style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: #333333;"><strong>Capacity: ${capacity}%</strong></span>`;

  let status;
  if (capacity < 75) {
    status = 'Normal';
    document.getElementById("status").innerHTML = `<span class="status" style="color: green; font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700;"><strong>Status: ${status}</strong></span>`;
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    document.getElementById("status").innerHTML = `<span class="status" style="color: yellow; font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700;"><strong>Status: ${status}</strong></span>`;
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    document.getElementById("status").innerHTML = `<span class="status" style="color: orange; font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700;"><strong>Status: ${status}</strong></span>`;
  } else if (capacity > 95) {
    status = 'Full';
    document.getElementById("status").innerHTML = `<span class="status" style="color: red; font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 700;"><strong>Status: ${status}</strong></span>`;
  }
}

// Function to update the historical chart
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(timestamp);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to calculate and update the estimated time until full
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    const deltaVolume = currentVolume - previousVolume;
    const deltaTime = currentTime - previousTimestamp;

    const flowRate = deltaVolume / deltaTime; // liters per second

    const remainingVolume = septicTankCapacity - currentVolume; // liters
    const estimatedTimeToFull = remainingVolume / flowRate; // seconds

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // convert seconds to hours
      document.getElementById("prediction").innerHTML = `<span class="time-until-full" style="font-family: 'Poppins', sans-serif; font-size: 20px; color: #4A4A4A;"><strong>Estimated Time Until Full: ${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = `<span class="rate-too-low" style="font-family: 'Poppins', sans-serif; font-size: 20px; color: #4A4A4A;"><strong>Flow rate is too low to estimate time.</strong></span>`;
    }
  }

  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

// Set up real-time listener from Firebase Realtime Database
const septicDataRef = ref(database, 'septicTankData');

// Listening for real-time data updates
onChildAdded(septicDataRef, (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;  // Get capacity percentage from Firebase
  const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();
  const currentVolume = capacity * septicTankCapacity / 100;  // Calculate current volume based on capacity

  // Update both the capacity chart and historical chart
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
  calculatePrediction(currentVolume, data.timestamp);  // Update prediction
});
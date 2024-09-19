// Import necessary Firebase functions and Chart.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, query, limitToLast, onChildAdded } from "firebase/database";
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

// Add CSS styles dynamically to the document
const styles = `
  .capacity-text {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 300;
  }

  .status-text {
    color: var(--text-color);
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 300;
  }

  .status {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 300;
  }

  .time-until-full, .rate-too-low {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--secondary-text);
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Variables for the prediction logic
let previousVolume = null;
let previousTimestamp = null;
const septicTankCapacity = 101.25; // Adjust according to your actual septic tank volume in liters

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

  document.getElementById("capacity").innerHTML = `
    <span class="capacity-text">Capacity: ${capacity}%</span>`;

  let status;
  if (capacity < 75) {
    status = 'Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: green;"><strong>${status}</strong></span>`;
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: yellow;"><strong>${status}</strong></span>`;
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: orange;"><strong>${status}</strong></span>`;
  } else if (capacity > 95) {
    status = 'Full';
    document.getElementById("status").innerHTML = `
      <span class="status-text">The Septic Tank is </span>
      <span class="status" style="color: red;"><strong>${status}</strong></span>`;
  }
}

// Function to update the historical chart
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(timestamp);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Function to calculate and update the estimated time until full
// Function to calculate the capacity percentage from sensor distance
function calculateCapacityPercentage(sensorDistance) {
  const tankHeight = 50; // cm
  const tankLength = 45; // cm
  const tankWidth = 45;  // cm
  const tankCapacity = (tankLength * tankWidth * tankHeight) / 1000; // in liters
  
  // Calculate the current water level
  const waterLevel = tankHeight - sensorDistance; // h = H - d (cm)
  
  // Calculate the current volume in liters
  const currentVolume = (tankLength * tankWidth * waterLevel) / 1000; // Vc in liters
  
  // Calculate capacity percentage
  const capacityPercentage = (currentVolume / tankCapacity) * 100;
  return capacityPercentage;
}

// Modify your existing `calculatePrediction` function
function calculatePrediction(sensorDistance, currentTime) {
  const tankHeight = 50; // cm
  const tankLength = 45; // cm
  const tankWidth = 45;  // cm
  const tankCapacity = (tankLength * tankWidth * tankHeight) / 1000; // in liters

  // Calculate the current capacity percentage from sensor distance
  const capacityPercentage = calculateCapacityPercentage(sensorDistance);

  // If using previous values (volume and time)
  if (previousVolume !== null && previousTimestamp !== null) {
    const deltaVolume = currentVolume - previousVolume;  // liters
    const deltaTime = currentTime - previousTimestamp;   // seconds
    
    const flowRate = deltaVolume / deltaTime;  // liters per second
    
    const remainingVolume = tankCapacity - currentVolume; // in liters
    const estimatedTimeToFull = remainingVolume / flowRate;  // seconds
    
    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2);  // convert to hours
      document.getElementById("prediction").innerHTML = 
        `<span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = 
        `<span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

// Set up real-time listener from Firebase Realtime Database
const septicDataRef = ref(database, 'septicTankData');
const limitedDataRef = query(septicDataRef, limitToLast(10)); // Fetch only the last 10 entries

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

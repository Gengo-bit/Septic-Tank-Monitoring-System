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

// CSS
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
const septicTankCapacity = 1000; // TENTATIVE PANI

// Capacity Chart
// Get theme colors dynamically
const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
    type: 'doughnut', // or 'bar', 'line', etc., depending on the desired type
    data: {
        labels: ['Used Capacity', 'Remaining Capacity'],
        datasets: [{
            data: [capacity, 100 - capacity], // Dynamically update this with real data
            backgroundColor: [accentColor, primaryColor], // Use theme colors
            borderColor: primaryColor,
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: textColor, // Adapt legend text color
                    font: {
                        family: 'Poppins',
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: primaryColor,
                bodyColor: textColor, // Adapt tooltip text color
                titleColor: textColor,
            }
        },
        layout: {
            padding: 20
        }
    }
});

// Historical Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
    type: 'line', // Historical data chart as a line chart
    data: {
        labels: historicalLabels, // Time labels from your data
        datasets: [{
            label: 'Capacity Over Time',
            data: historicalData, // Your historical capacity data
            borderColor: accentColor, // Match the theme's accent color
            backgroundColor: 'rgba(244, 197, 66, 0.2)', // Transparent accent color
            fill: true, // Filled under the line
            pointBackgroundColor: accentColor,
            pointBorderColor: primaryColor,
            pointHoverRadius: 6
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: textColor, // Adapt legend text color to the theme
                    font: {
                        family: 'Poppins',
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: primaryColor,
                bodyColor: textColor,
                titleColor: textColor,
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x', // Only zoom along the x-axis
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColor, // Adapt x-axis labels color
                },
                grid: {
                    display: false // Optionally hide grid lines for cleaner look
                }
            },
            y: {
                ticks: {
                    color: textColor, // Adapt y-axis labels color
                },
                grid: {
                    color: primaryColor // Adapt grid lines color
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        }
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
function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    const deltaVolume = currentVolume - previousVolume;
    const deltaTime = currentTime - previousTimestamp;

    const flowRate = deltaVolume / deltaTime; // liters per second

    const remainingVolume = septicTankCapacity - currentVolume; // liters
    const estimatedTimeToFull = remainingVolume / flowRate; // seconds

    if (flowRate > 0) {
      const hoursToFull = (estimatedTimeToFull / 3600).toFixed(2); // convert seconds to hours
      document.getElementById("prediction").innerHTML = `
        <span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull} hours</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = `
        <span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
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

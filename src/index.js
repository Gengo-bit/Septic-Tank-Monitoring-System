// Initialize Firebase
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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Capacity Chart Config
let capacityChart;
const capacityChartCtx = document.getElementById('capacityChart').getContext('2d');

function createCapacityChart() {
  capacityChart = new Chart(capacityChartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Available'],
      datasets: [{
        label: 'Septic Tank Capacity',
        data: [0, 100],
        backgroundColor: ['#36a2eb', '#d3d3d3'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

createCapacityChart();

// Update Capacity and Status
function updateCapacity(capacity) {
  let status;
  let color;

  if (capacity < 75) {
    status = 'Normal';
    color = '#36a2eb';
  } else if (capacity >= 75 && capacity <= 85) {
    status = 'Above Normal';
    color = '#ffce56';
  } else if (capacity >= 86 && capacity <= 95) {
    status = 'Critical';
    color = '#ffa500';
  } else if (capacity > 95) {
    status = 'Full';
    color = '#ff6384';
  }

  // Update capacity and status
  document.getElementById('capacity').textContent = `Capacity: ${capacity}%`;
  document.getElementById('status').textContent = `Status: ${status}`;
  document.getElementById('status').style.color = color;

  // Update chart data
  capacityChart.data.datasets[0].backgroundColor = [color, '#d3d3d3'];
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();
}

// Historical Chart Config
let historicalChart;
const historicalChartCtx = document.getElementById('historicalChart').getContext('2d');

function createHistoricalChart() {
  historicalChart = new Chart(historicalChartCtx, {
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
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute'
          }
        },
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

createHistoricalChart();

// Update Historical Chart
function updateHistoricalChart(capacity, timestamp) {
  historicalChart.data.labels.push(new Date(timestamp * 1000));
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

// Firebase Listener
db.ref('sensor_data').on('child_added', (snapshot) => {
  const data = snapshot.val();
  const capacity = data.capacity;
  const timestamp = data.timestamp;

  // Update both charts
  updateCapacity(capacity);
  updateHistoricalChart(capacity, timestamp);
});

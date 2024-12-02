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
const auth = firebase.auth();
const database = firebase.database();

let tankDimensions = {};
let septicTankCapacity; // C
let capacityChart, historicalChart;
let previousVolume = null;
let previousTimestamp = null;

auth.onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    if (userId === 'oAXEiv3HxfbNlRpH4i2o4mju0sJ2') {
      initializeApp(userId, 'septicTankData');
    } else if (userId === '2GVrMIaFSGeoC01g8zYuin2c5ej2') {
      initializeApp(userId, 'septicTankData'); 
    } else {
      console.log("Unknown user. No data available.");
    }
  } else {
    window.location.href = '../html/index.html';
  }
});

initializeCharts();

function initializeApp(userId, dataKey) {
  // Fetch tank dimensions from Realtime Database and update capacity
  database.ref(`users/${userId}/tankDimensions`).once('value').then((snapshot) => {
    if (snapshot.exists()) {
      tankDimensions = snapshot.val();
      septicTankCapacity = calculateSepticTankCapacity(tankDimensions); // C

      document.getElementById("tankHeight").innerText = tankDimensions.height;
      document.getElementById("tankLength").innerText = tankDimensions.length;
      document.getElementById("tankWidth").innerText = tankDimensions.width;
    } else {
      console.log("No tank dimensions found.");
    }
  }).catch((error) => {
    console.error("Error fetching tank dimensions: ", error);
  });

  // Real-time listener for data updates
  database.ref(`users/${userId}/${dataKey}`).orderByKey().limitToLast(10).on('value', (snapshot) => {
    handleSnapshot(snapshot);
  }, handleError);
}

function initializeCharts() {
  // Initialize capacity chart
  capacityChart = new Chart(document.getElementById('capacityChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Available'],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['#FF5A5F', '#82CFFF'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: (context) => context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A',
            font: { family: 'Poppins', size: 14 }
          }
        }
      }
    }
  });

  // Initialize historical chart with zoom features
  historicalChart = new Chart(document.getElementById('historicalChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Septic Tank Levels Over Time',
        data: [],
        borderColor: '#82CFFF',
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Time and Date' },
          ticks: { color: (context) => context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A' }
        },
        y: {
          title: { display: true, text: 'Septic Tank Capacity (%)' },
          ticks: { color: (context) => context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A' },
          min: 0,
          max: 100
        }
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1 // Control zoom sensitivity
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
            limits: {
              x: { min: 'original', max: 'original' } // Prevent zooming out beyond initial range
            }
          }
        }
      }
    }
  });
}

function calculateSepticTankCapacity(dimensions) {
  return (dimensions.length * dimensions.width * dimensions.height) / 1000; // C = LWH
}

function handleSnapshot(snapshot) {
  if (!snapshot.exists()) {
    console.log("No matching documents found!");
    return;
  }

  // Clear existing chart data
  capacityChart.data.datasets[0].data = [];
  historicalChart.data.labels = [];
  historicalChart.data.datasets[0].data = [];

  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const capacity = data.capacity;
    const currentVolume = (capacity / 100) * septicTankCapacity; // Vc = capacity% * C

    // Convert Unix timestamp to Date object
    const timestampDate = new Date(data.timestamp * 1000);

    // Format the date and time
    const formattedTime = timestampDate.toLocaleTimeString();
    const formattedDate = timestampDate.toLocaleDateString();

    // Update the charts
    updateCapacity(capacity);
    updateHistoricalChart(capacity, formattedDate, formattedTime);
    calculatePrediction(currentVolume, data.timestamp);
  });

  // Update the charts
  capacityChart.update();
  historicalChart.update();
}

function handleError(error) {
  console.error("Error fetching data: ", error);
}

function resetZoom() {
  historicalChart.resetZoom();
}

function updateCapacity(capacity) {
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `<span class="capacity-text">Capacity: ${capacity}%</span>`;

  const statusElement = document.getElementById("status");
  let status, color;

  if (capacity < 75) [status, color] = ['Normal', 'var(--status-green)'];
  else if (capacity <= 85) [status, color] = ['Above Normal', 'var(--status-yellow)'];
  else if (capacity <= 95) [status, color] = ['Critical', 'var(--status-orange)'];
  else [status, color] = ['Full', 'var(--status-red)'];  

  statusElement.innerHTML = `<span class="status-text">The Septic Tank is </span><span class="status" style="color: ${color};"><strong>${status}</strong></span>`;
}

function updateHistoricalChart(capacity, date, timestamp) {
  historicalChart.data.labels.push(`${date} ${timestamp}`);
  historicalChart.data.datasets[0].data.push(capacity);
  historicalChart.update();
}

function calculatePrediction(currentVolume, currentTime) {
  if (previousVolume !== null && previousTimestamp !== null) {
    const flowRate = (currentVolume - previousVolume) / (currentTime - previousTimestamp);
    const remainingVolume = septicTankCapacity - currentVolume;
    const estimatedTimeToFull = remainingVolume / flowRate; // in seconds

    if (flowRate > 0) {
      const totalHours = estimatedTimeToFull / 3600; // Convert seconds to hours
      const hours = Math.floor(totalHours); // Get the integer part of hours
      const minutes = Math.floor((totalHours - hours) * 60); // Convert the fractional part to minutes

      if (hours > 0) {
        document.getElementById("prediction").innerHTML = 
          `<span class="time-until-full">The Septic Tank will be full in <strong>${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}</strong></span>`;
      } else {
        document.getElementById("prediction").innerHTML = 
          `<span class="time-until-full">The Septic Tank will be full in <strong>${minutes} minute${minutes !== 1 ? 's' : ''}</strong></span>`;
      }
    } else {
      document.getElementById("prediction").innerHTML = `<span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  // Update previous volume and timestamp for the next calculation
  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

  // Authentication 
  auth.onAuthStateChanged((user) => {
    if (user) {
      // If user is authenticated, check the referrer
      const referrer = document.referrer;
      if (!referrer.includes('home.html')) {
        window.location.href = 'home.html';
      }
      // Event listener for Home button (redirects to home page)
      document.getElementById('homeButton').addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = 'home.html';
      });
    } else {
      // Redirect to index.html if not authenticated
      window.location.href = 'index.html';
    }
  });
  
  // Event listener for Logout button
  document.getElementById('Logout-btn').addEventListener('click', function() {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    }).catch((error) => {
      console.error('Logout Error: ', error);
    });
  });
  
  // Scroll function for sidebar links
  function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  }  
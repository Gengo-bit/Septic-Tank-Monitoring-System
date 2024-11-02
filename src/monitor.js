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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Tank dimensions and capacity calculation
let tankDimensions = { height: 35, length: 45, width: 45 };
let septicTankCapacity = calculateSepticTankCapacity(tankDimensions);

// Charts and prediction variables
let capacityChart, historicalChart;
let previousVolume = null;
let previousTimestamp = null;

// Authentication state check
auth.onAuthStateChanged((user) => {
  if (user) {
    const userEmail = user.email;
    if (userEmail === 'paulcorsino28@gmail.com') {
      initializeApp('users', 'paulcorsino28@gmail.com', 'septicTankData');
    } else if (userEmail === 'dcamorganda@gmail.com') {
      initializeApp('users', 'dcamorganda@gmail.com', 'septicTankData2');
    } else {
      console.log("Unknown user email. No data available.");
    }
  } else {
    window.location.href = '../html/index.html';
  }
});

// Initialize charts once
initializeCharts();

function initializeApp(userCollection, userEmail, collectionName) {
  // Fetch tank dimensions
  db.collection('tankDimensions').doc('dimensions').get().then((doc) => {
    if (doc.exists) {
      tankDimensions = doc.data();
      septicTankCapacity = calculateSepticTankCapacity(tankDimensions);
    }
  });

  // Real-time data update listener
  db.collection(userCollection).doc(userEmail).collection(collectionName)
    .orderBy('timestamp').limit(10)
    .onSnapshot(handleSnapshot, handleError);

  // Event listener for saving tank dimensions
  document.getElementById('save-settings').addEventListener('click', saveTankDimensions);
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
  return (dimensions.height * dimensions.length * dimensions.width) / 1000;
}

function handleSnapshot(snapshot) {
  if (snapshot.empty) {
    console.log("No matching documents found!");
    return;
  }

  // Clear the existing chart data before updating
  capacityChart.data.datasets[0].data = [];
  historicalChart.data.labels = [];
  historicalChart.data.datasets[0].data = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const capacity = data.capacity;
    const currentVolume = (capacity / 100) * septicTankCapacity;

    console.log("Data from Firestore: ", data); // Log data for debugging

    // Convert Unix timestamp (seconds) to a JavaScript Date object
    const timestampDate = new Date(data.timestamp * 1000); // Multiplying by 1000 to convert from seconds to milliseconds

    // Format the date and time to a readable format
    const formattedTime = timestampDate.toLocaleTimeString();  // For time (hours, minutes, seconds)
    const formattedDate = timestampDate.toLocaleDateString();  // For date (day, month, year)

    // Update chart and calculations
    updateCapacity(capacity);
    updateHistoricalChart(capacity, formattedDate, formattedTime);
    calculatePrediction(currentVolume, data.timestamp);  // Use the raw timestamp for calculations
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
    const estimatedTimeToFull = remainingVolume / flowRate;

    if (flowRate > 0) {
      const hoursToFull = estimatedTimeToFull / 3600;
      document.getElementById("prediction").innerHTML = hoursToFull >= 1 ?
        `<span class="time-until-full">The Septic Tank will be full in <strong>${hoursToFull.toFixed(2)} hours</strong></span>` :
        `<span class="time-until-full">The Septic Tank will be full in <strong>${(hoursToFull * 60).toFixed(0)} minutes</strong></span>`;
    } else {
      document.getElementById("prediction").innerHTML = `<span class="rate-too-low">Flow rate is too low to estimate time.</span>`;
    }
  }

  previousVolume = currentVolume;
  previousTimestamp = currentTime;
}

function saveTankDimensions() {
  const newDimensions = {
    height: parseFloat(document.getElementById('input-tankHeight').value),
    length: parseFloat(document.getElementById('input-tankLength').value),
    width: parseFloat(document.getElementById('input-tankWidth').value)
  };

  db.collection('tankDimensions').doc('dimensions').set(newDimensions)
    .then(() => {
      tankDimensions = newDimensions;
      septicTankCapacity = calculateSepticTankCapacity(tankDimensions);
      alert("Tank dimensions saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving dimensions: ", error);
    });
}


//auth
  // Authentication check
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
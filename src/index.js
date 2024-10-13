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
const database = firebase.database();

// Tank dimensions and capacity
let tankDimensions = { height: 35, length: 45, width: 45 };
let septicTankCapacity = (tankDimensions.height * tankDimensions.length * tankDimensions.width) / 1000;

// Charts
let capacityChart, historicalChart;

// Prediction variables
let previousVolume = null;
let previousTimestamp = null;

// Add a new authentication check without last page logic
auth.onAuthStateChanged((user) => {
  if (!user) {
      // User is not authenticated, redirect to login.html
      window.location.href = 'login.html';
  } else {
      // User is authenticated, proceed to initialize the app
      initializeApp();
  }
});

// Listen for page unload to save the last visited page
window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastPage', window.location.pathname);
});


function initializeApp() {
  // Fetch tank dimensions
  database.ref('tankDimensions').once('value', (snapshot) => {
    if (snapshot.exists()) {
      tankDimensions = snapshot.val();
      septicTankCapacity = (tankDimensions.height * tankDimensions.length * tankDimensions.width) / 1000;
    }
  });

  // Initialize charts
  initializeCharts();

  // Real-time update listener
  database.ref('septicTankData').limitToLast(10).on('child_added', (snapshot) => {
    const data = snapshot.val();
    const capacity = data.capacity;
    const currentVolume = (capacity / 100) * septicTankCapacity;

    updateCapacity(capacity);
    updateHistoricalChart(capacity, data.date, new Date(data.timestamp * 1000).toLocaleTimeString());
    calculatePrediction(currentVolume, data.timestamp);
  });

  // Event listener for saving tank dimensions
  document.getElementById('save-settings').addEventListener('click', saveTankDimensions);
}

function initializeCharts() {
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
      }
    }
  });
}

function updateCapacity(capacity) {
  capacityChart.data.datasets[0].data = [capacity, 100 - capacity];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `<span class="capacity-text">Capacity: ${capacity}%</span>`;

  const statusElement = document.getElementById("status");
  let status, color;

  if (capacity < 75) [status, color] = ['Normal', 'green'];
  else if (capacity <= 85) [status, color] = ['Above Normal', 'yellow'];
  else if (capacity <= 95) [status, color] = ['Critical', 'orange'];
  else [status, color] = ['Full', 'red'];

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

  database.ref('tankDimensions').set(newDimensions)
    .then(() => {
      tankDimensions = newDimensions;
      septicTankCapacity = (tankDimensions.height * tankDimensions.length * tankDimensions.width) / 1000;
      document.getElementById('settingsModal').style.display = 'none';
    })
    .catch((error) => console.error("Error saving dimensions: ", error));
}

function logout() {
  auth.signOut()
    .then(() => window.location.href = 'login.html')
    .catch((error) => console.error("Logout Error:", error));
}

function registerUser(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Registration successfulzW
      const user = userCredential.user;
      console.log("User registered successfully:", user);
      // You can redirect to the main page or show a success message
      window.location.href = 'index.html';
    })
    .catch((error) => {
      // Handle errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Registration error:", errorCode, errorMessage);
      // Display error message to the user
      document.getElementById('error-message').textContent = errorMessage;
    });
}


// Make logout function available globally
window.logout = logout;
window.registerUser = registerUser;
// Add styles
const styles = `
  .capacity-text, .status-text, .time-until-full, .rate-too-low {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    color: var(--text-color);
    font-weight: 300;
  }
  .status { font-size: 20px; }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
//This will ensure that after the user refreshes the page, they will be redirected to their last visited page, not index.html.
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
      const lastPage = localStorage.getItem('lastPage') || 'home.html';
      if (window.location.pathname !== lastPage) {
          window.location.href = lastPage;
      }
  } else {
      window.location.href = 'login.html';
  }
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastPage', window.location.pathname);
});

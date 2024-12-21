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

let Ci = null;
let Ti = null;
let capacityChart, historicalChart;

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

function fetchTankDimensions(userId) {
  database.ref(`users/${userId}/tankDimensions`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const dimensions = snapshot.val();
      document.getElementById('tankHeight').textContent = `${dimensions.tank_height} cm`;
      document.getElementById('tankLength').textContent = `${dimensions.tank_length} cm`;
      document.getElementById('tankWidth').textContent = `${dimensions.tank_width} cm`;
    } else {
      console.error('Tank dimensions not found.');
    }
  }).catch((error) => {
    console.error('Error fetching tank dimensions:', error);
  });
}

function initializeApp(userId, dataKey) {
  database.ref(`users/${userId}/${dataKey}`).orderByKey().limitToLast(10).on('value', (snapshot) => {
    handleSnapshot(snapshot);
  }, handleError);
  fetchTankDimensions(userId);
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
              speed: 0.1
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
            limits: {
              x: { min: 'original', max: 'original' }
            }
          }
        }
      }
    }
  });
}

function handleSnapshot(snapshot) {
  if (!snapshot.exists()) {
    console.log("No matching documents found!");
    return;
  }

  capacityChart.data.datasets[0].data = [];
  historicalChart.data.labels = [];
  historicalChart.data.datasets[0].data = [];

  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const Cc = data.capacity; 
    const Tc = data.timestamp;

    const timestampDate = new Date(Tc * 1000);
    const formattedTime = timestampDate.toLocaleTimeString();
    const formattedDate = timestampDate.toLocaleDateString();

    updateCapacity(Cc);
    updateHistoricalChart(Cc, formattedDate, formattedTime);
    calculatePrediction(Cc, Tc);
  });

  capacityChart.update();
  historicalChart.update();
}

function handleError(error) {
  console.error("Error fetching data: ", error);
}

function resetZoom() {
  historicalChart.resetZoom();
}

function updateCapacity(Cc) {
  capacityChart.data.datasets[0].data = [Cc, 100 - Cc];
  capacityChart.update();

  document.getElementById("capacity").innerHTML = `<span class="capacity-text">Capacity: ${Cc}%</span>`;

  const statusElement = document.getElementById("status");
  let status, color;

  if (Cc < 75) [status, color] = ['Normal', 'var(--status-green)'];
  else if (Cc <= 85) [status, color] = ['Above Normal', 'var(--status-yellow)'];
  else if (Cc <= 95) [status, color] = ['Critical', 'var(--status-orange)'];
  else [status, color] = ['Full', 'var(--status-red)'];

  statusElement.innerHTML = `<span class="status-text">The Septic Tank is </span><span class="status" style="color: ${color};"><strong>${status}</strong></span>`;
}

function updateHistoricalChart(Cc, date, Tc) {
  historicalChart.data.labels.push(`${date} ${Tc}`);
  historicalChart.data.datasets[0].data.push(Cc);
  historicalChart.update();
}

function calculatePrediction(Cc, Tc, Ci, Ti) {
  if (Ci !== null && Ti !== null) {
    const C = Cc - Ci; // Change in capacity
    const T = Tc - Ti; // Time difference

    const Q = C / T; // Flow rate
    const Cr = 100 - Cc; // Remaining capacity percentage
    const Tf = Cr / Q; // Estimated time until full

    if (Q > 0) {
      const Th = Tf;
      const days = Math.floor(Th / 86400); // 86400 seconds in a day
      const hours = Math.floor((Th % 86400) / 3600); // Remaining hours after extracting days
      const minutes = Math.floor((Th % 3600) / 60); // Remaining minutes after extracting hours

      let predictionText = `<span class="time-until-full">The Septic Tank will be full in `;

      const timeParts = [];
      if (days > 0) timeParts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours > 0) timeParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) timeParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

      predictionText += `<strong>${timeParts.join(' and ')}</strong></span>`;

      document.getElementById("prediction").innerHTML = predictionText;
    } else if (Q < 0) {
      document.getElementById("prediction").innerHTML = `<span class="negative-flow">Negative flow rate detected! The septic tank capacity is decreasing.</span>`;
    } else {
      document.getElementById("prediction").innerHTML = `<span class="rate-too-low">No flow rate detected! The septic tank will not fill under current conditions.</span>`;
    }
  }

  Ci = Cc;
  Ti = Tc;
}

// Authentication 
auth.onAuthStateChanged((user) => {
  if (user) {
    const referrer = document.referrer;
    if (!referrer.includes('home.html')) {
      window.location.href = 'home.html';
    }
    document.getElementById('homeButton').addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'home.html';
    });
  } else {
    window.location.href = 'index.html';
  }
});

document.getElementById('Logout-btn').addEventListener('click', function() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  }).catch((error) => {
    console.error('Logout Error: ', error);
  });
});

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}
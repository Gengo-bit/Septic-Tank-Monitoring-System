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
let capacityChart, historicalChart, distanceChart;

auth.onAuthStateChanged((user) => {
  if (user) {
    const userId = user.uid;
    const urlParams = new URLSearchParams(window.location.search);
    const tankNumber = urlParams.get('tank') || '1';  // Default to tank 1 if not specified
    
    // Construct the data key based on tank number
    const dataKey = tankNumber === '1' ? 'septicTankData' : `septicTankData${tankNumber}`;
    
    // Check if this tank exists for this user
    database.ref(`users/${userId}/${dataKey}`).once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          // Tank exists, initialize the app
          initializeApp(userId, dataKey);
          document.querySelector('.branding h1').textContent = `Septic Tank ${tankNumber}`;
        } else {
          // Tank doesn't exist for this user, redirect to tank 1
          console.log(`Tank ${tankNumber} not found for this user`);
          window.location.href = 'monitor.html?tank=1';
        }
      })
      .catch((error) => {
        console.error('Error checking tank access:', error);
        window.location.href = 'monitor.html?tank=1';
      });
  } else {
    window.location.href = '../index.html';
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
  // Get data for capacity readings
  database.ref(`users/${userId}/${dataKey}`).orderByKey().limitToLast(10).on('value', (snapshot) => {
    handleSnapshot(snapshot);
  }, handleError);

  // Add separate distance data listener
  const tankNumber = dataKey === 'septicTankData' ? '1' : dataKey.replace('septicTankData', '');
  const distanceKey = tankNumber === '1' ? 'distance' : `distance${tankNumber}`;
  
  database.ref(`users/${userId}/${distanceKey}`).limitToLast(10).on('value', (snapshot) => {
    if (snapshot.exists()) {
      distanceChart.data.labels = [];
      distanceChart.data.datasets[0].data = [];
      
      Object.entries(snapshot.val()).forEach(([timestamp, distance]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        distanceChart.data.labels.push(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
        distanceChart.data.datasets[0].data.push(distance);
      });
      distanceChart.update();
    }
  });

  // Make dimensions key dynamic
  const dimensionsKey = dataKey === 'septicTankData' ? 
    'tankDimensions' : 
    'tankDimensions' + dataKey.replace('septicTankData', '');
  
  // Fetch the appropriate tank dimensions
  database.ref(`users/${userId}/${dimensionsKey}`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const dimensions = snapshot.val();
      
      // Display current dimensions
      document.getElementById('tankHeight').textContent = `${dimensions.height}`;
      document.getElementById('tankLength').textContent = `${dimensions.length}`;
      document.getElementById('tankWidth').textContent = `${dimensions.width}`;
      document.getElementById('tankInlet').textContent = `${dimensions.full}`;

      // Set input values
      document.getElementById('heightInput').value = dimensions.height;
      document.getElementById('lengthInput').value = dimensions.length;
      document.getElementById('widthInput').value = dimensions.width;
      document.getElementById('inletInput').value = dimensions.full;

      // Add event listeners
      document.getElementById('editDimensions').addEventListener('click', () => {
        // Hide display paragraphs, show input fields
        document.querySelectorAll('#settingsForm p[id]').forEach(p => p.style.display = 'none');
        document.querySelectorAll('#settingsForm input').forEach(input => input.style.display = 'block');
        document.getElementById('editDimensions').style.display = 'none';
        document.getElementById('saveDimensions').style.display = 'block';
      });

      document.getElementById('saveDimensions').addEventListener('click', () => {
        const newDimensions = {
          height: parseFloat(document.getElementById('heightInput').value),
          length: parseFloat(document.getElementById('lengthInput').value),
          width: parseFloat(document.getElementById('widthInput').value),
          full: parseFloat(document.getElementById('inletInput').value)
        };

        // Update database
        database.ref(`users/${userId}/${dimensionsKey}`).update(newDimensions)
          .then(() => {
            console.log('Settings updated successfully');
            window.location.reload();
          })
          .catch((error) => {
            console.error('Error updating settings:', error);
          });
      });
    } else {
      console.error(`${dimensionsKey} not found.`);
    }
  });
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

  distanceChart = new Chart(document.getElementById('distanceChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Distance Over Time',
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
          title: { display: true, text: 'Distance (cm)' },
          ticks: { color: (context) => context.chart.canvas.style.backgroundColor === 'black' ? '#D1D1D1' : '#4A4A4A' }
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

  // Clear all chart data
  capacityChart.data.datasets[0].data = [];
  historicalChart.data.labels = [];
  historicalChart.data.datasets[0].data = [];
  distanceChart.data.labels = [];
  distanceChart.data.datasets[0].data = [];

  // Handle your existing capacity data as before
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

  // Get the correct distance data based on tank number
  const tankNumber = new URLSearchParams(window.location.search).get('tank') || '1';
  const distanceKey = tankNumber === '1' ? 'distance' : `distance${tankNumber}`;

  // Fetch distance data separately since it's at the same level as septicTankData
  database.ref(`users/${userId}/${distanceKey}`).once('value', (distanceSnapshot) => {
    if (distanceSnapshot.exists()) {
      const distanceData = distanceSnapshot.val();
      Object.entries(distanceData).forEach(([timestamp, distance]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        distanceChart.data.labels.push(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
        distanceChart.data.datasets[0].data.push(distance);
      });
      distanceChart.update();
    }
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
  // Update doughnut chart data
  capacityChart.data.datasets[0].data = [Cc, 100 - Cc];
  
  // Use direct color values for doughnut chart
  let fillColor;
  if (Cc < 75) {
    fillColor = '#4CAF50';
  } else if (Cc <= 85) {
    fillColor = '#FFD700';
  } else if (Cc <= 95) {
    fillColor = '#FFA500';
  } else {
    fillColor = '#FF5A5F';
  }
  
  // Update doughnut chart colors
  capacityChart.data.datasets[0].backgroundColor = [fillColor, '#36A2EB'];
  capacityChart.data.datasets[0].hoverBackgroundColor = [fillColor, '#36A2EB'];
  capacityChart.update();

  // Calculate adjusted water height for tank visualization
  const inletBottom = 15 + 8; // inlet starts at 15% + height of inlet (20px ≈ 8%)
  const maxHeight = 103 - inletBottom; // available height below inlet
  const adjustedHeight = (Cc * maxHeight) / 100;
  
  // Update water levels in chambers
  const chambers = document.querySelectorAll('.chamber .water');
  let waterColor;

  if (Cc < 75) {
    waterColor = '#82CFFF';
  } else if (Cc <= 85) {
    waterColor = '#FFD700';
  } else if (Cc <= 95) {
    waterColor = '#FFA500';
  } else {
    waterColor = '#FF5A5F';
  }

  chambers.forEach(water => {
    water.style.height = `${adjustedHeight}%`;
    water.style.background = `linear-gradient(to bottom, ${waterColor} 0%, ${adjustColor(waterColor, -20)} 100%)`;
  });

  // Keep your existing status update code
  document.getElementById("capacity").innerHTML = `<span class="capacity-text">Capacity: ${Cc}%</span>`;
  
  const statusElement = document.getElementById("status");
  let status, color;
  if (Cc < 75) [status, color] = ['Normal', 'var(--status-green)'];
  else if (Cc <= 85) [status, color] = ['Above Normal', 'var(--status-yellow)'];
  else if (Cc <= 95) [status, color] = ['Critical', 'var(--status-orange)'];
  else [status, color] = ['Full', 'var(--status-red)'];

  statusElement.innerHTML = `<span class="status-text">The Septic Tank is </span><span class="status" style="color: ${color};"><strong>${status}</strong></span>`;
}

// Helper function to adjust colors
function adjustColor(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function updateHistoricalChart(Cc, date, Tc) {
  historicalChart.data.labels.push(`${date} ${Tc}`);
  historicalChart.data.datasets[0].data.push(Cc);
  historicalChart.update();
}

function calculatePrediction(Cc, Tc) {
  if (Ti !== null && Ci !== null) {
    const C = Cc - Ci; // Change in capacity 
    const T = Tc - Ti; // Time difference

    const Q = C / T; // Flow rate 
    const Cr = 100 - Cc;  // Remaining capacity percentage 
    const Tf = Cr / Q; // Estimated time until full 

    if (Q > 0) {
      if (Tf < 60) {
        document.getElementById("prediction").innerHTML = `<span class="urgent-warning">The Septic Tank will be full in less than a minute!</span>`;
      } else {
        const Th = Tf;
        const days = Math.floor(Th / 86400);  // 86400 seconds in a day
        const hours = Math.floor((Th % 86400) / 3600);  // Remaining hours after extracting days
        const minutes = Math.floor((Th % 3600) / 60);   // Remaining minutes after extracting hours

        let predictionText = `<span class="time-until-full">The Septic Tank will be full in `;

        const timeParts = [];
        if (days > 0) timeParts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) timeParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) timeParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

        predictionText += `<strong>${timeParts.join(' and ')}</strong></span>`;

        document.getElementById("prediction").innerHTML = predictionText;
      }
    } else if (Q < 0) {
      document.getElementById("prediction").innerHTML = `<span class="negative-flow">Negative flow rate detected! The septic tank capacity is decreasing.</span>`;
    } else {
      document.getElementById("prediction").innerHTML = `<span class="rate-too-low">No flow rate detected! The septic tank will not fill under current conditions.</span>`;
    }
  }

  Ci = Cc;
  Ti = Tc;
}

// Go back to home.html if user did not click the Septic tank to monitor (typed the URL)
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('homeButton').addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '../home/home.html';
    });
  } else {
    window.location.href = '../index.html';
  }
});

document.getElementById('Logout-btn').addEventListener('click', function() {
  auth.signOut().then(() => {
    window.location.href = '../index.html';
  }).catch((error) => {
    console.error('Logout Error: ', error);
  });
});

function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Add reset zoom function for distance chart
function resetDistanceZoom() {
  distanceChart.resetZoom();
}
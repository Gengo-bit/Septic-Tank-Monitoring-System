// Chart.js Initialization for Capacity Chart
const ctx = document.getElementById('capacityChart').getContext('2d');
const capacityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Used', 'Available'],
        datasets: [{
            label: 'Septic Tank Capacity',
            data: [0, 100],  // Initial data
            backgroundColor: ['#ff6384', '#36a2eb'],
            borderWidth: 1 // testing
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Chart.js Initialization for Historical Data Chart
const historicalCtx = document.getElementById('historicalChart').getContext('2d');
const historicalChart = new Chart(historicalCtx, {
    type: 'line',
    data: {
        labels: [],  // Timestamps
        datasets: [{
            label: 'Septic Tank Levels',
            data: [],  // Level percentages
            borderColor: '#42a5f5',
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Fetch real-time data from Firebase
db.collection("septicTankData").onSnapshot(snapshot => {
    snapshot.forEach(doc => {
        const data = doc.data();
        const currentCapacity = data.capacity;
        const timestamp = data.timestamp;

        // Update Capacity Chart
        capacityChart.data.datasets[0].data[0] = currentCapacity;
        capacityChart.data.datasets[0].data[1] = 100 - currentCapacity;
        capacityChart.update();

        // Update Historical Chart
        historicalChart.data.labels.push(timestamp);
        historicalChart.data.datasets[0].data.push(currentCapacity);
        historicalChart.update();
        
        // Update displayed capacity
        document.getElementById("capacity").textContent = `${currentCapacity}%`;
    });
});

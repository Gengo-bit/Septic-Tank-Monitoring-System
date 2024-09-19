const themeSwitch = document.getElementById("theme-switch");
const body = document.body;

themeSwitch.addEventListener("click", () => {
  body.classList.toggle("darkmode");
  updateIcons();
  updateChartColors(capacityChart);  // Update capacity chart colors on mode toggle
  updateChartColors(historicalChart); // Update historical chart colors on mode toggle
});

function updateIcons() {
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  
  if (body.classList.contains("darkmode")) {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}

function updateChartColors(chart) {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();

  // Update chart colors
  chart.options.plugins.legend.labels.color = textColor;
  chart.options.plugins.tooltip.titleColor = textColor;
  chart.options.plugins.tooltip.bodyColor = textColor;
  chart.options.plugins.tooltip.backgroundColor = primaryColor;

  chart.data.datasets.forEach(dataset => {
      dataset.borderColor = accentColor;
      dataset.backgroundColor = 'rgba(244, 197, 66, 0.2)'; // Modify for different datasets as needed
  });

  chart.update(); // Apply changes
}

updateIcons();  // Initialize the correct icon on page load
const themeSwitch = document.getElementById("theme-switch");
const body = document.body;
const root = document.documentElement;  // Add this to get the root element

themeSwitch.addEventListener("click", () => {
  body.classList.toggle("darkmode");
  updateIcons();  // Update sun/moon icon when switching theme
  updateChartColors(capacityChart);  // Update chart colors when theme changes
  updateChartColors(historicalChart);
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
  // Get the updated CSS variables from the root element
  const textColor = getComputedStyle(root).getPropertyValue('--text-color').trim();
  const secondaryTextColor = getComputedStyle(root).getPropertyValue('--secondary-text').trim();
  
  // Update chart options with the correct color variables
  chart.options.scales.x.ticks.color = textColor;
  chart.options.scales.y.ticks.color = textColor;
  chart.data.datasets.forEach(dataset => {
    dataset.backgroundColor = textColor; // Update chart colors
    dataset.borderColor = secondaryTextColor;
  });
  
  chart.update();
}

updateIcons();  // Initialize the correct icon on page load
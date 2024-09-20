const themeSwitch = document.getElementById("theme-switch");
const body = document.body;

themeSwitch.addEventListener("click", () => {
  body.classList.toggle("darkmode");
  updateIcons();
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
  // Get the updated CSS variables
  const textColor = getComputedStyle(root).getPropertyValue('--text-color').trim();
  const secondaryTextColor = getComputedStyle(root).getPropertyValue('--secondary-text').trim();
  
  // Update chart options
  chart.options.scales.x.ticks.color = textColor;
  chart.options.scales.y.ticks.color = textColor;
  chart.data.datasets.forEach(dataset => {
    dataset.backgroundColor = textColor;
    dataset.borderColor = secondaryTextColor;
  });
  
  // Re-render the chart
  chart.update();
}
updateIcons();  // Initialize the correct icon on page load
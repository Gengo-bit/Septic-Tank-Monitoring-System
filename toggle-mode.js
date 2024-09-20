const themeSwitch = document.getElementById("theme-switch");
const body = document.body;

themeSwitch.addEventListener("click", () => {
  body.classList.toggle("darkmode");
  updateIcons();
  updateChartColors();  // Call this function to update chart colors
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

updateIcons();  // Initialize the correct icon on page load
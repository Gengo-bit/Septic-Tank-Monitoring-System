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

document.getElementById('theme-switch').addEventListener('click', function() {
  document.body.classList.toggle('darkmode');
  const currentMode = document.body.classList.contains('darkmode') ? 'darkmode' : 'light-mode';

  // Ensure chart colors update when the theme is toggled
  updateChartColors(currentMode);
});


updateIcons();  // Initialize the correct icon on page load
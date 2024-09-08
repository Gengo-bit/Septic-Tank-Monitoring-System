const modeToggleButton = document.getElementById('modeToggle');
const body = document.body;
const modeIcon = document.getElementById('modeIcon');

// Check for saved mode in localStorage
const savedMode = localStorage.getItem('mode');
if (savedMode) {
  body.className = savedMode;
  updateIcon(savedMode);
}

// Toggle between light and dark mode
modeToggleButton.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('mode', 'dark-mode');
    updateIcon('dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('mode', 'light-mode');
    updateIcon('light-mode');
  }
});

// Update the icon based on mode
function updateIcon(mode) {
  if (mode === 'light-mode') {
    modeIcon.src = 'moon-icon.png';
    modeIcon.alt = 'Switch to Dark Mode';
  } else {
    modeIcon.src = 'sun-icon.png';
    modeIcon.alt = 'Switch to Light Mode';
  }
}

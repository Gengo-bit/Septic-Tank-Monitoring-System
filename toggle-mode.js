const modeToggleButton = document.getElementById('darkmode-toggle');
const body = document.body;

// Check for saved mode in localStorage
const savedMode = localStorage.getItem('mode');
if (savedMode) {
  body.classList.add(savedMode);
}

// Toggle between light and dark mode
modeToggleButton.addEventListener('change', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('mode', 'dark-mode');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('mode', 'light-mode');
  }
});

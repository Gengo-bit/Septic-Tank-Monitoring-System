const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

themeSwitch.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    themeSwitch.textContent = '🌙';
  } else {
    themeSwitch.textContent = '☀️';
  }
});

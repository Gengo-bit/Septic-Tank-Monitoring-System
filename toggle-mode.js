let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
};

// Check saved mode on page load
if (darkmode === "active") {
    enableDarkmode();
}

// Toggle the mode when the button is clicked
themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

webpack.config.js:
const path = require('path');

module.exports = {
  entry: './src/index.js',  // Your main JavaScript file
  output: {
    filename: 'bundle.js',  // Output file name
    path: path.resolve(__dirname, 'dist'),  // Output directory
  },
  mode: 'development',  // Change to 'production' for final deployment
};
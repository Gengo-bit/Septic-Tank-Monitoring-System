// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('close-btn');
const thresholdBtn = document.getElementById('threshold-btn');
const thresholdModal = document.getElementById('thresholdModal');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settingsModal');
const modalClose = document.querySelector('.modal .close');
const settingsModalClose = document.querySelector('.close-settings');

// Sidebar open/close functionality
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-open');
    sidebarToggle.style.opacity = '0';  // Hide the hamburger icon when sidebar is open
});

closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('sidebar-open');
    sidebarToggle.style.opacity = '1';  // Show the hamburger icon when sidebar is closed
});

// Ensure modals are not shown on page load or refresh
window.addEventListener('DOMContentLoaded', () => {
    settingsModal.style.display = 'none';
    thresholdModal.style.display = 'none';
});

// Show Threshold Modal on button click
thresholdBtn.addEventListener('click', () => {
    thresholdModal.style.display = 'flex';  // Show the threshold modal
});

// Close the threshold modal when the close button is clicked
modalClose.addEventListener('click', () => {
    thresholdModal.style.display = 'none';  // Hide the modal
});

// Close the threshold modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === thresholdModal) {
        thresholdModal.style.display = 'none';  // Hide the modal
    }
});

// Show/Hide Settings Modal
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';  // Show the settings modal
});

settingsModalClose.addEventListener('click', () => {
    settingsModal.style.display = 'none';  // Hide the settings modal
});

// Close the settings modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';  // Hide the settings modal
    }
});

// Light/Dark Mode toggle with smooth rotation
const themeSwitchSidebar = document.getElementById('theme-switch-sidebar');
themeSwitchSidebar.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    updateIcons();
});

// Handle Sun/Moon icon transitions
function updateIcons() {
    const sunIcon = document.getElementById('sidebar-sun-icon');
    const moonIcon = document.getElementById('sidebar-moon-icon');

    if (document.body.classList.contains('darkmode')) {
        sunIcon.style.transform = 'rotate(360deg)';
        moonIcon.style.transform = 'rotate(360deg)';
    } else {
        sunIcon.style.transform = 'rotate(-360deg)';
        moonIcon.style.transform = 'rotate(-360deg)';
    }
}
// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('close-btn');
const thresholdBtn = document.getElementById('threshold-btn');
const thresholdModal = document.getElementById('thresholdModal');
const modalClose = document.querySelector('.modal .close');

// Sidebar open/close functionality
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-open');
});

closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('sidebar-open');
});

// Show Threshold Modal on button click
thresholdBtn.addEventListener('click', () => {
    thresholdModal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
    thresholdModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === thresholdModal) {
        thresholdModal.style.display = 'none';
    }
});

// Light/Dark Mode toggle with animation
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
        moonIcon.style.transform = 'rotate(0deg)';
    } else {
        sunIcon.style.transform = 'rotate(-360deg)';
        moonIcon.style.transform = 'rotate(0deg)';
    }
}

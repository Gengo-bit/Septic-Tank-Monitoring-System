// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const closeBtn = document.getElementById('close-btn');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-open');
});

closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('sidebar-open');
});
const menuItems = document.querySelectorAll('.menu-items li');

document.querySelector('#menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('minimized');
    menuItems.forEach((item) => {
        const text = item.textContent.trim();
        item.setAttribute('data-letter', text.charAt(0)); // Set the first letter for minimized mode
    });
});
// Modal for Thresholds
const thresholdBtn = document.getElementById('threshold-btn');
const thresholdModal = document.getElementById('thresholdModal');
const modalClose = document.querySelector('.modal .close');

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

// Light/Dark Mode switch in sidebar
const themeSwitchSidebar = document.getElementById('theme-switch-sidebar');
themeSwitchSidebar.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    updateIcons();
});
document.addEventListener("DOMContentLoaded", () => {
    
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('close-btn');
    const thresholdBtn = document.getElementById('threshold-btn');
    const thresholdModal = document.getElementById('thresholdModal');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settingsModal');
    const modalClose = document.querySelector('.modal .close');
    const settingsModalClose = document.querySelector('.close-settings');

    // Sidebar open/close
    if (sidebarToggle && sidebar && closeBtn) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
            sidebarToggle.style.opacity = '0';  // Hide hamburger when sidebar is open
        });

        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            sidebarToggle.style.opacity = '1';  // Show hamburger when sidebar is closed
        });
    }

    // Ensure modals are not shown on page load or refresh
    if (settingsModal && thresholdModal) {
        settingsModal.style.display = 'none';
        thresholdModal.style.display = 'none';
    }

    // Function to show modal with animation
    function showModal(modal) {
        modal.style.display = 'flex';  // Make the modal visible
        setTimeout(() => {
            modal.classList.add('show');  // Add the 'show' class for fade-in and scale-up
        }, 10);  // Slight delay to allow display change to apply before transition
    }

    // Function to hide modal with animation
    function hideModal(modal) {
        modal.classList.remove('show');  // Remove the 'show' class for fade-out and scale-down
        setTimeout(() => {
            modal.style.display = 'none';  // Fully hide the modal after the animation
        }, 300);  // Match the CSS transition duration (300ms)
    }

    // Show Threshold Modal on button click
    if (thresholdBtn && thresholdModal) {
        thresholdBtn.addEventListener('click', () => showModal(thresholdModal));
    }

    // Close the threshold modal when the close button is clicked
    if (modalClose && thresholdModal) {
        modalClose.addEventListener('click', () => hideModal(thresholdModal));
    }

    // Close the threshold modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === thresholdModal) {
            hideModal(thresholdModal);
        }
    });

    // Show/Hide Settings Modal
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => showModal(settingsModal));
    }

    if (settingsModalClose && settingsModal) {
        settingsModalClose.addEventListener('click', () => hideModal(settingsModal));
    }

    // Close the settings modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            hideModal(settingsModal);
        }
    });

    // Light/Dark Mode toggle with smooth rotation
    const themeSwitchSidebar = document.getElementById('theme-switch-sidebar');
    const sunIcon = document.getElementById('sidebar-sun-icon');
    const moonIcon = document.getElementById('sidebar-moon-icon');

    if (themeSwitchSidebar) {
        themeSwitchSidebar.addEventListener('click', () => {
            document.body.classList.toggle('darkmode');
            updateIcons();
        });
    } else {
        console.error("Theme switch button not found.");
    }

    // Handle Sun/Moon icon transitions
    function updateIcons() {
        if (!sunIcon || !moonIcon) {
            console.error("Sun or moon icon not found.");
            return;
        }

        if (document.body.classList.contains('darkmode')) {
            sunIcon.style.transform = 'rotate(360deg)';
            moonIcon.style.transform = 'rotate(360deg)';
            sunIcon.style.opacity = '0';
            moonIcon.style.opacity = '1';
        } else {
            sunIcon.style.transform = 'rotate(-360deg)';
            moonIcon.style.transform = 'rotate(-360deg)';
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0';
        }
    }
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

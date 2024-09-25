const themeSwitch = document.getElementById("theme-switch");
const body = document.body;
const modal = document.getElementById("thresholds-modal");
const thresholdsButton = document.getElementById("thresholds-button");
const closeModalButton = document.getElementById("close-modal");

themeSwitch.addEventListener("click", () => {
    body.classList.toggle("darkmode");
    updateIcons();
});

thresholdsButton.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
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
document.querySelector("#threshold-button").addEventListener("click", function() {
    const modal = document.querySelector("#threshold-modal");
    modal.style.display = "block"; // Ensure it's visible
});

document.querySelector(".modal-close").addEventListener("click", function() {
    const modal = document.querySelector("#threshold-modal");
    modal.style.display = "none"; // Hides the modal on close
});
updateIcons();  // Initialize the correct icon on page load
const firebaseConfig = {
    apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
    authDomain: "septic-tank-capacity.firebaseapp.com",
    projectId: "septic-tank-capacity",
    appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  // Handle login
  document.addEventListener('DOMContentLoaded', () => {
      const loginForm = document.getElementById('login-modal');
      const errorMessage = document.getElementById('error-message');
  
      loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
  
          firebase.auth().signInWithEmailAndPassword(email, password)
              .then((userCredential) => {
                  // Redirect to home page after successful login
                  window.location.href = '../html/home.html';
              })
              .catch((error) => {
                // Map Firebase error codes to custom messages
                switch (error.code) {
                    default:
                        errorMessage.textContent = 'Error! Invalid credentials. Please try again.';
                }
            });            
      });
  });  

   // Modal Functionality
   const loginToggleBtn = document.getElementById('login-toggle-btn');
   const loginModal = document.getElementById('login-modal');
   const closeModal = document.querySelector('.close');

   function showModal(modal) {
       modal.style.display = 'flex';
       setTimeout(() => {
           modal.classList.add('show');
       }, 10);
   }

   function hideModal(modal) {
       modal.classList.remove('show');
       setTimeout(() => {
           modal.style.display = 'none';
       }, 300);
   }

   loginToggleBtn.addEventListener('click', () => {
       showModal(loginModal);
   });

   closeModal.addEventListener('click', () => {
       hideModal(loginModal);
   });

   window.addEventListener('click', (event) => {
       if (event.target === loginModal) {
           hideModal(loginModal);
       }
   });
   
// JavaScript for Smooth Scrolling 
// Select all sections with the "full-screen" class
const sections = document.querySelectorAll('.full-screen, .benefit-item, .product-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            entry.target.classList.remove('active');
        }
    });
}, { threshold: 0.5 }); // Trigger when 50% of the section is visible

sections.forEach(section => observer.observe(section));

// Observe each section
sections.forEach((section) => {
    observer.observe(section);
});

// Smooth scroll when clicking internal links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth',
        });
    });
});
document.querySelectorAll('a.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        targetElement.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

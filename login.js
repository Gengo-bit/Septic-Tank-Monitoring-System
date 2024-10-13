// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyCgrcyyM547ICJc6fzbunqWSV64pKlRfZA",
    authDomain: "septic-tank-capacity.firebaseapp.com",
    projectId: "septic-tank-capacity",
    appId: "1:445055846573:web:166f5bcc5e6b8d40e6de24"
  };
  
  firebase.initializeApp(firebaseConfig);
  
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
                  window.location.href = 'home.html';
              })
              .catch((error) => {
                  // Handle errors
                  errorMessage.textContent = error.message;
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
    const sections = document.querySelectorAll('.full-screen');

    // Use IntersectionObserver to detect when each section is in view
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Add 'active' class when section is in view for smooth transitions
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        },
        {
            threshold: 0.4, // Trigger when 50% of the section is visible
        }
    );

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

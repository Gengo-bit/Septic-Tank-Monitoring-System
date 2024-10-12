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
      const sections = document.querySelectorAll('.full-screen');
      let isScrolling = false;

      function smoothScroll() {
          if (!isScrolling) {
              window.scrollTo({
                  top: window.innerHeight * [...sections].indexOf(this),
                  behavior: 'smooth'
              });
          }
      }

      window.addEventListener('scroll', () => {
          if (!isScrolling) {
              isScrolling = true;
              setTimeout(() => {
                  isScrolling = false;
              }, 1000);
          }
      });

      sections.forEach((section) => {
          section.addEventListener('click', smoothScroll);
      });
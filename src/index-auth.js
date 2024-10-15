// Authentication check and app initialization
auth.onAuthStateChanged((user) => {
    if (user) initializeApp();
    else window.location.href = '../html/index.html';
  });
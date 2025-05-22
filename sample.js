window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const navBar = document.querySelector('nav');
    const homeSection = document.querySelector('.home');

    if (loadingScreen && mainContent && navBar && homeSection) {
      // Show loading screen on index.html once per browser session (sessionStorage)
      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath.endsWith('index.html')) {
        if (!sessionStorage.getItem('loadingScreenShown')) {
          navBar.style.display = 'none';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.style.display = 'block';
            navBar.style.display = 'flex';
            homeSection.style.display = 'none';
            sessionStorage.setItem('loadingScreenShown', 'true');
          }, 3000);
        } else {
          loadingScreen.style.display = 'none';
          mainContent.style.display = 'block';
          navBar.style.display = 'flex';
          homeSection.style.display = 'none';
        }
      } else {
        // On other pages, do not show loading screen
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
        navBar.style.display = 'flex';
        homeSection.style.display = 'none';
      }
    }
  });

// Recipe search and display logic removed from sample.js to avoid conflicts with recipesDisplay.js

// Dropdown functionality
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');
if (dropdown && dropdownContent) {
    dropdown.addEventListener('mouseenter', function() {
        dropdownContent.classList.remove('hidden');
    });

    dropdown.addEventListener('mouseleave', function() {
        dropdownContent.classList.add('hidden');
    });
}

// Modal functionality
const modal = document.getElementById('modal-wrapper');
if (modal) {
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }};
}

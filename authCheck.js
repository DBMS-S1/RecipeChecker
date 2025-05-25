document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const loggedIn = localStorage.getItem('loggedIn');
  console.log('LoggedIn status:', loggedIn);

  // Function to toggle login/signup buttons visibility
  function toggleLoginButtons() {
    const loginButton = document.getElementById('openLogin');
    const signupButton = document.getElementById('openSignup');
    if (loggedIn === 'true') {
      if (loginButton) loginButton.style.display = 'none';
      if (signupButton) signupButton.style.display = 'none';
    } else {
      if (loginButton) loginButton.style.display = 'inline-block';
      if (signupButton) signupButton.style.display = 'inline-block';
    }
  }

  toggleLoginButtons();
});
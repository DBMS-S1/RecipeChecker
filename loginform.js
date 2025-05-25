
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const home = document.querySelector('.home');
  const formContainer = document.querySelector('.form_container');
  const formCloseBtn = document.querySelector('.form_close');
  const signupBtn = document.querySelector('#signup');
  const loginBtn = document.querySelector('#login');
  const openLoginBtn = document.getElementById('openLogin');
  const openSignupBtn = document.getElementById('openSignup');
  const logoutBtn = document.getElementById('logoutBtn');
  const pwShowHideIcons = document.querySelectorAll('.pw_hide');

  // Elements for profile avatar and username in nav bar
  const profileInfo = document.getElementById('profile-info');
  const navAvatarImg = document.getElementById('nav-avatar-img');
  const navUsernameDisplay = document.getElementById('nav-username-display');

  // Function to toggle password visibility
  function togglePasswordIcon(icon) {
    const input = icon.parentElement.querySelector('input');
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('uil-eye-slash', 'uil-eye');
    } else {
      input.type = 'password';
      icon.classList.replace('uil-eye', 'uil-eye-slash');
    }
  }

  // Accessible keyboard toggle (Enter/Space key)
  pwShowHideIcons.forEach(icon => {
    icon.addEventListener('click', () => togglePasswordIcon(icon));
    icon.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePasswordIcon(icon);
      }
    });
  });

  // Focus management helper
  function setFocusToFirstInput(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    const firstInput = form.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstInput) firstInput.focus();
  }

  // Show error message helper
  function showError(input, message) {
    let errorElem = input.parentElement.querySelector('.error-message');
    if (!errorElem) {
      errorElem = document.createElement('div');
      errorElem.className = 'error-message';
      errorElem.style.color = 'var(--error-color)';
      errorElem.style.fontSize = '12px';
      errorElem.style.marginTop = '4px';
      input.parentElement.appendChild(errorElem);
    }
    errorElem.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  // Clear error message helper
  function clearError(input) {
    const errorElem = input.parentElement.querySelector('.error-message');
    if (errorElem) {
      errorElem.textContent = '';
    }
    input.removeAttribute('aria-invalid');
  }

  // Validate email format
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password strength (min 8 chars, at least one letter and one number)
  function isStrongPassword(password) {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
  }

  // Function to toggle login/signup/logout buttons visibility and profile info
  function toggleAuthButtons() {
    if (localStorage.getItem('loggedIn') === 'true') {
      if (openLoginBtn) openLoginBtn.style.display = 'none';
      if (openSignupBtn) openSignupBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      const profileBtn = document.getElementById('profileBtn');
      if (profileBtn) profileBtn.style.display = 'inline-block';

      // Show profile info with avatar and username
      if (profileInfo) profileInfo.style.display = 'flex';
      if (navAvatarImg) {
        const avatar = localStorage.getItem('avatar') || 'Pictures/dex.png';
        navAvatarImg.src = avatar;
      }
      if (navUsernameDisplay) {
        const username = localStorage.getItem('username') || 'User';
        navUsernameDisplay.textContent = username;
      }
    } else {
      if (openLoginBtn) openLoginBtn.style.display = 'inline-block';
      if (openSignupBtn) openSignupBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      const profileBtn = document.getElementById('profileBtn');
      if (profileBtn) profileBtn.style.display = 'none';

      // Hide profile info
      if (profileInfo) profileInfo.style.display = 'none';
      if (navAvatarImg) navAvatarImg.src = '';
      if (navUsernameDisplay) navUsernameDisplay.textContent = '';
    }
  }

  // Call toggleAuthButtons on page load
  toggleAuthButtons();

  // Logout button event listener
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('avatar');
      toggleAuthButtons();
      window.location.href = 'index.html';
    });
  }

  // Open Signup form from header button
  if (openSignupBtn) {
    openSignupBtn.addEventListener('click', e => {
      e.preventDefault();
      home.style.display = 'flex';
      formContainer.classList.add('active');
      document.querySelector('.login_form').setAttribute('aria-hidden', 'true');
      document.querySelector('.signup_form').setAttribute('aria-hidden', 'false');
      setFocusToFirstInput('.signup_form');
    });
  }

  // Open Login form from header button
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', e => {
      e.preventDefault();
      home.style.display = 'flex';
      formContainer.classList.remove('active');
      document.querySelector('.login_form').setAttribute('aria-hidden', 'false');
      document.querySelector('.signup_form').setAttribute('aria-hidden', 'true');
      setFocusToFirstInput('.login_form');
    });
  }

  // Open Signup form from inside modal
  if (signupBtn) {
    signupBtn.addEventListener('click', e => {
      e.preventDefault();
      formContainer.classList.add('active');
      document.querySelector('.login_form').setAttribute('aria-hidden', 'true');
      document.querySelector('.signup_form').setAttribute('aria-hidden', 'false');
      setFocusToFirstInput('.signup_form');
    });
  }

  // Open Login form from inside modal
  if (loginBtn) {
    loginBtn.addEventListener('click', e => {
      e.preventDefault();
      formContainer.classList.remove('active');
      document.querySelector('.login_form').setAttribute('aria-hidden', 'false');
      document.querySelector('.signup_form').setAttribute('aria-hidden', 'true');
      setFocusToFirstInput('.login_form');
    });
  }

  // Close form when close button clicked
  if (formCloseBtn) {
    formCloseBtn.addEventListener('click', () => {
      home.style.display = 'none';
      if (document.activeElement === formCloseBtn) {
        openLoginBtn.focus();
      }
    });
  }

  // Optional: Close form on Escape key press
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && home.style.display !== 'none') {
      home.style.display = 'none';
      openLoginBtn.focus();
    }
  });

  // Signup form validation and submission
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const usernameInput = document.getElementById('signup_username');
      const emailInput = document.getElementById('signup_email');
      const passwordInput = document.getElementById('signup_password');
      const confirmPasswordInput = document.getElementById('confirm_password');

      let valid = true;

      // Clear previous errors
      clearError(usernameInput);
      clearError(emailInput);
      clearError(passwordInput);
      clearError(confirmPasswordInput);

      // Validate username presence
      if (usernameInput.value.trim() === '') {
        showError(usernameInput, 'Please enter a username.');
        valid = false;
      }

      // Validate email
      if (!isValidEmail(emailInput.value.trim())) {
        showError(emailInput, 'Please enter a valid email address.');
        valid = false;
      }

      // Validate password strength
      if (!isStrongPassword(passwordInput.value.trim())) {
        showError(passwordInput, 'Password must be at least 8 characters long and include at least one letter and one number.');
        valid = false;
      }

      // Validate password confirmation
      if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
        showError(confirmPasswordInput, 'Passwords do not match.');
        valid = false;
      }

      if (valid) {
        // Send signup data to backend API
        const submitBtn = passwordInput.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing up...';

        fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
          })
        })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          if (data.message === 'User created successfully.') {
            home.style.display = 'none';
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up Now';
        })
        .catch(error => {
          alert('Error: ' + error.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up Now';
        });
      }
    });
  }

  // Login form validation and submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const identifierInput = document.getElementById('login_identifier');
      const passwordInput = document.getElementById('login_password');

      let valid = true;

      // Clear previous errors
      clearError(identifierInput);
      clearError(passwordInput);

      // Validate identifier presence
      if (identifierInput.value.trim() === '') {
        showError(identifierInput, 'Please enter your username or email.');
        valid = false;
      }

      // Validate password presence
      if (passwordInput.value.trim() === '') {
        showError(passwordInput, 'Please enter your password.');
        valid = false;
      }

      if (valid) {
        // Send login data to backend API
        const submitBtn = passwordInput.form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: identifierInput.value.trim(),
            password: passwordInput.value.trim()
          })
        })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          if (data.message === 'Login successful.') {
            home.style.display = 'none';
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', identifierInput.value.trim());
            // Optionally, fetch avatar URL from backend here and store in localStorage
            toggleAuthButtons();
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login Now';
        })
        .catch(error => {
          alert('Error: ' + error.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login Now';
        });
      }
    });
  }
});

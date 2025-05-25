document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const usernameDisplay = document.getElementById('username-display');
  const avatarImg = document.getElementById('avatar-img');
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarUpload = document.getElementById('avatar-upload');
  const logoutBtn = document.getElementById('logoutBtn');

  const updateProfileForm = document.getElementById('updateProfileForm');
  const updateUsernameInput = document.getElementById('update-username');
  const updateEmailInput = document.getElementById('update-email');
  const updatePasswordInput = document.getElementById('update-password');
  const updateConfirmPasswordInput = document.getElementById('update-confirm-password');

  async function loadProfile() {
    const username = localStorage.getItem('username') || 'User';
    usernameDisplay.textContent = username;

    try {
      const response = await fetch(`http://localhost:5000/api/user-profile?username=${encodeURIComponent(username)}`);
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        if (user) {
          avatarImg.src = user.avatar || 'Pictures/dex.png';
          profileAvatar.src = user.avatar || 'Pictures/dex.png';
          updateUsernameInput.value = user.username || username;
          updateEmailInput.value = user.email || '';
          localStorage.setItem('avatar', user.avatar || 'Pictures/dex.png');
        } else {
          // Fallback if user data missing
          avatarImg.src = 'Pictures/dex.png';
          profileAvatar.src = 'Pictures/dex.png';
          updateUsernameInput.value = username;
          updateEmailInput.value = '';
        }
      } else {
        // Fallback if fetch failed
        avatarImg.src = 'Pictures/dex.png';
        profileAvatar.src = 'Pictures/dex.png';
        updateUsernameInput.value = username;
        updateEmailInput.value = '';
      }
    } catch (error) {
      // Fallback if error
      avatarImg.src = 'Pictures/dex.png';
      profileAvatar.src = 'Pictures/dex.png';
      updateUsernameInput.value = username;
      updateEmailInput.value = '';
    }
  }

  avatarUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        avatarUpload.value = '';
        return;
      }
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG, JPEG, and WEBP files are allowed.');
        avatarUpload.value = '';
        return;
      }

      const username = localStorage.getItem('username');
      if (!username) {
        alert('You must be logged in to upload an avatar.');
        return;
      }
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('username', username);

      try {
        const response = await fetch('http://localhost:5000/api/upload-avatar', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          // Update avatar images on success
          const avatarUrl = data.avatar;
          avatarImg.src = avatarUrl;
          profileAvatar.src = avatarUrl;
          localStorage.setItem('avatar', avatarUrl);
          alert('Avatar uploaded successfully.');
        } else {
          alert('Error uploading avatar: ' + data.message);
        }
      } catch (error) {
        alert('Error uploading avatar: ' + error.message);
      }
    }
  });

  updateProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentUsername = localStorage.getItem('username');
    if (!currentUsername) {
      alert('You must be logged in to update your profile.');
      return;
    }

    const newUsername = updateUsernameInput.value.trim();
    const email = updateEmailInput.value.trim();
    const password = updatePasswordInput.value;
    const confirmPassword = updateConfirmPasswordInput.value;

    // Email validation (same as loginform.js)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Password strength validation (same as loginform.js)
    if (password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
        alert('Password must be at least 8 characters long and include at least one letter and one number.');
        return;
      }
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: currentUsername,
          newUsername: newUsername !== currentUsername ? newUsername : undefined,
          email,
          password: password || undefined
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully.');
        localStorage.setItem('username', newUsername);
        // Optionally update avatar if changed elsewhere
        loadProfile();
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    window.location.href = 'index.html';
  });

  // Initialize profile on page load
  loadProfile();
});

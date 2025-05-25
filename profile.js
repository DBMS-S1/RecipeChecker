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
    const email = localStorage.getItem('email') || '';
    usernameDisplay.textContent = email || username;

    const defaultAvatar = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';

    try {
      // Use email if available, else username
      const identifier = email || username;
      console.log('Fetching user profile with identifier:', identifier);
      const response = await fetch(`https://recipechecker.onrender.com/api/user-profile?identifier=${encodeURIComponent(identifier)}`);
      console.log('User profile fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        if (user) {
          const avatarUrl = user.avatar && user.avatar.trim() !== '' ? user.avatar : defaultAvatar;
          avatarImg.src = avatarUrl;
          profileAvatar.src = avatarUrl;
          updateUsernameInput.value = user.username || username;
          updateEmailInput.value = user.email || '';
          localStorage.setItem('avatar', avatarUrl);
          localStorage.setItem('username', user.username);
          localStorage.setItem('email', user.email);
        } else {
          // Fallback if user data missing
          avatarImg.src = defaultAvatar;
          profileAvatar.src = defaultAvatar;
          updateUsernameInput.value = username;
          updateEmailInput.value = '';
        }
      } else {
        // Fallback if fetch failed
        avatarImg.src = defaultAvatar;
        profileAvatar.src = defaultAvatar;
        updateUsernameInput.value = username;
        updateEmailInput.value = '';
      }
    } catch (error) {
      // Fallback if error
      avatarImg.src = defaultAvatar;
      profileAvatar.src = defaultAvatar;
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

      const identifier = localStorage.getItem('username') || localStorage.getItem('email');
      if (!identifier) {
        alert('You must be logged in to upload an avatar.');
        return;
      }
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('identifier', identifier);

      try {
        const response = await fetch('https://recipechecker.onrender.com/api/upload-avatar', {
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

  // Fallback to default avatar if image fails to load
  avatarImg.onerror = () => {
    avatarImg.src = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
  };
  profileAvatar.onerror = () => {
    profileAvatar.src = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
  };

  updateProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const currentUsername = localStorage.getItem('username');
    const currentEmail = localStorage.getItem('email');
    if (!currentUsername && !currentEmail) {
      alert('You must be logged in to update your profile.');
      return;
    }

    const newUsername = updateUsernameInput.value.trim();
    const email = updateEmailInput.value.trim();
    const currentPassword = updatePasswordInput.value;
    const confirmPassword = updateConfirmPasswordInput.value;

    // Email validation (same as loginform.js)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Password strength validation (same as loginform.js)
    if (currentPassword) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(currentPassword)) {
        alert('Password must be at least 8 characters long and include at least one letter and one number.');
        return;
      }
    }

    if (currentPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Verify current password correctness before update
    if (currentPassword) {
      try {
      const verifyResponse = await fetch('https://recipechecker.onrender.com/api/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: currentEmail || currentUsername,
            password: currentPassword
          })
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok) {
          alert('Current password is incorrect.');
          return;
        }
      } catch (error) {
        alert('Error verifying current password: ' + error.message);
        return;
      }
    }

    try {
      const response = await fetch('https://recipechecker.onrender.com/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: currentEmail || currentUsername,
          newUsername: newUsername !== currentUsername ? newUsername : undefined,
          email,
          password: currentPassword || undefined
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully.');
        localStorage.setItem('username', newUsername);
        localStorage.setItem('email', email);
        // Optionally update avatar if changed elsewhere
        loadProfile();
      } else {
        alert('Error updating profile: ' + data.message);
        // Preserve username and email input values on error
        updateUsernameInput.value = updateUsernameInput.value;
        updateEmailInput.value = updateEmailInput.value;
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
      // Preserve username and email input values on error
      updateUsernameInput.value = updateUsernameInput.value;
      updateEmailInput.value = updateEmailInput.value;
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    window.location.href = 'index.html';
  });

  // Delete profile avatar on profile image click
  profileAvatar.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }
    const identifier = localStorage.getItem('email') || localStorage.getItem('username');
    if (!identifier) {
      alert('You must be logged in to delete your profile picture.');
      return;
    }
    try {
      const response = await fetch('https://recipechecker.onrender.com/api/delete-avatar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile picture deleted successfully.');
        // Update avatar images to default
        const defaultAvatar = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
        avatarImg.src = defaultAvatar;
        profileAvatar.src = defaultAvatar;
        localStorage.setItem('avatar', defaultAvatar);
      } else {
        alert('Error deleting profile picture: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting profile picture: ' + error.message);
    }
  });

  // Initialize profile on page load
  loadProfile();
});

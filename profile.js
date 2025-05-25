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
      // Clear cached avatar to avoid stale invalid URLs
      localStorage.removeItem('avatar');

      let username = localStorage.getItem('username') || null;
      let email = localStorage.getItem('email') || null;

      // If no username or email, user is not logged in, show login/signup buttons
      if (!username && !email) {
        console.log('User not logged in, showing login/signup buttons');
        // Show the login/signup section
        const homeSection = document.querySelector('section.home');
        if (homeSection) {
          homeSection.style.display = 'none'; // Hide the full form section initially
        }
        // Show login and signup buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';

        // Hide profile info and logout button
        const profileInfo = document.getElementById('profile-info');
        if (profileInfo) {
          profileInfo.style.display = 'none';
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (usernameDisplay) usernameDisplay.textContent = 'User';

        return; // Stop further profile loading
      } else {
        // Hide login and signup buttons if user is logged in
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';

        // Show profile info and logout button
        const profileInfo = document.getElementById('profile-info');
        if (profileInfo) {
          profileInfo.style.display = 'flex';
        }
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
      }

      if (usernameDisplay) {
        usernameDisplay.textContent = username || 'User';
      } else {
        console.warn('username-display element not found');
      }

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
            let avatarUrl = user.avatar && user.avatar.trim() !== '' ? user.avatar : defaultAvatar;
            console.log('Avatar string received:', avatarUrl);
            if (!avatarUrl || avatarUrl.endsWith('/undefined.jpg') || avatarUrl.includes('/uploads/undefined.jpg') || avatarUrl.startsWith('/uploads/')) {
              avatarUrl = defaultAvatar;
            }
            // If avatar is base64 string, convert to data URL
            if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
              avatarUrl = `data:image/png;base64,${avatarUrl}`;
            }
            if (avatarImg) {
              avatarImg.src = avatarUrl;
            } else {
              console.warn('avatar-img element not found');
            }
            if (profileAvatar) {
              profileAvatar.src = avatarUrl;
            }
            if (updateUsernameInput) {
              updateUsernameInput.value = user.username || username;
            }
            if (updateEmailInput) {
              updateEmailInput.value = user.email || '';
            }
            if (!avatarUrl || avatarUrl.includes('undefined')) {
              avatarUrl = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
            }
            localStorage.setItem('avatar', avatarUrl);
            localStorage.setItem('username', user.username);
            localStorage.setItem('email', user.email);
          } else {
            // Fallback if user data missing
            if (avatarImg) {
              avatarImg.src = defaultAvatar;
            }
            if (profileAvatar) {
              profileAvatar.src = defaultAvatar;
            }
            if (updateUsernameInput) {
              updateUsernameInput.value = username;
            }
            if (updateEmailInput) {
              updateEmailInput.value = '';
            }
          }
        } else {
          // Fallback if fetch failed
          if (avatarImg) {
            avatarImg.src = defaultAvatar;
          }
          if (profileAvatar) {
            profileAvatar.src = defaultAvatar;
          }
          if (updateUsernameInput) {
            updateUsernameInput.value = username;
          }
          if (updateEmailInput) {
            updateEmailInput.value = '';
          }
        }
      } catch (error) {
        // Fallback if error
        if (avatarImg) {
          avatarImg.src = defaultAvatar;
        }
        if (profileAvatar) {
          profileAvatar.src = defaultAvatar;
        }
        if (updateUsernameInput) {
          updateUsernameInput.value = username;
        }
        if (updateEmailInput) {
          updateEmailInput.value = '';
        }
      }
    }

  if (avatarUpload) {
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
          const jsonResponse = await response.json();
          if (response.ok) {
            // Update avatar images on success
            let avatarUrl = jsonResponse.avatar;
            // If avatar is base64 string, convert to data URL
            if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
              avatarUrl = `data:image/png;base64,${avatarUrl}`;
            }
            if (avatarImg) {
              avatarImg.src = avatarUrl;
            }
            if (profileAvatar) {
              profileAvatar.src = avatarUrl;
            }
            localStorage.setItem('avatar', avatarUrl);
            alert('Avatar uploaded successfully.');
            loadProfile();
          } else {
            alert('Error uploading avatar: ' + jsonResponse.message);
          }
        } catch (error) {
          alert('Error uploading avatar: ' + error.message);
        }
      }
    });
  }

  // Fallback to default avatar if image fails to load
  if (avatarImg) {
    avatarImg.onerror = () => {
      avatarImg.src = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
    };
  }
  if (profileAvatar) {
    profileAvatar.onerror = () => {
      profileAvatar.src = 'https://raw.githubusercontent.com/DBMS-S1/RecipeChecker/main/Pictures/Default%20Picture.jpg';
    };
  }

  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const currentUsername = localStorage.getItem('username');
      const currentEmail = localStorage.getItem('email');
      console.log('Updating profile with currentUsername:', currentUsername);
      if (!currentUsername && !currentEmail) {
        alert('You must be logged in to update your profile.');
        return;
      }
      if (!currentUsername) {
        alert('Current username is required to update profile.');
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
            username: currentUsername,
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
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    window.location.href = 'index.html';
  });

  // Delete profile avatar on profile image click
  if (profileAvatar) {
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
  }

  // Initialize profile on page load
  loadProfile();
});

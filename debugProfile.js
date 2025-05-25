document.addEventListener('DOMContentLoaded', () => {
  console.log('Debug: localStorage username:', localStorage.getItem('username'));
  console.log('Debug: localStorage avatar:', localStorage.getItem('avatar'));
  const avatarImg = document.getElementById('avatar-img');
  const usernameDisplay = document.getElementById('username-display');
  console.log('Debug: avatarImg element:', avatarImg);
  console.log('Debug: usernameDisplay element:', usernameDisplay);
});

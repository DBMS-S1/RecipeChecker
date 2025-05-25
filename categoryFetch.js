document.addEventListener('DOMContentLoaded', () => {
  // Containers for each category list
  const breakfastList = document.getElementById('breakfast-list');
  const lunchList = document.getElementById('lunch-list');
  const dinnerList = document.getElementById('dinner-list');
  const snackList = document.getElementById('snack-list');

  // Create popup container
  const recipePopup = document.createElement('div');
  recipePopup.id = 'recipe-popup';
  recipePopup.className = 'recipe-popup';
  recipePopup.setAttribute('role', 'dialog');
  recipePopup.setAttribute('aria-modal', 'true');
  recipePopup.style.display = 'none';

  const popupContent = document.createElement('div');
  popupContent.id = 'popup-content';
  popupContent.className = 'popup-content';
  recipePopup.appendChild(popupContent);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'close-popup';
  closeBtn.className = 'close-popup-button';
  closeBtn.setAttribute('aria-label', 'Close recipe popup');
  closeBtn.innerHTML = '&times;';
  popupContent.appendChild(closeBtn);

  document.body.appendChild(recipePopup);

  closeBtn.addEventListener('click', () => {
    recipePopup.style.display = 'none';
  });

  // Fetch recipes from backend
  async function fetchRecipes() {
    try {
      const response = await fetch('https://recipechecker.onrender.com/api/recipes');
      const recipes = await response.json();
      displayRecipesByCategory(recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      breakfastList.innerHTML = '<li>Error loading recipes.</li>';
      lunchList.innerHTML = '<li>Error loading recipes.</li>';
      dinnerList.innerHTML = '<li>Error loading recipes.</li>';
      snackList.innerHTML = '<li>Error loading recipes.</li>';
    }
  }

  // Display recipes grouped by category, supporting multiple categories per recipe
  function displayRecipesByCategory(recipes) {
    // Clear existing lists
    breakfastList.innerHTML = '';
    lunchList.innerHTML = '';
    dinnerList.innerHTML = '';
    snackList.innerHTML = '';

    recipes.forEach(recipe => {
      // Split category by slash, comma, or semicolon delimiters
      const categories = recipe.category ? recipe.category.split(/[\/,;]/).map(c => c.trim()) : ['Snack'];

      categories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.className = 'recipe-list-item';
        listItem.textContent = recipe.recipe_name;
        listItem.tabIndex = 0;
        listItem.setAttribute('role', 'button');
        listItem.setAttribute('aria-pressed', 'false');

        listItem.addEventListener('click', () => {
          showRecipePopup(recipe);
        });
        listItem.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showRecipePopup(recipe);
          }
        });

        switch (category) {
          case 'Breakfast':
            breakfastList.appendChild(listItem);
            break;
          case 'Lunch':
            lunchList.appendChild(listItem);
            break;
          case 'Dinner':
            dinnerList.appendChild(listItem);
            break;
          case 'Snack':
          default:
            snackList.appendChild(listItem);
            break;
        }
      });
    });

    // If any category has no recipes, show a placeholder
    if (breakfastList.children.length === 0) {
      breakfastList.innerHTML = '<li>No recipes available.</li>';
    }
    if (lunchList.children.length === 0) {
      lunchList.innerHTML = '<li>No recipes available.</li>';
    }
    if (dinnerList.children.length === 0) {
      dinnerList.innerHTML = '<li>No recipes available.</li>';
    }
    if (snackList.children.length === 0) {
      snackList.innerHTML = '<li>No recipes available.</li>';
    }
  }

  // Show recipe details in popup
  function showRecipePopup(recipe) {
    popupContent.innerHTML = `
      <button id="close-popup" class="close-popup-button" aria-label="Close recipe popup">&times;</button>
      <h3 id="recipeTitle">${recipe.recipe_name}</h3>
      <p><strong>Category:</strong> ${recipe.category}</p>
      <p><strong>Preparation Time:</strong> ${recipe.preparation_time} minutes</p>
      <p><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
      <p><strong>Serving Size:</strong> ${recipe.serving_size}</p>
      <p><strong>Ingredients:</strong><br>${recipe.ingredients.replace(/\n/g, '<br>')}</p>
      <p><strong>Instructions:</strong><br>${recipe.instructions.replace(/\n/g, '<br>')}</p>
      <p><strong>Allergens:</strong> ${recipe.allergen || 'None'}</p>
    `;

    recipePopup.style.display = 'block';

    const closeBtnInner = popupContent.querySelector('.close-popup-button');
    closeBtnInner.addEventListener('click', () => {
      recipePopup.style.display = 'none';
    });
  }

  // Close popup when clicking outside content
  window.addEventListener('click', (event) => {
    if (event.target === recipePopup) {
      recipePopup.style.display = 'none';
    }
  });

  fetchRecipes();
});

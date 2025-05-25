document.addEventListener('DOMContentLoaded', () => {
  console.log('recipesDisplay.js loaded and DOM elements found.');

  const findRecipesBtn = document.getElementById('find-recipes');
  const servingSizeSelect = document.getElementById('serving-size');
  const prepTimeInput = document.getElementById('prep-time');
  const cookTimeInput = document.getElementById('cook-time');
  const includedIngredientsInput = document.getElementById('included-ingredients');
  const excludedIngredientsInput = document.getElementById('excluded-ingredients');
  const recipesPopup = document.getElementById('recipe-popup'); // Correct ID from HTML
  const recipesContainer = document.getElementById('recipes-container');
  const closePopupBtn = document.getElementById('close-popup');

  // Hide popup on page load to prevent it from showing by default
  if (recipesPopup) {
    recipesPopup.style.display = 'none';
    recipesPopup.classList.remove('show');
  }

  // Function to fetch and display recipes
  async function fetchAndDisplayRecipes() {
    const maxServingSize = servingSizeSelect.value;
    const maxPreparationTime = prepTimeInput.value || '';
    const maxCookingTime = cookTimeInput.value || '';
    const includedIngredients = includedIngredientsInput.value.trim();
    const excludedIngredients = excludedIngredientsInput.value.trim();

    const filters = {
      maxServingSize,
      maxPreparationTime,
      maxCookingTime,
      includedIngredients: includedIngredients ? includedIngredients.split(',').map(i => i.trim()) : [],
      excludedIngredients: excludedIngredients ? excludedIngredients.split(',').map(i => i.trim()) : []
    };

    console.log('Fetching recipes with filters: ', filters);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('maxServingSize', maxServingSize);
      if (maxPreparationTime) queryParams.append('maxPreparationTime', maxPreparationTime);
      if (maxCookingTime) queryParams.append('maxCookingTime', maxCookingTime);
      if (filters.includedIngredients.length > 0) queryParams.append('includedIngredients', filters.includedIngredients.join(','));
      if (filters.excludedIngredients.length > 0) queryParams.append('excludedIngredients', filters.excludedIngredients.join(','));

      // Use explicit backend URL with correct port 5000
      const response = await fetch(`https://recipechecker.onrender.com/api/recipes?${queryParams.toString()}`);
      const recipes = await response.json();

      console.log('Received recipes: ', recipes);

      // Clear previous recipes
      recipesContainer.innerHTML = '';

      if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p>No recipes found matching the criteria.</p>';
      } else {
        // Display list of recipes for user to choose
        const list = document.createElement('ul');
        list.classList.add('recipe-list');

        recipes.forEach(recipe => {
          const listItem = document.createElement('li');
          listItem.classList.add('recipe-list-item');
          listItem.textContent = recipe.recipe_name;
          listItem.tabIndex = 0;
          listItem.setAttribute('role', 'button');
          listItem.setAttribute('aria-pressed', 'false');

          // On click, display full recipe details
          listItem.addEventListener('click', () => {
            displayRecipeDetails(recipe);
          });
          listItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              displayRecipeDetails(recipe);
            }
          });

          list.appendChild(listItem);
        });

        recipesContainer.appendChild(list);
      }

      // Show popup if exists
      if (recipesPopup) {
        recipesPopup.style.display = 'flex'; // Use flex to match CSS
        recipesPopup.classList.add('show');
      } else {
        console.warn('recipesPopup element not found');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      if (recipesContainer) {
        recipesContainer.innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
      }
      if (recipesPopup) {
        recipesPopup.style.display = 'flex';
      }
    }
  }

  // Function to display full recipe details
  function displayRecipeDetails(recipe) {
    if (!recipesContainer) {
      console.error('recipesContainer element not found');
      return;
    }

    console.log('Displaying recipe details for:', recipe.recipe_name);

    recipesContainer.innerHTML = `
      <button id="back-to-list" aria-label="Back to recipe list" class="back-button">Back to list</button>
      <h3>${recipe.recipe_name}</h3>
      <p><strong>Category:</strong> ${recipe.category}</p>
      <p><strong>Preparation Time:</strong> ${recipe.preparation_time} minutes</p>
      <p><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
      <p><strong>Serving Size:</strong> ${recipe.serving_size}</p>
      <p><strong>Ingredients:</strong><br>${recipe.ingredients.replace(/\n/g, '<br>')}</p>
      <p><strong>Instructions:</strong><br>${recipe.instructions.replace(/\n/g, '<br>')}</p>
      <p><strong>Allergens:</strong> ${recipe.allergen || 'None'}</p>
    `;

    // Add event listener to back button to show recipe list again
    const backBtn = document.getElementById('back-to-list');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        console.log('Back to list button clicked');
        if (recipesPopup) {
          recipesPopup.style.display = 'flex';
          recipesPopup.classList.add('show');
        }
        fetchAndDisplayRecipes();
      });
    } else {
      console.warn('Back to list button not found');
    }
  }

  // Event listener for Find Recipes button only
  if (findRecipesBtn) {
    findRecipesBtn.addEventListener('click', () => {
      console.log('Find recipes button clicked');
      fetchAndDisplayRecipes();
    });
  } else {
    console.warn('findRecipesBtn element not found');
  }

  // Event listener to close popup
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
      if (recipesPopup) {
        recipesPopup.style.display = 'none';
        recipesPopup.classList.remove('show');
      }
    });
  }
});

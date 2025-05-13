window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const navBar = document.querySelector('nav');
    const homeSection = document.querySelector('.home');
    if (loadingScreen && mainContent && navBar && homeSection) {
      navBar.style.display = 'none';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
        navBar.style.display = 'flex';
        // Ensure home section is hidden initially
        homeSection.style.display = 'none';
      }, 3000);
    }
  });
  
  // Functionality for recipe search button
  document.getElementById('find-recipes').addEventListener('click', function () {
      const servingSizeInput = document.getElementById('serving-size');
      const prepTimeInput = document.getElementById('prep-time');
      const cookTimeInput = document.getElementById('cook-time');
      const includedIngredientsInput = document.getElementById('included-ingredients');
      const excludedIngredientsInput = document.getElementById('excluded-ingredients');
      const findRecipesBtn = this;
  
      // Parse and trim inputs
      const servingSize = parseInt(servingSizeInput.value);
      const prepTime = parseInt(prepTimeInput.value);
      const cookTime = parseInt(cookTimeInput.value);
      const includedIngredients = includedIngredientsInput.value
          ? includedIngredientsInput.value.split(',').map(ingredient => ingredient.trim()).filter(Boolean)
          : [];
      const excludedIngredients = excludedIngredientsInput.value
          ? excludedIngredientsInput.value.split(',').map(ingredient => ingredient.trim()).filter(Boolean)
          : [];
  
      // Input validation with user-friendly messages
      if (isNaN(servingSize) || servingSize <= 0) {
          alert("Please select a valid serving size.");
          servingSizeInput.focus();
          return;
      }
      if (isNaN(prepTime) || prepTime < 0) {
          alert("Please enter a valid preparation time.");
          prepTimeInput.focus();
          return;
      }
      if (isNaN(cookTime) || cookTime < 0) {
          alert("Please enter a valid cooking time.");
          cookTimeInput.focus();
          return;
      }
  
      // Disable button and show loading state
      findRecipesBtn.disabled = true;
      findRecipesBtn.textContent = 'Searching...';
  
      // Simulate async search with setTimeout
      setTimeout(() => {
          const recipe = findRecipe(servingSize, prepTime, cookTime, includedIngredients, excludedIngredients);
  
          if (recipe) {
              displayRecipe(recipe);
          } else {
              alert("No matching recipe found.");
              const recipeDetails = document.getElementById('recipe-details');
              if (recipeDetails) {
                  recipeDetails.style.display = 'none';
              }
          }
  
          // Re-enable button and reset text
          findRecipesBtn.disabled = false;
          findRecipesBtn.textContent = 'Find recipes!';
      }, 500);
  });
  
  // Function to search the recipe based on user input
  function findRecipe(servingSize, prepTime, cookTime, includedIngredients, excludedIngredients) {
      return recipes.find(recipe =>
          recipe.servingSize === servingSize &&
          recipe.prepTime <= prepTime &&
          recipe.cookTime <= cookTime &&
          includedIngredients.every(ingredient => recipe.ingredients.includes(ingredient)) &&
          !excludedIngredients.some(ingredient => recipe.ingredients.includes(ingredient))
      );
  }
  
  // Function to display the recipe
  function displayRecipe(recipe) {
      const recipeDetails = document.getElementById('recipe-details');
      if (!recipeDetails) return;
      recipeDetails.innerHTML = `
          <h2 class="text-2xl font-bold">${recipe.name}</h2>
          <p><strong>Serving Size:</strong> ${recipe.servingSize}</p>
          <p><strong>Preparation Time:</strong> ${recipe.prepTime} minutes</p>
          <p><strong>Cooking Time:</strong> ${recipe.cookTime} minutes</p>
          <h3 class="font-bold">Ingredients:</h3>
          <ul class="list-disc list-inside">
              ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
          <h3 class="font-bold">Instructions:</h3>
          <ol class="list-decimal list-inside">
              ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
      `;
      recipeDetails.style.display = 'block';
  }
  
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
          }
      };
  }
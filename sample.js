// Sample recipe database (you could replace this with a real database or API)
const recipes = [
    {
      servingSize: 4,
      prepTime: 15,
      cookTime: 30,
      name: "Spaghetti Bolognese",
      ingredients: ["spaghetti", "minced beef", "onion", "tomato sauce", "garlic"],
      steps: [
        "Boil the spaghetti.",
        "Cook the minced beef with onions and garlic.",
        "Add tomato sauce and simmer for 15 minutes.",
        "Serve the sauce over the spaghetti."
      ]
    },
    {
      servingSize: 2,
      prepTime: 10,
      cookTime: 20,
      name: "Chicken Salad",
      ingredients: ["chicken breast", "lettuce", "tomatoes", "olive oil", "lemon"],
      steps: [
        "Cook the chicken breast.",
        "Chop lettuce and tomatoes.",
        "Combine chicken with vegetables, drizzle with olive oil and lemon."
      ]
    }
  ];
  
  // Handle form submission
  document.getElementById('recipe-form').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const servingSize = parseInt(document.getElementById('serving-size').value);
    const prepTime = parseInt(document.getElementById('prep-time').value);
    const cookTime = parseInt(document.getElementById('cook-time').value);
  
    const recipe = findRecipe(servingSize, prepTime, cookTime);
  
    if (recipe) {
      displayRecipe(recipe);
    } else {
      alert("No matching recipe found.");
    }
  });
  
  // Function to search the recipe based on user input
  function findRecipe(servingSize, prepTime, cookTime) {
    return recipes.find(recipe =>
      recipe.servingSize === servingSize &&
      recipe.prepTime <= prepTime &&
      recipe.cookTime <= cookTime
    );
  }
  
  // Function to display the recipe
  function displayRecipe(recipe) {
    const recipeDetails = document.getElementById('recipe-details');
    recipeDetails.innerHTML = `
      <h2>${recipe.name}</h2>
      <p><strong>Serving Size:</strong> ${recipe.servingSize}</p>
      <p><strong>Preparation Time:</strong> ${recipe.prepTime} minutes</p>
      <p><strong>Cooking Time:</strong> ${recipe.cookTime} minutes</p>
      <h3>Ingredients:</h3>
      <ul>
        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
      </ul>
      <h3>Instructions:</h3>
      <ol>
        ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
      </ol>
    `;
    recipeDetails.style.display = 'block';
  }
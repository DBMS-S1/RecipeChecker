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

// Handle form submission for finding recipes
document.getElementById('find-recipes').addEventListener('click', function () {
    const servingSize = parseInt(document.getElementById('serving-size').value);
    const prepTime = parseInt(document.getElementById('prep-time').value);
    const cookTime = parseInt(document.getElementById('cook-time').value);
    const includedIngredients = document.getElementById('included-ingredients').value.split(',').map(ingredient => ingredient.trim());
    const excludedIngredients = document.getElementById('excluded-ingredients').value.split(',').map(ingredient => ingredient.trim());

    // Input validation
    if (isNaN(servingSize) || servingSize <= 0) {
        alert("Please select a valid serving size.");
        return;
    }
    if (isNaN(prepTime) || prepTime < 0) {
        alert("Please enter a valid preparation time.");
        return;
    }
    if (isNaN(cookTime) || cookTime < 0) {
        alert("Please enter a valid cooking time.");
        return;
    }

    const recipe = findRecipe(servingSize, prepTime, cookTime, includedIngredients, excludedIngredients);

    if (recipe) {
        displayRecipe(recipe);
    } else {
        alert("No matching recipe found.");
        document.getElementById('recipe-details').style.display = 'none';
    }
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
document.querySelector('.dropdown').addEventListener('mouseenter', function() {
    document.querySelector('.dropdown-content').classList.remove('hidden');
});

document.querySelector('.dropdown').addEventListener('mouseleave', function() {
    document.querySelector('.dropdown-content').classList.add('hidden');
});

// Modal functionality
var modal = document.getElementById('modal-wrapper');
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

const formOpenBtn = document.querySelector("#form-open"),
      home = document.querySelector(".home"),
      formContainer = document.querySelector(".form_container"),
      formCloseBtn = document.querySelector(".form_close"),
      signupBtn = document.querySelector("#signup"),
      loginBtn = document.querySelector("#login"),
      pwShowHide = document.querySelectorAll(".pw_hide");

formOpenBtn.addEventListener("click", () => {
    home.classList.add("show");
    
});

formCloseBtn.addEventListener("click", () => {
    home.classList.remove("show");

});

pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("uil-eye-slash", "uil-eye");
        } else {
            getPwInput.type = "password";
            icon.classList.replace("uil-eye", "uil-eye-slash");
        }
    });
});

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.add("active");
});

loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.remove("active");
});
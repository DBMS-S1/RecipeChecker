const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string with correct database FerrBabies
const mongoURI = 'mongodb+srv://ToxicityRadius:dexteraz23@cluster0.acutdrr.mongodb.net/FerrBabies?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'FerrBabies' // Explicitly specify database name
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Recipe container schema and model for collection 'recipes' in FerrBabies database
const recipeContainerSchema = new mongoose.Schema({}, { collection: 'recipes', strict: false });
const RecipeContainer = mongoose.model('RecipeContainer', recipeContainerSchema);

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get recipes endpoint with aggregation pipeline to filter nested recipes
app.get('/api/recipes', async (req, res) => {
  try {
    console.log('Received request for /api/recipes with query:', req.query);

    const maxServingSize = req.query.maxServingSize ? parseInt(req.query.maxServingSize) : null;
    const maxPreparationTime = req.query.maxPreparationTime ? parseInt(req.query.maxPreparationTime) : null;
    const maxCookingTime = req.query.maxCookingTime ? parseInt(req.query.maxCookingTime) : null;
    const includedIngredients = req.query.includedIngredients ? req.query.includedIngredients.split(',').map(i => i.trim().toLowerCase()) : [];
    const excludedIngredients = req.query.excludedIngredients ? req.query.excludedIngredients.split(',').map(i => i.trim().toLowerCase()) : [];

    // Build match conditions for aggregation
    let matchConditions = {};

    if (maxServingSize !== null && !isNaN(maxServingSize)) {
      matchConditions['recipes.serving_size'] = { $lte: maxServingSize };
    }
    if (maxPreparationTime !== null && !isNaN(maxPreparationTime)) {
      matchConditions['recipes.preparation_time'] = { $lte: maxPreparationTime };
    }
    if (maxCookingTime !== null && !isNaN(maxCookingTime)) {
      matchConditions['recipes.cooking_time'] = { $lte: maxCookingTime };
    }

    // Aggregation pipeline
    let pipeline = [
      { $unwind: '$recipes' },
      { $match: matchConditions }
    ];

    // Fetch recipes matching numeric filters
    let results = await RecipeContainer.aggregate(pipeline).exec();

    console.log('Recipes fetched from DB:', results.length);

    // Filter by included and excluded ingredients in JS since ingredients is a string
    let filteredRecipes = results.map(r => r.recipes);

    if (includedIngredients.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const ingredientsLower = recipe.ingredients ? recipe.ingredients.toLowerCase() : '';
        return includedIngredients.every(inc => ingredientsLower.includes(inc));
      });
    }
    if (excludedIngredients.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const ingredientsLower = recipe.ingredients ? recipe.ingredients.toLowerCase() : '';
        return excludedIngredients.every(exc => !ingredientsLower.includes(exc));
      });
    }

    console.log('Recipes after ingredient filtering:', filteredRecipes.length);

    res.json(filteredRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

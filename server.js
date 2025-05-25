// Additional imports for file upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' }, // New avatar field to store image URL or base64
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Recipe container schema and model for collection 'recipes' in FerrBabies database
const recipeContainerSchema = new mongoose.Schema({}, { collection: 'recipes', strict: false });
const RecipeContainer = mongoose.model('RecipeContainer', recipeContainerSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use identifier + original extension as filename
    const ext = path.extname(file.originalname);
    cb(null, req.body.identifier + ext);
  }
});

// File filter to restrict file types
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPEG, and WEBP files are allowed.'));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required.' });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const newUser = new User({ username, email, password });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Update profile endpoint
app.put('/api/update-profile', async (req, res) => {
  const { username, email, password, newUsername } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Current username is required.' });
  }
  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (newUsername) updateData.username = newUsername;

    const updatedUser = await User.findOneAndUpdate(
      { username: username },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
      password: password
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }
    return res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
  const identifier = req.body.identifier;
  if (!identifier || !req.file) {
    return res.status(400).json({ message: 'Identifier and avatar file are required.' });
  }
  try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findOneAndUpdate(
      { $or: [{ username: identifier }, { email: identifier }] },
      { avatar: avatarUrl },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ message: 'Avatar uploaded successfully.', avatar: avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/user-profile', async (req, res) => {
  console.log('Received /api/user-profile request with query:', req.query);
  const identifier = req.query.identifier;
  console.log('Identifier:', identifier);
  if (!identifier) {
    return res.status(400).json({ message: 'Identifier query parameter is required.' });
  }
  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('username email avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/api/delete-avatar', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ message: 'Identifier is required.' });
  }
  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.avatar = '';
    await user.save();
    return res.status(200).json({ message: 'Avatar deleted successfully.' });
  } catch (error) {
    console.error('Delete avatar error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.get('/test', (req, res) => {
  res.json({ status: 'working', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



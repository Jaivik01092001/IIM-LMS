const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const seedDatabase = require('./utils/seeder'); // ✅ Import the seeder function

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Import and register routes dynamically
const routes = ['auth', 'educator', 'university', 'admin'].reduce((acc, route) => {
  try {
    acc[route] = require(`./routes/${route}Routes`);
    if (typeof acc[route] !== 'function') {
      throw new Error(`${route}Routes is not a valid Express router`);
    }
    app.use(`/api/${route}`, acc[route]);
  } catch (error) {
    console.error(`❌ Error loading ${route}Routes:`, error.message);
  }
  return acc;
}, {});

// Start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    await seedDatabase(); // ✅ Runs only if the data is not seeded already
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

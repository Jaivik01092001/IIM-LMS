const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const seedDatabase = require('./utils/seeder'); // ✅ Import the seeder function

dotenv.config();
const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Import and register routes dynamically
const routes = ['auth', 'educator', 'university', 'admin', 'quiz', 'cms'].reduce((acc, route) => {
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

// Global error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Handle undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    await seedDatabase(); // ✅ Runs only if the data is not seeded already
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

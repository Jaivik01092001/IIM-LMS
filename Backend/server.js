const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const http = require('http'); // ✅ for custom server timeout
const seedDatabase = require('./utils/seeder'); // ✅ Import the seeder function

const app = express();


// ✅ Increase file/body limits to handle video uploads
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// ==========================
// 🔐 Security Middlewares
// ==========================
app.use(helmet()); // Set security HTTP headers
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);


// Data sanitization
app.use(mongoSanitize()); // Against NoSQL injection
app.use(xss());            // Against XSS

// ==========================
// 🌐 CORS (must come BEFORE routes & body parsing!)
// ==========================
app.use(cors({
  // origin: ['http://localhost:5173', 'https://iim-lms-frontend.onrender.com'],
  origin: ['http://localhost:5173', 'https://iim-lms-1.onrender.com'],
  credentials: true,
}));

app.options('*', cors({
  // origin: ['http://localhost:5173', 'https://iim-lms-frontend.onrender.com'],
  origin: ['http://localhost:5173', 'https://iim-lms-1.onrender.com'],
  credentials: true,
}));


// ==========================
// 📦 Dynamic Routes Import
// ==========================
const routes = ['auth', 'educator', 'university', 'admin', 'quiz', 'cms', 'module'].reduce((acc, route) => {
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

// ==========================
// ✅ Root Route
// ==========================
app.get('/', (req, res) => {
  res.send('✅ Backend API is running...');
});

// ==========================
// 🧯 Global Error Handling
// ==========================
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Handle undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// ==========================
// 🚀 Start Server
// ==========================
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ✅ Increase server timeout to 10 minutes
server.setTimeout(10 * 60 * 1000); // 10 minutes

connectDB()
  .then(async () => {
    await seedDatabase(); // ✅ Run seeder only if not already seeded
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

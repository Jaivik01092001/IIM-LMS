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
const http = require('http');
const path = require('path');
const seedDatabase = require('./utils/seeder');

const app = express();

// ==========================
// 📦 File Upload Handling
// ==========================
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// ==========================
// 🌐 Static Files
// ==========================
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================
// 🔐 Security Middlewares
// ==========================
app.use(helmet());
app.use(morgan('dev'));
app.use(mongoSanitize());
app.use(xss());

// ==========================
// 🌍 CORS Configuration
// ==========================
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://iim-lms-1.onrender.com",
    "https://iim-lms-frontend.onrender.com",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow preflight CORS requests

// ==========================
// 🚫 Rate Limiter (Skip OPTIONS)
// ==========================
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Increase for dev, reduce for prod
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS', // ✅ Skip preflight
});
app.use('/api', limiter);

// ==========================
// 📦 Dynamic Routes
// ==========================
const routes = ['auth', 'educator', 'university', 'admin', 'quiz', 'cms', 'module', 'moduleProgress', 'certificate', 'role', 'staff'].reduce((acc, route) => {
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
// 🧯 Error Handling
// ==========================
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.all('*', (req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
  if (req.accepts('json')) {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    return next(err);
  }
  res.status(404).send('404 Not Found');
});

// ==========================
// 🚀 Server Launch
// ==========================
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
server.setTimeout(10 * 60 * 1000); // 10-minute timeout

connectDB()
  .then(async () => {
    await seedDatabase();
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
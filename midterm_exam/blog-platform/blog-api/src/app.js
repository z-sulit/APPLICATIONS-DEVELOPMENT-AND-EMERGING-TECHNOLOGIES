const path = require('path');
const express = require('express');
const postRoutes = require('./routes/post.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); //allows req for any domain
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// JSON body parser
app.use(express.json());

// Serve static frontend assets from public/ folder
app.use(express.static(path.resolve(__dirname, '../../public')));

// API Routes
app.use('/api', postRoutes);

// 404 Route Not Found handler
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

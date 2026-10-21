const express = require('express');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); //allows req for any domain
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); //http verbs
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); //headers allowed in the request

  // Handle preflight requests: send options req -> catches -> 204 no content success
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// JSON body parser
app.use(express.json());

// Mounts the Auth routes
app.use('/', authRoutes);

// 404 Route Not Found handler
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

const express = require('express');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

module.exports = app;

// Centralized uniform error handler: { "error": "descriptive message" }
module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
//import and extract auth header


//Verifies the header exists and follows the standard Bearer <token> format.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  // kung saan nangyari si stateless etc.. use jtw_secred to verify token signature and expiration date.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject refresh tokens explicitly
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        error: 'Refresh tokens cannot be used to access this resource',
      });
    }
// Attach user info to request object -> middleware & route handlers
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const ALLOWED_ROLES = ['reader', 'author', 'admin'];

exports.register = (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }
// extract payload from request body and validate role
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}` });
    }
// Checks the database for duplicates. Returns a 409 Conflict if the username exists, protecting database integrity.
    const existingUser = UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

// create new user
    const newUser = UserModel.create({ username, password, role });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
//crd extract
exports.login = (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
// Fetches the user and runs the cryptographic check
    const user = UserModel.findByUsername(username);
    if (!user || !UserModel.verifyPassword(password, user.hashed_password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
// Generates access and refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

// save refresh token to user record in storage
    UserModel.updateRefreshToken(user.id, refreshToken);
    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};
// frontend hits endpoint when the 15-minute access token expires.
exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
// jwt.verify validates sig and exiration date of the refresh token.
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
// verify if user exists, token matchs one in storage, and token has not been revoked.
    const user = UserModel.findById(decoded.id);
    if (!user || user.refresh_token !== refreshToken || user.revoked_at !== null) {
      return res.status(401).json({ error: 'Invalid, expired, or revoked refresh token' });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    return res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const user = UserModel.findByRefreshToken(refreshToken);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    UserModel.revokeToken(refreshToken);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

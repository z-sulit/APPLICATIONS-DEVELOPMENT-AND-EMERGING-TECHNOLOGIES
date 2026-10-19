const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const ALLOWED_ROLES = ['reader', 'author', 'admin'];

exports.register = (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}` });
    }

    const existingUser = UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

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

exports.login = (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = UserModel.findByUsername(username);
    if (!user || !UserModel.verifyPassword(password, user.hashed_password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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

    UserModel.updateRefreshToken(user.id, refreshToken);

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

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

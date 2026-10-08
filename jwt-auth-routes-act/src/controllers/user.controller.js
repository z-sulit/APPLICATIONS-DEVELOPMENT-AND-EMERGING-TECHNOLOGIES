const User = require("../models/user.model");

exports.getMe = (req, res) => {
  const user = User.findById(req.user.userId); // req.user was set by the auth middleware
  if (!user) return res.status(404).json({ error: "User not found" });

  // return username, email, and bio
  res.json({
    id: user.id,
    username: user.username || user.name,
    email: user.email,
    bio: user.bio || "",
  });
};

// list all registered users
exports.getAllUsers = (req, res) => {
  const users = User.findAll();
  // sanitize list without password hashes
  const safeUsers = users.map((u) => ({
    id: u.id,
    username: u.username || u.name,
    email: u.email,
    bio: u.bio || "",
  }));
  res.json(safeUsers);
};


// In-memory "database" for demo purposes. Data resets when the server restarts.
// Swap this file for MongoDB/Postgres later; the controllers won't need to change much.
const users = [];
let nextId = 1;

module.exports = {
  findByEmail: (email) => users.find((u) => u.email === email),
  findById: (id) => users.find((u) => u.id === id),
  // return all registered users
  findAll: () => users,
  create: ({ name, username, email, passwordHash, bio }) => {
    // include username and bio
    const user = {
      id: nextId++,
      name: name || username,
      username: username || name,
      email,
      passwordHash,
      bio: bio || "No bio provided",
    };
    users.push(user);
    return user;
  },
};

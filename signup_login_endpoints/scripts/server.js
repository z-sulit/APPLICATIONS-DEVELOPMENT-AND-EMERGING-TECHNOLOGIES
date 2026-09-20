const express = require("express");
const path = require("path");
const users = require("./users");

const app = express();
const PORT = 3000;

app.use(express.json());
// Serve static files from the parent directory (signup_login_endpoints)
app.use(express.static(path.join(__dirname, "../")));

// Signup Page POST API
app.post("/signup", (req, res) => {
    const { email, username, password } = req.body;

    // Empty fields must return 400 error
    if (!email || !username || !password) {
        return res.status(400).json({ message: "Empty fields are not allowed." });
    }

    // An already existing user will throw a 409 error
    const existingUser = users.find(
        (u) => u.username === username || u.email === email
    );
    if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
    }

    // Stores object to a JSON users array
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        email,
        username,
        password
    };
    users.push(newUser);

    // 201 for successful creation
    return res.status(201).json({ message: "Signup successful", user: newUser });
});

// Login Page POST API
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Empty fields must return 400 error
    if (!username || !password) {
        return res.status(400).json({ message: "Empty fields are not allowed." });
    }

    // Checks whether a user is existing in the demo database
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // 200 if user successfully exists upon logging in
    return res.status(200).json({ message: "Login successful" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

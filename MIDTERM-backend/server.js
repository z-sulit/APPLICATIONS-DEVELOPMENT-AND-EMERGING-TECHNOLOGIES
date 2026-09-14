const express = require("express");
const app = express();
const users = require("./users");

app.use(express.json()); // IMPORTANT: parse JSON body

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/users", (req, res) => {
    res.json(users);
});
//getting a siungple user by id
app.get("/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});
// post request
app.post("/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required",
        });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
    };

    users.push(newUser);

    res.status(201).json(newUser);
});

// put request
app.put("/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    users[index] = {
        // ...users[index],
        ...req.body,
        id: id,
        // name: req.body.name,
    };

    res.json(users[index]);
});
// patch (partial update/s)
app.patch("/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (req.body.name !== undefined) {
        user.name = req.body.name;
    }

    res.json(user);
});
// delete
app.delete("/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    users.splice(index, 1);

    res.json({ message: "User deleted" });
});

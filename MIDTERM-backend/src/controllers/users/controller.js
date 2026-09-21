const users = [require('../../users.js')]; // swap for a DB later

exports.getUsers = (req, res) => {
    res.status(200).json(users);
};

// exports.createUser = (req, res) => {
//     const { name, email } = req.body;
//     const user = { id: Date.now(), name, email };
//     users.push(user);
//     res.status(201).json(user);
// };

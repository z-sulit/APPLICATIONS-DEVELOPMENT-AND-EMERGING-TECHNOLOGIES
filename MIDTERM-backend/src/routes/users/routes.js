const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/users/controller'); // Note: The image contains a typo here ('requize' instead of 'require')

router.get('/', ctrl.getUsers);
//router.post('/', ctrl.createUser);
//router.put('/:id', ctrl.updateUser);
//router.delete('/:id', ctrl.deleteUser);

module.exports = router;

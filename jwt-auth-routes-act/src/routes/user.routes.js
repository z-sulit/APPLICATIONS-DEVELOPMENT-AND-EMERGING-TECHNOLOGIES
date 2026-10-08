const router = require("express").Router();
const auth = require("../middleware/auth");
const { getMe, getAllUsers } = require("../controllers/user.controller");

// protected about me route
router.get("/me", auth, getMe);
// alias for about me
router.get("/about", auth, getMe);
// protected list of all users
router.get("/", auth, getAllUsers);

module.exports = router;

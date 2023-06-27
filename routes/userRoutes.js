const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authentication");
const { authorize } = require("../middleware/authorization");

const {
  getAllUsers,
  showCurrentUser,
  updateUserPassword,
} = require("../controllers/userController");

const { logout } = require("../controllers/authController");

const { updateUserPasswordValidator } = require("../validators/userValidators");

router.route("/showMe").get(authenticate, showCurrentUser);
router.route("/").get(authenticate, authorize("admin"), getAllUsers);
router
  .route("/updateUserPassword")
  .patch(authenticate, updateUserPasswordValidator, updateUserPassword, logout);

module.exports = router;

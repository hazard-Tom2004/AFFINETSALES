const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  changePassword,
} = require("../controllers/authController");
const {
  verifyToken,
  checkUserExists,
  checkEmailExists,
} = require("../middlewares/authMiddleware");

router.post("/sign-up", checkUserExists, register);
router.post("/login", login);
router.post("/forgot-password", checkEmailExists, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", verifyToken, updatePassword);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;

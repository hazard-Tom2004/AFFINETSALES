const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  getDashboardInfo,
  getProfile,
  updateProfile,
  updateProfileImage,
  getTopEarners,
  setTransactionPin,
} = require("../controllers/userController");

const router = express.Router();

router.get("/dashboard-info", verifyToken, getDashboardInfo);
router.get("/profile", verifyToken, getProfile);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/update-profile-image", verifyToken, updateProfileImage);
router.get("/top-earners", verifyToken, getTopEarners);
router.put("/transaction-pin", verifyToken, setTransactionPin);

module.exports = router;
/* 
image 
name 
rank
available balance
total earnings
affliate earnings
sub affliate earnings
referrals
referal link
referal code
transaction history

*/

const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  inaAppTransfer,
  getRecipientName,
  getAllTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/in-app-transfer", verifyToken, inaAppTransfer);
router.get("/get-all", verifyToken, getAllTransactions);
router.get("/recipient-name", verifyToken, getRecipientName);

module.exports = router;

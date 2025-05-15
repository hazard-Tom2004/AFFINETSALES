const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { createCourse, getCourses } = require("../controllers/courseController");

const router = express.Router();

router.post("/create", verifyToken, createCourse);
router.get("/get-all", verifyToken, getCourses);
router.put("/edit", verifyToken, getCourses);

module.exports = router;

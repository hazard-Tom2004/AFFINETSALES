const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");

dotenv.config();

// Middleware to verify token and protect routes
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Express headers are auto converted to lowercase

  if (!token) {
    return res.status(403).send({
      success: false,
      message: "A token is required for authentication",
    });
  }

  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
const obj ={
  name:"Isaac",
  age:10,
}
obj.occupation= "Jobless"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({
      success: false,
      message: "Invalid token",
    });
  }
  return next();
};

// for registration
const checkUserExists = async (req, res, next) => {
  const userEmail = req.body.email;
  const user = await User.findByEmail(userEmail);
  if (!user) {
    return next();
  }
  if (user) {
    return res.status(400).send({ msg: "User already exists" });
  }
};

/// For forgot password
const checkEmailExists = async (req, res, next) => {
  const userEmail = req.body.email;
  const user = await User.findByEmail(userEmail);

  if (user) {
    req.user = user;
    return next();
  }
  if (!user) {
    return res.status(404).send({ msg: "User not found" });
  }
};

module.exports = {
  verifyToken,
  checkUserExists,
  checkEmailExists,
};

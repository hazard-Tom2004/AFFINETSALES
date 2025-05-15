const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const dotenv = require("dotenv");
const User = require("../models/user");
const crypto = require("crypto");
const { generateUniqueReferralCode } = require("../utils/generateRefCode");
const { hashInfo } = require("../utils/hashInfo");

dotenv.config();

// Registration
exports.register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    referal_code,
    phone_number,
    country,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !confirm_password ||
    !phone_number ||
    !country
  ) {
    return res
      .status(400)
      .send({ msg: "All fields except referal code are required." });
  }

  try {
    const hash = await hashInfo(password);

    const existingRefCodes = await User.getAllRefCodes();
    console.log(
      "existing ref codes",
      existingRefCodes.map((code) => code.referal_code)
    );
    const user_ref_code = generateUniqueReferralCode(
      existingRefCodes.map((code) => code.referal_code)
    );
    console.log("new ref code", user_ref_code);
    const newUser = {
      first_name,
      last_name,
      email,
      password: hash,
      confirm_password,
      referal_code: referal_code || "D4MbaZ6FrZtM",
      phone_number,
      country,
      user_ref_code,
    };

    // Get users by ref code
    const directRef = await User.getUserByRefCode(newUser.referal_code); //The user who refered this new user
    const subRef = await User.getUserByRefCode(directRef.referred_by); // The user who refered the user that refered this new user
    console.log("Direct ref:", directRef);
    console.log("Sub ref:", subRef);
    // Credit the respective users
    //Update the table records
    await User.updateUserBalance(
      directRef.id,
      "affliate_bal",
      Number(directRef.affliate_bal) + 2000,
      Number(directRef.total_ref) + 1
    );

    await User.updateUserBalance(
      subRef.id,
      "sub_affliate_bal",
      Number(subRef.sub_affliate_bal) + 500
    );
    ///// Credits the user wallet
    await User.creditWallet(subRef.id, Number(subRef.available_bal) + 2000);
    const createdUser = await User.create(newUser);

    const token = jwt.sign(
      { id: createdUser.insertId, email: createdUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 3600,
      }
    );

    res.status(201).send({
      success: true,
      message: "Account created successfully",
      data: { id: createdUser.insertId, first_name, email },
      token,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send({ msg: "Server error" });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ msg: "Please enter all fields" });
  }

  const user = await User.findByEmail(email);
  console.log("User:", user);
  if (!user) {
    return res.status(400).send({ msg: "User does not exist" });
  }

  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (!isMatch) return res.status(400).send({ msg: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
    res.status(200).send({
      success: true,
      msg: "Login successfull",
      data: {
        // id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        email: user.email,
        country: user.country,
        // rank: user.rank,
        // affliate_bal: user.affliate_bal,
        // sub_affliate_bal: user.sub_affliate_bal,
        // image: user.image,
        // total_ref: user.total_ref,
        // referal_code: user.referal_code,
        token,
      },
    });
  });
};

//Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // const user = req.user;
  if (!email) {
    return res.status(400).send({ success: false, msg: "Email id required" });
  }
  //check if user exists before proceeding
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).send({ msg: "User not found" });
  }
  //Generate Password reset link
  try {
    const resetToken = crypto.randomBytes(40).toString("hex"); //generate reset token
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000); //token expires after 10 minutes
    const resetUrl = `https://affinetsales.com/auth/reset-password?token=${resetToken}`;

    // const hashedToken = await hashInfo(resetToken); //to hash the resetToken in the DB
    await User.invalidatePrevToken(email);
    await User.setPasswordResetToken(email, resetToken, expiredAt);
    /////  Send password reset link to user email here///

    res.status(200).send({
      success: true,
      msg: `Password reset link sent to email(${email})`,
      resetToken,
      resetUrl,
    });
  } catch (err) {
    res.status(500).send({ msg: "Server error", err });
  }
};

// Reset password when user is not logged in
exports.resetPassword = async (req, res) => {
  const { reset_token, new_password, confirm_new_password } = req.body;
  if (!reset_token || !new_password || !confirm_new_password) {
    return res
      .status(400)
      .send({ success: false, msg: "All fields are required." });
  }
  if (new_password != confirm_new_password) {
    return res
      .status(400)
      .send({ success: false, msg: "Passwords do not match." });
  }
  try {
    const currDate = new Date(Date.now());
    const tokenDetails = await User.getTokenDetails(reset_token, currDate);
    if (tokenDetails.length <= 0) {
      return res
        .status(500)
        .send({ success: false, msg: "Invalid or expired token" });
    }
    const user = await User.findByEmail(tokenDetails[0].email);
    const hashedNewPassword = await hashInfo(new_password);
    const updateResponse = await User.updatePassword(
      user.id,
      hashedNewPassword
    );
    await User.invalidatePrevToken(user.email);
    if (updateResponse.affectedRows) {
      res.status(200).send({
        success: true,
        msg: "Password reset successfull",
        tokenDetails,
      });
    }
  } catch (err) {
    return res.status(500).send({ success: false, msg: "Server error" });
  }
};

//update passsword for a logged in user
exports.updatePassword = async (req, res) => {
  const tokenInfo = req.user;
  console.log("User from token:", tokenInfo);

  const user = await User.findByEmail(tokenInfo.email);
  console.log("User from db:", tokenInfo);
  const { old_password, new_password, confirm_new_password } = req.body;
  if (!(old_password, new_password, confirm_new_password)) {
    return res.status(400).send({
      success: false,
      msg: "All fields are required",
    });
  }
  if (new_password != confirm_new_password) {
    return res.status(400).send({
      success: false,
      msg: "New passwords do not match!",
    });
  }
  try {
    bcrypt.compare(old_password, user.password, async (err, isMatch) => {
      if (!isMatch)
        return res
          .status(400)
          .send({ success: false, msg: "Invalid old password" });
      const hashedNewPassword = await hashInfo(new_password);
      await User.updatePassword(user.id, hashedNewPassword);

      res.status(200).send({
        success: true,
        msg: "Password updated successfully",
      });
    });
  } catch (err) {
    return res.status(500).send({ msg: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const { id, email } = req.user;
  if (!(old_password, new_password))
    return res
      .status(400)
      .send({ success: false, msg: "All fields are required" });

  try {
    const user = await User.findByEmail(email);
    bcrypt.compare(old_password, user.password, async (err, isMatch) => {
      if (err)
        return res.status(500).send({ msg: "Error validating passwords" });
      if (!isMatch)
        return res.status(400).send({ msg: "Invalid old password" });
      const hashedPwd = await hashInfo(new_password);
      const result = await User.updatePassword(id, hashedPwd);
      if (result.affectedRows) {
        return res.status(200).send({
          success: true,
          msg: "Password changed successfully",
        });
      } else {
        return res.status(500).send({
          suceess: false,
          msg: "Error changing password",
        });
      }
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: true, msg: "Internal server error" });
  }
};

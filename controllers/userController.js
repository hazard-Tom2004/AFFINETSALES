const User = require("../models/user");
const { hashInfo } = require("../utils/hashInfo");
const bcrypt = require("bcryptjs");

require("dotenv").config();

exports.getDashboardInfo = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    const {
      first_name,
      last_name,
      email,
      rank,
      image,
      affliate_bal,
      available_bal,
      sub_affliate_bal,
      referal_code,
      total_ref,
      amount_withdrawn,
    } = user;
    return res.status(200).send({
      success: true,
      msg: "User info fetched successfully",
      data: {
        first_name,
        last_name,
        email,
        rank,
        image,
        affliate_bal,
        sub_affliate_bal,
        referal_code,
        total_ref,
        amount_withdrawn,
        available_bal,
        total_earnings: Number(available_bal) + Number(amount_withdrawn),
        affliate_link: `https://affinetsales.com/auth/register?ref=${referal_code}`,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to fetch dashboard information" });
  }
};

exports.getProfile = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await User.findByEmail(email);
    return res.status(200).send({
      success: true,
      msg: "Details fetched successfully",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        image: user.image,
        address: user.address,
        bank_acc_name: user.bank_acc_name,
        bank_acc_num: user.bank_acc_num,
        bank_name: user.bank_name,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: true, msg: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.user;
  const { address, bank_acc_name, bank_acc_num, bank_name } = req.body;
  if (!(address, bank_acc_name, bank_acc_num, bank_name))
    return res
      .status(400)
      .send({ success: false, msg: "All fields are required" });
  try {
    const user = await User.updateProfile(id, {
      address,
      bank_acc_name,
      bank_acc_num,
      bank_name,
    });
    return res.status(200).send({
      success: true,
      msg: "Profile updated successfully",
      user,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: true, msg: "Internal server error" });
  }
};

exports.updateProfileImage = async (req, res) => {
  const { id } = req.user;
  const { image } = req.body;
  if (!image)
    return res
      .status(400)
      .send({ success: false, msg: "All fields are required" });
  try {
    const user = await User.updateProfileImage(id, image);
    return res.status(200).send({
      success: true,
      msg: "Profile image updated successfully",
      user,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: true, msg: "Internal server error" });
  }
};

exports.getTopEarners = async (req, res) => {
  try {
    const topEarners = await User.topEarners();
    return res.status(200).send({
      success: true,
      msg: "Top earners fetched successfully",
      topEarners,
    });
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, msg: "Internal server error" });
  }
};

exports.setTransactionPin = async (req, res) => {
  const { current_pin, transaction_pin } = req.body;
  const { email, id } = req.user;
  if (!transaction_pin)
    return res
      .status(400)
      .send({ success: false, msg: "Enter a transaction pin" });
  if (transaction_pin.length !== 4 || transaction_pin.includes(" "))
    return res
      .status(400)
      .send({ success: false, msg: "Transaction pin must be 4 digits." });

  try {
    const user = await User.findByEmail(email);
    const pin = await hashInfo(transaction_pin);
    console.log("THIS IS THE HASHED PIN", pin);
    if (!user.transaction_pin) {
      //If no existing pin, set new pin
      await User.setTransactionPin(id, pin);

      return res
        .status(200)
        .send({ success: true, msg: "Transaction pin set successfully" });
    } else {
      // if existing pin, verify existing pin before changing
      if (!current_pin)
        return res.status(400).send({
          success: false,
          msg: "You have an existing pin. Kindly enter your current pin",
        });
      bcrypt.compare(
        current_pin,
        user.transaction_pin,
        async (err, isMatch) => {
          if (!isMatch) {
            return res
              .status(400)
              .send({ success: false, msg: "Incorrect current pin" });
          } else {
            await User.setTransactionPin(id, pin);

            return res.status(200).send({
              success: true,
              msg: "Transaction pin changed successfully",
            });
          }
        }
      );
    }
  } catch (err) {
    return res
      .status(500)
      .send({ success: false, msg: "Internal server error" });
  }
};

const Transaction = require("../models/transaction");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

///////////////// This is the transfer function without roll-backs the issue with this is that, if one operation fails, some operations still get carried out which shouldn't be
exports.inaAppTransfer = async (req, res) => {
  const { id, email } = req.user;
  const { recipientId, amount, transaction_pin } = req.body;

  // Validate required fields
  if (!recipientId || !amount) {
    return res
      .status(400)
      .send({ success: false, msg: "All fields are required" });
  }

  if (!transaction_pin) {
    return res
      .status(400)
      .send({ success: false, msg: "Transaction pin is required" });
  }

  // Validate amount type
  if (typeof amount !== "number") {
    return res
      .status(400)
      .send({ success: false, msg: "Amount must be a number" });
  }

  // Validate minimum amount
  if (amount < 2000) {
    return res
      .status(400)
      .send({ success: false, msg: "Minimum transfer amount is #2000" });
  }

  try {
    const sender = await User.findByEmail(email);

    if (!sender) {
      return res.status(404).send({ success: false, msg: "Sender not found" });
    }

    if (!sender.transaction_pin) {
      return res.status(400).send({
        success: false,
        msg: "Transaction pin not set for the sender",
      });
    }

    // Log transaction_pin values for debugging
    console.log("Transaction Pin from Request:", transaction_pin);
    console.log("Transaction Pin from Sender:", sender.transaction_pin);

    // Validate transaction pin
    const isMatch = await bcrypt.compare(
      transaction_pin,
      sender.transaction_pin
    );
    if (!isMatch) {
      return res
        .status(400)
        .send({ success: false, msg: "Invalid transaction pin" });
    }

    // Prevent transfer to self
    if (recipientId.trim() === sender.referal_code) {
      return res
        .status(403)
        .send({ success: false, msg: "FORBIDDEN: Invalid operation" });
    }

    const recipient = await User.getUserByRefCode(recipientId);

    if (!recipient) {
      return res
        .status(404)
        .send({ success: false, msg: "Invalid recipient Id" });
    }

    console.log({ sender, recipient });

    // Check sender's balance
    if (Number(sender.available_bal) < amount) {
      return res
        .status(400)
        .send({ success: false, msg: "Insufficient balance" });
    }

    // Perform balance calculations
    const senderNewBalance = Number(sender.available_bal) - amount;
    const senderWithdrawnAmount = Number(sender.amount_withdrawn) + amount;
    const recipientNewBalance = Number(recipient.available_bal) + amount;
    //create transaction history for the sender

    const transferId = uuidv4();
    await Transaction.create(sender.id, {
      transferId,
      senderId: sender.id,
      recipientId: recipient.id,
      amount,
      bank: "Affinet Sales",
      category: "in-app-transfer",
      type: "debit",
      status: "completed",
      name: `${recipient.first_name} ${recipient.last_name}`,
    });
    await Transaction.create(recipient.id, {
      transferId,
      senderId: sender.id,
      recipientId: recipient.id,
      amount,
      bank: "Affinet Sales",
      category: "in-app-transfer",
      type: "credit",
      status: "completed",
      name: `${sender.first_name} ${sender.last_name}`,
    });
    // Update balances
    await User.debitWallet(sender.id, senderNewBalance, senderWithdrawnAmount);
    await User.creditWallet(recipient.id, recipientNewBalance);

    // Send success response
    return res.status(200).send({
      success: true,
      msg: `You just sent #${amount} to ${recipient.first_name}`,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ success: false, msg: "Internal server error" });
  }
};

//This is the one I really need to use but in uses pool which I didn't account for on project setup so using this breaks my code
// exports.inaAppTransfer = async (req, res) => {
//   const { id, email } = req.user;
//   const { recipientId, amount, transaction_pin } = req.body;

//   if (!recipientId || !amount || !transaction_pin) {
//     return res.status(400).send({
//       success: false,
//       msg: "All fields (recipientId, amount, transaction_pin) are required.",
//     });
//   }

//   if (typeof amount !== "number" || amount < 2000) {
//     return res.status(400).send({
//       success: false,
//       msg: "Amount must be a number and at least #2000.",
//     });
//   }

//   const connection = await db.getConnection(); // Acquire a connection from the pool

//   try {
//     // Begin transaction
//     await connection.beginTransaction();

//     // Fetch sender details
//     const [sender] = await connection.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (!sender) {
//       return res.status(404).send({ success: false, msg: "Sender not found." });
//     }

//     if (!sender.transaction_pin) {
//       return res.status(400).send({
//         success: false,
//         msg: "Transaction pin is not set.",
//       });
//     }

//     const isMatch = await bcrypt.compare(
//       transaction_pin,
//       sender.transaction_pin
//     );
//     if (!isMatch) {
//       return res.status(400).send({
//         success: false,
//         msg: "Invalid transaction pin.",
//       });
//     }

//     if (recipientId.trim() === sender.referal_code) {
//       return res.status(403).send({
//         success: false,
//         msg: "FORBIDDEN: Cannot transfer to yourself.",
//       });
//     }

//     // Fetch recipient details
//     const [recipient] = await connection.query(
//       "SELECT * FROM users WHERE referal_code = ?",
//       [recipientId]
//     );

//     if (!recipient) {
//       return res
//         .status(404)
//         .send({ success: false, msg: "Recipient not found." });
//     }

//     if (Number(sender.available_bal) < amount) {
//       return res.status(400).send({
//         success: false,
//         msg: "Insufficient balance.",
//       });
//     }

//     const transferId = uuidv4();

//     // Create transactions for sender and recipient
//     const transactionQueries = [
//       connection.query(
//         "INSERT INTO transactions (transferId, senderId, recipientId, amount, bank, category, type, status, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           transferId,
//           sender.id,
//           recipient.id,
//           amount,
//           "Affinet Sales",
//           "in-app-transfer",
//           "debit",
//           "completed",
//           `${recipient.first_name} ${recipient.last_name}`,
//         ]
//       ),
//       connection.query(
//         "INSERT INTO transactions (transferId, senderId, recipientId, amount, bank, category, type, status, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           transferId,
//           sender.id,
//           recipient.id,
//           amount,
//           "Affinet Sales",
//           "in-app-transfer",
//           "credit",
//           "completed",
//           `${sender.first_name} ${sender.last_name}`,
//         ]
//       ),
//     ];

//     await Promise.all(transactionQueries);

//     // Update balances
//     await Promise.all([
//       connection.query(
//         "UPDATE users SET available_bal = ?, amount_withdrawn = ? WHERE id = ?",
//         [
//           Number(sender.available_bal) - amount,
//           Number(sender.amount_withdrawn) + amount,
//           sender.id,
//         ]
//       ),
//       connection.query("UPDATE users SET available_bal = ? WHERE id = ?", [
//         Number(recipient.available_bal) + amount,
//         recipient.id,
//       ]),
//     ]);

//     // Commit transaction
//     await connection.commit();

//     return res.status(200).send({
//       success: true,
//       msg: `You just sent #${amount} to ${recipient.first_name}.`,
//     });
//   } catch (err) {
//     // Rollback on error
//     await connection.rollback();
//     console.error("Transfer Error:", err);
//     return res.status(500).send({
//       success: false,
//       msg: "Internal server error. Please try again.",
//     });
//   } finally {
//     connection.release(); // Release the connection back to the pool
//   }
// };

exports.getRecipientName = async (req, res) => {
  const { refCode } = req.query;
  try {
    const user = await User.getUserByRefCode(refCode);
    if (!user) {
      return res.status(400).send({ msg: "Invalid recipient id" });
    }

    return res
      .status(200)
      .send({ name: `${user.first_name} ${user.last_name}` });
  } catch (err) {
    return res.status(500).send({ msg: "Internal server error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  const { id } = req.user;
  try {
    const transactions = await Transaction.getTransactions(id);

    return res.status(200).send({
      success: true,
      msg: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: "Internal server error" });
  }
};

const db = require("../config/db");
class Transaction {
  static create(userId, details) {
    const {
      transferId,
      senderId,
      recipientId,
      amount,
      bank,
      category,
      type,
      status,
      name,
    } = details;
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO transactions_history (id, transferId, senderId, recipientId, amount, bank, category, type, status, userId, name) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transferId,
          senderId,
          recipientId,
          amount,
          bank,
          category,
          type,
          status,
          userId,
          name,
        ],
        (err, result) => {
          if (err) reject(err);

          resolve(result);
        }
      );
    });
  }

  static getTransactions(userId) {
    return new Promise((resolve, reject) => {
      console.log("Querying transactions...");
      db.query(
        "SELECT * FROM transactions_history WHERE ?? = ? ORDER BY createdAt DESC",
        ["userId", userId],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
}

module.exports = Transaction;

const db = require("../config/db");
const { getRank } = require("../utils/helpers");

class User {
  static create(user) {
    const query =
      "INSERT INTO users (first_name, last_name, email, password, phone_number, country, referred_by, referal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [
          user.first_name,
          user.last_name,
          user.email,
          user.password,
          user.phone_number,
          user.country,
          user.referal_code,
          user.user_ref_code,
        ],
        (err, result) => {
          if (err) {
            reject(err);
          }
          console.log("User creation result:", result);
          resolve(result);
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static getAllRefCodes() {
    return new Promise((resolve, reject) => {
      db.query("SELECT referal_code FROM users", (err, result) => {
        if (err) reject(err);
        console.log("All referal codes", result);
        resolve(result);
      });
    });
  }
  static getUserByRefCode(refCode) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE referal_code = ?",
        [refCode],
        (err, result) => {
          if (err) reject(err);

          resolve(result[0]);
        }
      );
    });
  }
  static updateUserBalance(userId, earning, amount, total_ref) {
    const rank = total_ref ? getRank(total_ref).toLowerCase() : null;
    console.log("User rank:", rank);

    let query, params;
    if (total_ref) {
      query = `UPDATE users SET ?? = ?, total_ref = ?, rank = ? WHERE id = ?`;
      params = [earning, amount, total_ref, rank, userId];
    } else {
      query = `UPDATE users SET ?? = ? WHERE id = ?`;
      params = [earning, amount, userId];
    }

    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
  static setPasswordResetToken(email, token, expires_at) {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO resetPasswordToken (email, token, expires_at) VALUES (?, ?, ?)",
        [email, token, expires_at],
        (err, result) => {
          if (err) {
            console.log("ERROR:", err);
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }
  static getTokenDetails(token, currDate) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM resetPasswordToken WHERE token = ? AND used != 1 AND expires_at > ?",
        [token, currDate],
        (err, result) => {
          if (err) {
            console.log("ERROR:", err);
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }
  static invalidatePrevToken(email) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE resetPasswordToken SET used = 1 WHERE email = ?",
        [email],
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }
  static updatePassword(id, password) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [password, id],
        (err, result) => {
          if (err) {
            reject(err);
          }
          console.log("Password update result:", result);
          resolve(result);
        }
      );
    });
  }
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE ?? = ?",
        ["id", id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static updateProfile(
    id,
    { address, bank_acc_name, bank_acc_num, bank_name }
  ) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET address = ?, bank_acc_name = ?, bank_acc_num = ?, bank_name = ? WHERE id = ?",
        [address, bank_acc_name, bank_acc_num, bank_name, id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static updateProfileImage(id, image) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET image = ? WHERE id = ?",
        [image, id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static topEarners() {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT first_name, last_name, rank, affliate_bal, country FROM users ORDER BY affliate_bal DESC",
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result);
        }
      );
    });
  }

  static debitWallet(id, amount, withdrawnamount) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET available_bal = ?, amount_withdrawn = ? WHERE id = ?",
        [amount, withdrawnamount, id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static creditWallet(id, amount) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET available_bal = ? WHERE id = ?",
        [amount, id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result[0]);
        }
      );
    });
  }
  static setTransactionPin(id, pin) {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET transaction_pin = ? WHERE id = ?",
        [pin, id],
        (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          }

          resolve(result);
        }
      );
    });
  }
}

module.exports = User;

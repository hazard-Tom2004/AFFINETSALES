const db = require("../config/db");

class Course {
  static async create(title, video_url, thumbnail, author) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO courses SET title = ?, video_url = ?, thumbnail = ?, author = ?`;

      db.query(query, [title, video_url, thumbnail, author], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM courses`;

      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
  static async edit(id, title, video_url, thumbnail, author) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE courses SET title = ?, video_url = ?, thumbnail = ?, author = ? WHERE id = ?`;

      db.query(
        query,
        [title, video_url, thumbnail, author, id],
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }
}

module.exports = Course;

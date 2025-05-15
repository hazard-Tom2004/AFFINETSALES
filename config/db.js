const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  console.log("Connected to DB")
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
});

module.exports = connection;

// const mysql = require("mysql2");
// const dotenv = require("dotenv");

// dotenv.config();

// // Create a connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10, // Maximum number of connections in the pool
//   queueLimit: 0, // No limit on queued connection requests
// });

// module.exports = pool;

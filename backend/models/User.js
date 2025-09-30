const db = require("../db");

const createUserTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `;

  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("✅ Users table ready");
  });
};

module.exports = { createUserTable };
 

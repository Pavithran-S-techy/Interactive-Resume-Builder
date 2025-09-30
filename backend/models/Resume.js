const db = require("../db");

const createResumeTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS resumes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      summary TEXT,
      education TEXT,
      experience TEXT,
      skills TEXT,
      template VARCHAR(50),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("✅ Resume table ready");
  });
};

module.exports = { createResumeTable };

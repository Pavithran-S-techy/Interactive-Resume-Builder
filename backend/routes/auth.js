const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// **SIGNUP ROUTE**
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ error: "Signup failed" });
        res.status(201).json({ message: "Signup successful" });
      }
    );
  });
});

// **LOGIN ROUTE**
router.post("/login", async (req, res) => {
  console.log("Login Request Body:", req.body);
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // **✅ Store user in session**
    req.session.user = { id: user.id, email: user.email };
    console.log("✅ Session after login:", req.session);

    res.json({ message: "Login successful", userId: user.id });
  });
});

console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  }
});

router.post("/forgot-password", async (req, res) => {
  console.log("✅ Forgot password request received");
  const { email } = req.body;
  console.log("📩 Email received:", email);

  if (!email) {
      console.error("❌ No email provided!");
      return res.status(400).json({ error: "Email is required" });
  }

  const userQuery = "SELECT * FROM users WHERE email = ?";
  db.query(userQuery, [email], async (err, results) => {
      if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
          console.warn("User not found with email:", email);
          return res.status(404).json({ error: "User not found" });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000);
      console.log("Generated reset token:", resetToken);

      const updateQuery = "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?";
      db.query(updateQuery, [resetToken, expiresAt, email], async (err) => {
          if (err) {
              console.error("Error updating reset token in DB:", err);
              return res.status(500).json({ error: "Database error while saving token" });
          }
          console.log("Reset token saved in DB successfully");

          const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Password Reset Request",
              html: `<p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error("Error sending email:", error);
                  return res.status(500).json({ error: "Failed to send email" });
              }
              console.log("Password reset email sent successfully:", info.response);
              return res.json({ message: "Password reset email sent successfully!" });
          });
      });
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  const sql = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()";
  db.query(sql, [token], async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const updateSql = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?";
      db.query(updateSql, [hashedPassword, token], (err) => {
          if (err) return res.status(500).json({ message: "Error updating password" });
          res.json({ message: "Password reset successfully!" });
      });
  });
});

module.exports = router;

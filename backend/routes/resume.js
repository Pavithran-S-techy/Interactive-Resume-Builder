const express = require("express");
const multer = require("multer");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Set up multer storage for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// **🔹 Save Resume**
router.post("/save", upload.single("profilePic"), (req, res) => {
  console.log("Received body keys:", Object.keys(req.body));
  let parsedResume;
  try {
    parsedResume = JSON.parse(req.body.resumeData);
  } catch (err) {
    console.error("❌ Error parsing JSON from resumeData:", err);
    return res.status(400).json({ error: "Invalid request data format" });
  }

  // Merge user_id from the FormData (if provided separately) into the parsed JSON object
  parsedResume.user_id = req.body.user_id || parsedResume.user_id;

  const { user_id, name, email, phone, summary, education, experience, skills, template, linkedin, extracurriculars } = parsedResume;

  if (!user_id || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Get uploaded profile picture file path if available
  const profilePicUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO resumes (user_id, name, email, phone, summary, education, experience, skills, template, linkedin, profile_pic, extracurriculars) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, 
    [user_id, name, email, phone, summary, education, experience, (skills || []).join(","), template, linkedin, profilePicUrl, extracurriculars],
    (err, result) => {
      if (err) {
        console.error("❌ Error saving resume:", err);
        return res.status(500).json({ error: "Error saving resume" });
      }
      res.status(201).json({ message: "✅ Resume saved successfully", resumeId: result.insertId, profilePicUrl });
    }
  );
});

// **🔹 Fetch Resumes for a User**
router.get("/user/:user_id", (req, res) => {
  console.log("🔍 Fetching resumes - Session data:", req.session);

  const { user_id } = req.params;
  const sessionUser = req.session.user;

  if (!sessionUser) {
    console.error("❌ No active session found.");
    return res.status(403).json({ error: "Unauthorized access" });
  }

  if (String(sessionUser.id) !== String(user_id)) {
    console.error(`❌ User ID mismatch. Session ID: ${sessionUser.id}, Requested ID: ${user_id}`);
    return res.status(403).json({ error: "Unauthorized access" });
  }

  db.query("SELECT * FROM resumes WHERE user_id = ?", [user_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching resumes:", err);
      return res.status(500).json({ error: "Error fetching resumes" });
    }
    result.forEach((resume) => {
      if (resume.profile_pic) {
        resume.profile_pic = `http://localhost:5000/uploads/${resume.profile_pic}`;
      }
    });
    res.json(result);
  });
});

// **🔹 Delete Resume**
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  // Check if user is logged in
  if (!req.session.user) {
    console.error("❌ Unauthorized delete attempt.");
    return res.status(403).json({ error: "Unauthorized access" });
  }

  db.query("DELETE FROM resumes WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting resume:", err);
      return res.status(500).json({ error: "Error deleting resume" });
    }
    res.json({ message: "✅ Resume deleted successfully" });
  });
});

module.exports = router;

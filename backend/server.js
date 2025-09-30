const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const { createUserTable } = require("./models/User");
const { createResumeTable } = require("./models/Resume");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const session = require("express-session");
const summaryRoute = require("./routes/summary");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// --- Set up CORS first ---
app.use(cors({
  origin: "http://localhost:3000",  // Allow requests from your frontend
  credentials: true                 // Allow cookies to be sent
}));

// --- Then set up session middleware ---
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      // false for HTTP; set to true when using HTTPS
    sameSite: "lax"     // "lax" works well for development
    // Note: Not setting "domain" here helps let the cookie default to the request domain.
  }
}));

// --- Body Parsing Middleware ---
app.use(express.json({ limit: "5mb" })); // Allows up to 5MB payloads
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use("/api", summaryRoute);
app.use("/uploads", express.static("uploads"));

// --- Ensure tables are created ---
createUserTable();
createResumeTable();


// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


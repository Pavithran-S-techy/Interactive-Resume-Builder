// backend/routes/summary.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.post("/generate-summary", async (req, res) => {
  const resumeData = req.body;
  const prompt = `
Generate a professional 3-4 sentence resume summary based on the following user details:

Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
Education: ${resumeData.education}
Experience: ${resumeData.experience}
Skills: ${resumeData.skills.join(", ")}
Extracurriculars: ${resumeData.extracurriculars}

The summary should be formal and suitable for a resume. Do not include personal contact details.
`;

  try {
    const apiResponse = await axios.post(
      "http://localhost:11434/api/generate", // ⬅️ changed URL to Ollama
      {
        model: "mistral", // ⬅️ specify the model you're using locally (llama2, mistral, gemma, etc.)
        prompt: prompt,
        stream: false,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = apiResponse.data;
    const summary =
      data.response || "Could not generate summary."; // ⬅️ updated data structure for Ollama

    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ summary: "Error generating summary." });
  }
});

module.exports = router;

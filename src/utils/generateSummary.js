export async function generateAISummary(resumeData) {
  try {
    const response = await fetch("http://localhost:5000/api/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeData),
    });

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
}

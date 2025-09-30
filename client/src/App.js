import "./index.css";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import Sidebar from "./Sidebar";
import html2canvas from "html2canvas";
import Login from "./login";
import Signup from "./signup"; 
import ForgotPassword from "./forgotpassword";
import ResetPassword from "./ResetPassword"; // Import ResetPassword page
import { generateAISummary } from './utils/generateSummary';


function App() {
 
  const [showResume, setShowResume] = useState(false);
  const [template, setTemplate] = useState("classic");
  const [page, setPage] = useState("home");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [savedResumes, setSavedResumes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);

  

  
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    experience: "",
    skills: [],
    profilePic: null,
    extracurriculars: "",
    template: "",
    linkedin: "", 
  });
  
  // ✅ Detect URL change and set `page` to "reset-password"
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname === "/reset-password" && urlParams.has("token")) {
      setPage("reset-password");
    }
  }, []);

  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file); // Save the file object for uploading
      // Optionally, if you want a preview, you can still convert it to base64:
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData({ ...resumeData, profilePic: reader.result }); // For preview only
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!resumeData.name || !resumeData.email || !resumeData.phone) {
      alert("Please fill in all required fields.");
      return;
    }
  
    try {
      const formData = new FormData();
      // Append user ID
      formData.append("user_id", localStorage.getItem("userId"));
      
      // Append the other resume data as a JSON string.
      // This will include all fields except the profile picture.
      const resumeInfo = { ...resumeData };
      delete resumeInfo.profilePic; // Remove profilePic so it's not duplicated.
      formData.append("resumeData", JSON.stringify(resumeInfo));
  
      // Append profilePic only if it's a File object.
      if (resumeData.profilePic && resumeData.profilePic instanceof File) {
        formData.append("profilePic", resumeData.profilePic);
      }
      
      const response = await fetch("http://localhost:5000/api/resumes/save", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("Resume saved successfully!");
        setShowResume(true);
      } else {
        alert("Failed to save resume: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error(err);
    }
  };
  
  
  /* Styled PDF (Image-Based) */
  const downloadStyledPDF = () => {
    const input = document.querySelector(".resume-preview");
  
    // Hide buttons temporarily
    const buttons = input.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.display = "none"));
  
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgWidth = 210; // A4 size in mm
      const pageHeight = 297;
      const margin = 10;
      const pdf = new jsPDF("p", "mm", "a4");
  
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageCanvasHeight = (canvas.width * (pageHeight - margin * 2)) / imgWidth;
  
      let pageCount = Math.ceil(canvas.height / pageCanvasHeight);
      let pageImageHeight = (pageHeight - margin * 2);
  
      for (let i = 0; i < pageCount; i++) {
        const pageCanvas = document.createElement("canvas");
        const context = pageCanvas.getContext("2d");
  
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;
  
        context.fillStyle = "white"; // Prevent transparency issues
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          i * pageCanvasHeight,
          canvas.width,
          pageCanvasHeight,
          0,
          0,
          canvas.width,
          pageCanvasHeight
        );
  
        const imgData = pageCanvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth - margin * 2, pageImageHeight);
      }
  
      pdf.save("resume_styled.pdf");
  
      // Restore buttons
      buttons.forEach((btn) => (btn.style.display = "block"));
    });
  };
  
  
  
  
  /* Simple PDF (Text-Based) */
  const downloadTextPDF = () => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Resume", 90, 20);
  
      if (resumeData.profilePic) {
        doc.addImage(resumeData.profilePic, "JPEG", 80, 30, 40, 40);  
      }
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      let y = 80;
  
      doc.text(`Name: ${resumeData.name}`, 20, y);
      y += 10;
      doc.text(`Email: ${resumeData.email}`, 20, y);
      y += 10;
      doc.text(`Phone: ${resumeData.phone}`, 20, y);
      y += 15;
  
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(resumeData.summary, 20, y, { maxWidth: 170 });
      y += 20;
  
      doc.setFont("helvetica", "bold");
      doc.text("Education:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(resumeData.education, 20, y, { maxWidth: 170 });
      y += 20;
  
      doc.setFont("helvetica", "bold");
      doc.text("Experience:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(resumeData.experience, 20, y, { maxWidth: 170 });
      y += 20;

      doc.setFont("helvetica", "bold");
      doc.text("Extracurricular Activities:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(resumeData.extracurriculars, 20, y, { maxWidth: 170 });
      y += 20;
  
      doc.setFont("helvetica", "bold");
      doc.text("Skills:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(resumeData.skills.join(", "), 20, y, { maxWidth: 170 });

  
      doc.save("resume_text.pdf");
  };
  
  const predefinedSkills = [
    "JavaScript", "Python", "React", "Node.js", "SQL",
    "C++", "Java", "HTML", "CSS", "Git", "AWS",
    "Machine Learning", "UI/UX Design", "Data Analysis"
  ];
  const handleSkillSelection = (skill) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData({ ...resumeData, skills: [...resumeData.skills, skill] });
    }
  };
  
  const handleCustomSkill = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newSkill = e.target.value.trim();
      if (!resumeData.skills.includes(newSkill)) {
        setResumeData({ ...resumeData, skills: [...resumeData.skills, newSkill] });
      }
      e.target.value = ""; // Clear input after adding skill
    }
  };
  
  const removeSkill = (skillToRemove) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const fetchResumes = async () => {
    try {
      const userId = localStorage.getItem("userId"); // ✅ Retrieve logged-in user ID
      if (!userId) {
        console.error("No user ID found. User might not be logged in.");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/resumes/user/${userId}`, {
        method: "GET",
        credentials: "include", // ✅ Ensure session cookies are sent
      }); // ✅ Updated to match backend route
      const data = await response.json();
      console.log("Fetched resumes:", data); // Debug log
      if (response.ok) {
        setSavedResumes(data);
      } else {
        console.error("Error fetching resumes:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
  

const deleteResume = async (resumeId) => {
  if (!window.confirm("Are you sure you want to delete this resume?")) return;

  try {
    const response = await fetch(`http://localhost:5000/api/resumes/delete/${resumeId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok) {
      fetchResumes(); // Refresh the list after deleting
    } else {
      alert("Failed to delete resume: " + data.error);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
  }
};

const loadResume = (resume) => {
  setResumeData({
    name: resume.name,
    email: resume.email,
    phone: resume.phone,
    summary: resume.summary,
    education: resume.education,
    experience: resume.experience,
    skills: resume.skills.split(","), // Convert skills back to array
    template: resume.template,
    linkedin: resume.linkedin || "",   
    extracurriculars: resume.extracurriculars || "",
  });

  setShowResume(true); // Show the resume preview
  setPage("home"); // Redirect to the home page to display the resume
};

const handleClearForm = () => {
  setResumeData({
    name: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    experience: "",
    skills: [],
    profilePic: null,
    extracurriculars: "",
    linkedin: "", 

  });
};

const handleGenerateAISummary = async () => {
  const summary = await generateAISummary(resumeData);
  setResumeData(prev => ({
    ...prev,
    summary: summary
  }));
};

const handleLogout = () => {
  // Clear user-specific data
  localStorage.removeItem("userId");
  setIsLoggedIn(false);
  setPage("login"); // or "home", if that's your desired default page after logout
  setShowResume(false);
  setSavedResumes([]);
  setResumeData({
    name: "",
    email: "",
    phone: "",
    summary: "",
    education: "",
    experience: "",
    skills: [],
    profilePic: null,
    extracurriculars: "",
    linkedin: "", 
  });
};

  
return (
  <div className="app-container">
    {page === "reset-password" ? (
      <ResetPassword />
    ) : !isLoggedIn ? (
      isForgotPassword ? (
        <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
      ) : isLogin ? (
        <Login 
          onForgotPassword={() => setIsForgotPassword(true)} 
          onSwitchToSignup={() => setIsLogin(false)} 
          onLoginSuccess={() => {
            // Since Login.js already sets localStorage,
            // simply update the App state here:
            setIsLoggedIn(true);
            setPage("home");
            // Optionally clear any residual resume data:
            setShowResume(false);
            setSavedResumes([]);
            setResumeData({
              name: "",
              email: "",
              phone: "",
              summary: "",
              education: "",
              experience: "",
              skills: [],
              profilePic: null,
              extracurriculars: "",
            });
        }}
        />
      ) : (
        <Signup 
          onSwitchToLogin={() => setIsLogin(true)} 
          onSignupSuccess={() => setIsLoggedIn(true)} 
        />
      )
    ) : (
      <>
        <Sidebar setPage={setPage} setIsLoggedIn={setIsLoggedIn} setShowResume={setShowResume} />
        <div className="content">
          {page === "home" && (
            <div className="resume-container">
              <h1 className="resume-title">Resume Builder</h1>
              {!showResume ? (
                <>
                  <label>Choose a Template:</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                    <option value="classic">Classic</option>
                    <option value="classicv2">ClassicV2</option>
                    <option value="classy">Modern</option>
                    <option value="creative">Creative</option>
                    <option value="elegant">Elegant</option>
                    <option value="tech">Tech</option>
                    <option value="corporate">Corporate</option>
                    <option value="infographic">Infographic</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="academic">Academic</option>
                  </select>

                  <form onSubmit={handleSubmit}>
                    <label>Upload Profile Picture:</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />

                    <label>Full Name:</label>
                    <input type="text" value={resumeData.name} onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })} />

                    <label>Email:</label>
                    <input type="email" value={resumeData.email} onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })} />

                    <label>Phone:</label>
                    <input
                      type="text"
                      value={resumeData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,10}$/.test(value)) {
                          setResumeData({ ...resumeData, phone: value });
                        }
                      }}
                      onBlur={() => {
                        if (resumeData.phone.length !== 10) {
                          alert("Phone number must be exactly 10 digits");
                          setResumeData({ ...resumeData, phone: "" });
                        }
                      }}
                      maxLength="10"
                      placeholder="Enter 10-digit phone number"
                      required
                    />



                    <label htmlFor="linkedin">LinkedIn Profile:</label>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        value={resumeData.linkedin || ""}
                        onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                      />

                    <label>Education:</label>
                    <textarea value={resumeData.education} onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })} />

                    <label>Experience:</label>
                    <textarea value={resumeData.experience} onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })} />

                    

                    <label>Extracurricular Activities:</label>
                    <textarea 
                      value={resumeData.extracurriculars} 
                      onChange={(e) => setResumeData({ ...resumeData, extracurriculars: e.target.value })} 
                      placeholder="E.g., Debate Club President, Football Team Captain, Volunteering at NGO..."
                    />

                    <label>Skills:</label>
                    <div className="skills-container">
                      <select onChange={(e) => handleSkillSelection(e.target.value)}>
                        <option value="">Select a predefined skill</option>
                        {predefinedSkills.map((skill, index) => (
                          <option key={index} value={skill}>{skill}</option>
                        ))}
                      </select>
                      <input type="text" placeholder="Type a skill and press Enter" onKeyDown={handleCustomSkill} />
                      <div className="selected-skills">
                        {resumeData.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill} <button onClick={() => removeSkill(skill)}>✖</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <label>Summary:</label>
                    <textarea value={resumeData.summary} onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })} />
                    <button type="button" onClick={handleGenerateAISummary}>
                    Generate AI Summary
                  </button>


                    <div className="buttons-container">
                          <button type="submit">Generate Resume</button>
                          <button type="button" onClick={handleClearForm} className="clear-btn">Clear</button>
                        </div>
                  </form>
                </>
              ) : (
                <div className={`resume-preview ${template}`}>
                  {resumeData.profilePic && <img src={resumeData.profilePic} alt="Profile" className="profile-pic" />}
                  <h2>{resumeData.name}</h2>
                  <p><strong>Email:</strong> {resumeData.email}</p>
                  <p><strong>Phone:</strong> {resumeData.phone}</p>
                  {resumeData.linkedin && (
                    <p>
                      <strong>LinkedIn:</strong>{" "}
                      <a href={resumeData.linkedin} target="_blank" rel="noopener noreferrer">
                        {resumeData.linkedin}
                      </a>
                    </p>
                  )}
                  <div className="resume-section">
                    <h3>Summary</h3>
                    <p>{resumeData.summary}</p>
                  </div>
                  <div className="resume-section">
                    <h3>Education</h3>
                    <p>{resumeData.education}</p>
                  </div>
                  <div className="resume-section">
                    <h3>Experience</h3>
                    <p>{resumeData.experience}</p>
                  </div>

                  {resumeData.extracurriculars && (
                    <>
                      <h3>Extracurricular Activities</h3>
                      <p>{resumeData.extracurriculars}</p>
                    </>
                  )}

                  <div className="resume-section">
                    <h3>Skills</h3>
                    <p>{resumeData.skills.join(", ")}</p>
                  </div>
                  <button onClick={() => setShowResume(false)} className="edit-btn">Edit Details</button>
                  <button onClick={downloadStyledPDF} className="download-btn">Download Styled PDF</button>
                  <button onClick={downloadTextPDF} className="download-btn">Download Simple PDF</button>
                </div>
              )}
            </div>
          )}
          {page === "my-resumes" && (
            <div className="resume-container">
              <h2>My Resumes</h2>
              <button onClick={fetchResumes}>Refresh</button>
              {savedResumes.length === 0 ? (
                <p>No saved resumes found.</p>
              ) : (
                <div className="resume-list">
                  {savedResumes.map((resume) => (
                    <div key={resume.id} className="resume-card">
                      <h3>{resume.name}</h3>
                      <p><strong>Phone:</strong> {resume.phone}</p>
                      <p><strong>Template:</strong> {resume.template}</p>
                      <button onClick={() => loadResume(resume)}>View</button>
                      <button onClick={() => deleteResume(resume.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {page === "logout" && (
            <>
              <h1>Logging Out...</h1>
              {setTimeout(() => handleLogout(), 1000)}
            </>
          )}
        </div>
      </>
    )}
  </div>
);
}

export default App;

# Interactive Resume Builder

An interactive web application that allows users to create professional resumes with ease. Users can log in with a valid Gmail ID and password, input their details, and generate multiple resumes using different templates. The platform also includes an AI-powered summary generator that creates a personalized career summary for each user.

---

## Features

- Authentication — Login/Signup with a valid Gmail ID and password.
- Interactive form — Add personal, educational, and work details.
- AI-powered summary — Automatically generates a career summary for each user.
- Multiple templates — Choose from a variety of resume templates.
- Multi-resume support — Each user can create and manage multiple resumes.
- Database integration — All resumes are securely stored in the database.
- Predefined and custom skills — Select or add your own skills.
- Profile picture upload.
- LinkedIn profile integration.
- Dashboard — Manage, edit, or delete saved resumes.
- Export to PDF — Download resumes.

---

## Tech Stack

**Frontend (React.js):**
- React.js
- HTML, CSS, JavaScript
- Axios or fetch for API calls

**Backend (Node.js & Express):**
- Node.js
- Express.js
- MySQL (or any SQL database) for user data and resumes
- express-session (or JWT) for authentication

**Tools:**
- Git & GitHub
- VS Code

---

## Project Structure

    interactive-resume-builder/
    │── backend/              # Node.js + Express backend
    │   ├── routes/           # Auth & resume routes
    │   ├── models/           # Database models
    │   ├── controllers/      # (optional) Request handlers
    │   ├── server.js         # Entry point
    │   └── db.js             # Database connection
    │
    │── client/               # React frontend
    │   ├── public/           # manifest.json, favicon.ico, robots.txt
    │   └── src/              # Entry point, components & pages
    │
    ├── .gitignore
    └── README.md
---

## Installation

### Clone the repository
```bash
git clone https://github.com/your-username/interactive-resume-builder.git
cd interactive-resume-builder
```
### Backend setup
```bash
cd backend
npm install
# configure your .env (DB credentials, any API keys) — DO NOT commit .env
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm start
```
### Usage

1. Open the frontend (usually at http://localhost:3000) and register or log in using a valid Gmail ID and password.
2. From the dashboard, create a new resume by filling in personal, education, skills, and work sections.
3. Use the AI summary generator to auto-create a professional summary.
4. Choose a template, preview the resume, and save it to the database.
5. Manage saved resumes from the dashboard (edit, delete, download as PDF).

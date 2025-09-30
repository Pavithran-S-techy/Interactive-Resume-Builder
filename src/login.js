import React, { useState } from "react";
import "./login.css";

const Login = ({ onForgotPassword, onSwitchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ Ensures session cookie is set
      });

      const data = await response.json();
      console.log("Login response:", data);
      if (response.ok) {
        localStorage.setItem("userId", data.userId);
        onLoginSuccess(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <p className="auth-link" onClick={onForgotPassword}>Forgot Password?</p>
      <p className="auth-link" onClick={onSwitchToSignup}>Don't have an account? Sign Up</p>
    </div>
  );
};

export default Login;

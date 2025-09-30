import React, { useState, useEffect } from "react";
import "./ResetPassword.css";
const ResetPassword = () => {
  const [token, setToken] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Get token safely from URL
  useEffect(() => {
    console.log("ResetPassword component mounted."); // Debug Log 1

    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    console.log("Extracted token:", resetToken); // Debug Log 2

    if (resetToken) {
      setToken(resetToken);
    } else {
      setMessage("Invalid or expired reset link.");
      console.log("No token found in URL."); // Debug Log 3
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset link.");
      console.log("No token, cannot reset password."); // Debug Log 4
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    console.log("Sending request to reset password..."); // Debug Log 5

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      setMessage(data.message || "Something went wrong.");
      console.log("Response from server:", data); // Debug Log 6
    } catch (error) {
      setMessage("Error resetting password. Please try again.");
      console.error("Error sending reset request:", error); // Debug Log 7
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      {!token ? (
        <p>Invalid or expired reset link.</p>
      ) : (
        <form onSubmit={handleResetPassword}>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;

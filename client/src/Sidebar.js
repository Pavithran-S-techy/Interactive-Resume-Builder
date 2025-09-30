
import React from "react";
import "./Sidebar.css";
import logo from "./assets/icon.png";

const Sidebar = ({ setPage, setIsLoggedIn, setShowResume }) => {
  return (
    <div className="sidebar">
      <img src={logo} alt="Logo" className="sidebar-logo" />
      <h2></h2>
      <ul>
        <li onClick={() => { setShowResume(false); setPage("home"); }}>Home</li>
        <li onClick={() => setPage("my-resumes")}>My Resumes</li>
        <li onClick={() => { setIsLoggedIn(false); setPage("home"); }}>Logout</li>
      </ul>
    </div>
  );
};

export default Sidebar;

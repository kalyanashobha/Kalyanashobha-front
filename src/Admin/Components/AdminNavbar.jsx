import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css'; 

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Clear Admin specific items
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');

    setIsOpen(false); 
    navigate('/admin/login'); 
  };

  // Function to handle navigating back home
  const handleBack = () => {
    navigate('/');
  };

  return (
    <nav className="an-navbar">
      <div className="an-navbar-container">

        {/* Left Side: Logo */}
        <div className="an-navbar-logo">
          <Link to="/admin/dashboard">
             <img src="/Kalyanashobha.png" alt="Kalyana Shobha Admin" />
          </Link>
        </div>

        {/* Right Side: Back Option */}
        <div className="an-nav-right">
          <button onClick={handleBack} className="an-btn-back">
            &#8592; Back
          </button>
        </div>

      </div>
    </nav>
  );
};

export default AdminNavbar;
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar/AdminSidebar";
import "./AdminLayout.css"; 

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-root-layout">
      
      {/* MOBILE HEADER (Visible only on mobile) */}
      <div className="admin-mobile-header">
        <div className="mobile-brand">
            {/* Replaced text with Logo Image */}
            <img 
              src="/Kalyanashobha.png" 
              alt="KalyanaShobha Logo" 
              className="mobile-logo" 
            />
        </div>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          {/* Animated Hamburger Icon */}
          <div className={`animated-hamburger ${isSidebarOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* SIDEBAR (Pass open state for mobile) */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <AdminSidebar closeMobileMenu={() => setIsSidebarOpen(false)} />
        {/* Overlay to close sidebar on click outside */}
        <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

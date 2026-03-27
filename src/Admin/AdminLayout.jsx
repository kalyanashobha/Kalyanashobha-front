import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar/AdminSidebar";
import "./AdminLayout.css"; 

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-root-layout">
      
      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">
        <div className="mobile-brand">
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
          {/* Smaller Animated Hamburger Icon */}
          <div className={`animated-hamburger ${isSidebarOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* OVERLAY (Moved outside so it doesn't slide with the sidebar) */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <AdminSidebar closeMobileMenu={() => setIsSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

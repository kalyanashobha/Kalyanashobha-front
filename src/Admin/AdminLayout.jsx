import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react"; // Removed Menu, kept X for the close button
import AdminSidebar from "./Sidebar/AdminSidebar";
import "./AdminLayout.css"; 

// Custom SVG matching the professional menu icon in your screenshot
const CustomMenuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="14" y2="18"></line>
  </svg>
);

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
        >
          {isSidebarOpen ? <X size={28} strokeWidth={1.5} color="#000000" /> : <CustomMenuIcon />}
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

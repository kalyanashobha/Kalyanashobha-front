import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./Sidebar/AdminSidebar";
import "./AdminLayout.css"; // We will create this below

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-root-layout">
      
      {/* MOBILE HEADER (Visible only on mobile) */}
      <div className="admin-mobile-header">
        <div className="mobile-brand">
            <span style={{color:'#D32F2F', fontWeight:'700'}}>Kalyana</span>Shobha
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
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

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";
import "./AdminLayout.css"; // Make sure to add basic styling for this layout

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // This function gets passed into the Sidebar
  const closeSidebar = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout-container">
      {/* Mobile Top Bar with Hamburger Menu */}
      <div className="mobile-topbar">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-title">KalyanaShobha Admin</span>
      </div>

      {/* Sidebar - Controlled by State */}
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? "open" : ""}`}>
        <AdminSidebar onClose={closeSidebar} />
      </div>

      {/* Overlay to close sidebar by clicking outside (optional but good practice) */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content Area */}
      <main className="admin-main-content">
        <Outlet /> {/* This renders your nested routes like Dashboard, Users, etc. */}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Keep track of the current route

  // FIX: Automatically close the mobile sidebar whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const closeSidebar = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout-container">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-title">KalyanaShobha Admin</span>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? "open" : ""}`}>
        <AdminSidebar onClose={closeSidebar} />
      </div>

      {/* Overlay to close sidebar by clicking outside */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content Area */}
      <main className="admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
}

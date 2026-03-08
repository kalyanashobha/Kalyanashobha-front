import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Heart, LogOut, CheckCircle, 
  Briefcase, Store, Award, Layers, HelpCircle, Target, FileCheck, 
  FileEdit, MessageSquare 
} from "lucide-react";
import axios from "axios";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Update state to hold specific tab counts
  const [stats, setStats] = useState({ 
    pendingReg: 0,
    newRequests: 0,      // Phase 1
    acceptedMatches: 0,  // Phase 2
    pendingData: 0       // NEW: For Data Approvals
  });

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: token };
      
      // Fetch both the stats and the specific tab data simultaneously 
      const [statsRes, phase1Res, phase2Res, pendingDataRes] = await Promise.all([
        axios.get("https://kalyanashobha-back.vercel.app/api/admin/stats", { headers }),
        axios.get("https://kalyanashobha-back.vercel.app/api/admin/interest/workflow?status=PendingAdminPhase1", { headers }),
        axios.get("https://kalyanashobha-back.vercel.app/api/admin/interest/workflow?status=PendingAdminPhase2", { headers }),
        axios.get("https://kalyanashobha-back.vercel.app/api/admin/pending-data", { headers }) // NEW: Fetching pending data
      ]);
      
      setStats({
        pendingReg: statsRes.data.success ? statsRes.data.stats.actionQueue.pendingRegistrationPayments : 0,
        newRequests: phase1Res.data.success ? phase1Res.data.data.length : 0,
        acceptedMatches: phase2Res.data.success ? phase2Res.data.data.length : 0,
        pendingData: pendingDataRes.data.success ? pendingDataRes.data.data.length : 0, // NEW: Setting count
      });

    } catch (e) {
      console.error("Failed to fetch sidebar stats", e);
    }
  };

  useEffect(() => {
    fetchCounts();
    window.addEventListener("paymentUpdated", fetchCounts);
    window.addEventListener("interestUpdated", fetchCounts);
    
    return () => {
        window.removeEventListener("paymentUpdated", fetchCounts);
        window.removeEventListener("interestUpdated", fetchCounts);
    }
  }, [location.pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  // Calculate the total actionable interests for the main badge
  const totalPendingInterests = stats.newRequests + stats.acceptedMatches;

  return (
    <aside className="ks-sidebar-container">
      <div className="ks-sidebar-header">
        <h2 className="ks-sidebar-title">KalyanaShobha</h2>
        <span className="ks-sidebar-subtitle">Admin Portal</span>
      </div>

      <nav className="ks-sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Users size={20} />
              <span>User Registry</span>
            </NavLink>
          </li>

          {/* Registration Approvals */}
          <li>
            <NavLink to="/admin/registration-approvals" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <CheckCircle size={20} />
                {stats.pendingReg > 0 && (
                  <span className="ks-notification-badge">{stats.pendingReg}</span>
                )}
              </div>
              <span>Reg. Approvals</span>
            </NavLink>
          </li>

           {/* Interest Approvals */}
          <li>
            <NavLink to="/admin/interest-approvals" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Heart size={20} />
                {totalPendingInterests > 0 && (
                  <span className="ks-notification-badge">{totalPendingInterests}</span>
                )}
              </div>
              <span>Interest Approvals</span>
            </NavLink>
          </li>

          {/* Agents */}
          <li>
            <NavLink to="/admin/agents" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Briefcase size={20} />
              <span>Agents</span>
            </NavLink>
          </li>

          {/* Vendors */}
          <li>
            <NavLink to="/admin/vendors" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Store size={20} />
              <span>Vendors</span>
            </NavLink>
          </li>

          {/* User Acceptance */}
          <li>
            <NavLink to="/admin/user-certificates" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Award size={20} /> 
              <span>User Acceptance</span>
            </NavLink>
          </li>
          
          {/* Add Community */}
          <li>
            <NavLink to="/admin/add-fields" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Layers size={20} /> 
              <span>Add Data</span>
            </NavLink>
          </li>
          
          {/* Vendor Leads */}
          <li>
            <NavLink to="/admin/vendor-leads" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <Target size={20} /> 
              <span>Vendor Leads</span>
            </NavLink>
          </li>

          {/* Help Center */}
          <li>
            <NavLink to="/admin/help-center" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <HelpCircle size={20} /> 
              <span>Help Center</span>
            </NavLink>
          </li>

          {/* Data Approval */}
          <li>
            <NavLink to="/admin/data-approval" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              {/* NEW: Added Badge Container for Data Approval */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <FileCheck size={20} /> 
                {stats.pendingData > 0 && (
                  <span className="ks-notification-badge">{stats.pendingData}</span>
                )}
              </div>
              <span>Data Approval</span>
            </NavLink>
          </li>

          {/* Manage Pages */}
          <li>
            <NavLink to="/admin/page-content" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <FileEdit size={20} /> 
              <span>Manage Pages</span>
            </NavLink>
          </li>

          {/* Add Testimonial */}
          <li>
            <NavLink to="/admin/add-testimonial" className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}>
              <MessageSquare size={20} /> 
              <span>Testimonials</span>
            </NavLink>
          </li>

        </ul>
      </nav>

      <div className="ks-sidebar-footer">
        <button onClick={handleLogout} className="ks-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

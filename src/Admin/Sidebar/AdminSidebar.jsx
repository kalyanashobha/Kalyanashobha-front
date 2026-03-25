import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Heart, LogOut, CheckCircle, 
  Briefcase, Store, Award, Layers, HelpCircle, Target, FileCheck, 
  FileEdit, MessageSquare, UserPlus, Settings, Crown 
} from "lucide-react";
import axios from "axios";
import "./AdminSidebar.css";

// 1. Accept 'closeSidebar' as a prop here
export default function AdminSidebar({ closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [stats, setStats] = useState({ 
    pendingReg: 0,
    newRequests: 0,      
    acceptedMatches: 0,  
    pendingData: 0,
    pendingPremium: 0,
    pendingVendorLeads: 0 
  });

  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('adminInfo'));
    if (info) setAdminInfo(info);
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      
      const headers = { 
        Authorization: token,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      const API_BASE = "https://kalyanashobha-back.vercel.app";
      const timestamp = new Date().getTime(); 
      
      const [statsRes, phase1Res, phase2Res, pendingDataRes, premiumRes, vendorLeadsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/interest/workflow?status=PendingAdminPhase1&t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/interest/workflow?status=PendingAdminPhase2&t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/pending-data?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/premium-requests?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/vendor-leads?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } }))
      ]);
      
      let newVendorLeadsCount = 0;
      if (vendorLeadsRes.data.success && vendorLeadsRes.data.data) {
          newVendorLeadsCount = vendorLeadsRes.data.data.filter(lead => lead.status === 'New').length;
      }

      setStats({
        pendingReg: statsRes.data.success ? statsRes.data.stats.actionQueue.pendingRegistrationPayments : 0,
        newRequests: phase1Res.data.success ? phase1Res.data.data.length : 0,
        acceptedMatches: phase2Res.data.success ? phase2Res.data.data.length : 0,
        pendingData: pendingDataRes.data.success ? pendingDataRes.data.data.length : 0, 
        pendingPremium: premiumRes.data.success ? premiumRes.data.data.filter(req => req.status === 'Pending').length : 0,
        pendingVendorLeads: newVendorLeadsCount 
      });

    } catch (e) {
      console.error("Failed to fetch sidebar stats", e);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    window.addEventListener("paymentUpdated", fetchCounts);
    window.addEventListener("interestUpdated", fetchCounts);
    window.addEventListener("dataUpdated", fetchCounts); 
    window.addEventListener("premiumUpdated", fetchCounts); 
    window.addEventListener("vendorLeadUpdated", fetchCounts); 

    window.addEventListener("focus", fetchCounts);

    const intervalId = setInterval(() => {
      fetchCounts();
    }, 30000); 
    
    return () => {
        window.removeEventListener("paymentUpdated", fetchCounts);
        window.removeEventListener("interestUpdated", fetchCounts);
        window.removeEventListener("dataUpdated", fetchCounts);
        window.removeEventListener("premiumUpdated", fetchCounts);
        window.removeEventListener("vendorLeadUpdated", fetchCounts);
        window.removeEventListener("focus", fetchCounts);
        clearInterval(intervalId);
    }
  }, [fetchCounts, location.pathname]); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    if (closeSidebar) closeSidebar(); // Close sidebar on logout too!
    navigate('/admin/login');
  };

  const totalPendingInterests = stats.newRequests + stats.acceptedMatches;

  const allLinks = [
    { id: "dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "users", path: "/admin/users", icon: <Users size={20} />, label: "User Registry" },
    { id: "reg-approvals", path: "/admin/registration-approvals", icon: <CheckCircle size={20} />, label: "Reg. Approvals", badge: stats.pendingReg },
    { id: "interest-approvals", path: "/admin/interest-approvals", icon: <Heart size={20} />, label: "Interest Approvals", badge: totalPendingInterests },
    { id: "data-approval", path: "/admin/data-approval", icon: <FileCheck size={20} />, label: "Data Approval", badge: stats.pendingData },
    { id: "premium-users", path: "/admin/premium-users", icon: <Crown size={20} />, label: "Premium Requests", badge: stats.pendingPremium },
    { id: "vendor-leads", path: "/admin/vendor-leads", icon: <Target size={20} />, label: "Vendor Leads", badge: stats.pendingVendorLeads },
    { id: "agents", path: "/admin/agents", icon: <Briefcase size={20} />, label: "Agents" },
    { id: "vendors", path: "/admin/vendors", icon: <Store size={20} />, label: "Vendors" },
    { id: "user-certificates", path: "/admin/user-certificates", icon: <Award size={20} />, label: "User Acceptance" },
    { id: "add-data", path: "/admin/add-fields", icon: <Layers size={20} />, label: "Add Data" },
    { id: "help-center", path: "/admin/help-center", icon: <HelpCircle size={20} />, label: "Help Center" },
    { id: "manage-pages", path: "/admin/page-content", icon: <FileEdit size={20} />, label: "Manage Pages" },
    { id: "testimonials", path: "/admin/add-testimonial", icon: <MessageSquare size={20} />, label: "Testimonials" },
    { id: "fee-settings", path: "/admin/fee-settings", icon: <Settings size={20} />, label: "Fee Settings" },
    { id: "create-moderator", path: "/admin/moderater", icon: <UserPlus size={20} />, label: "Create Moderator" }
  ];

  const filteredLinks = allLinks.filter(link => {
    if (!adminInfo) return false;
    if (adminInfo.role === 'SuperAdmin') return true;
    return adminInfo.permissions?.includes(link.id);
  });

  return (
    <aside className="ks-sidebar-container">
      <div className="ks-sidebar-header">
        <h2 className="ks-sidebar-title">KalyanaShobha</h2>
        <span className="ks-sidebar-subtitle">Admin Portal</span>
      </div>

      <nav className="ks-sidebar-nav">
        <ul>
          {filteredLinks.map((link) => (
            <li key={link.id}>
              {/* 2. Added onClick to trigger closeSidebar when a link is tapped */}
              <NavLink 
                to={link.path} 
                className={({ isActive }) => (isActive ? "ks-nav-link active" : "ks-nav-link")}
                onClick={() => {
                  if (closeSidebar) closeSidebar();
                }}
              >
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  {link.icon}
                  {link.badge > 0 && (
                    <span className="ks-notification-badge">{link.badge}</span>
                  )}
                </div>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
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

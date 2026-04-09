import React, { useEffect, useState, useCallback, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Heart, LogOut, CheckCircle, 
  Briefcase, Store, Award, Layers, HelpCircle, Target, FileCheck, 
  FileEdit, MessageSquare, UserPlus, Settings, Crown, ChevronDown, UserSearch
} from "lucide-react";
import axios from "axios";
import "./AdminSidebar.css";

export default function AdminSidebar({ closeMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const navRef = useRef(null);

  const [stats, setStats] = useState({ 
    pendingReg: 0,
    newRequests: 0,      
    acceptedMatches: 0,  
    pendingData: 0,
    pendingPremium: 0,
    pendingVendorLeads: 0,
    pendingHelpCenter: 0,
    pendingVendors: 0 // Added state for vendor approval requests
  });

  const [adminInfo, setAdminInfo] = useState(null);
  const [canScroll, setCanScroll] = useState(true); 

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

      // Added vendors endpoint to the Promise.all array to fetch unapproved vendors
      const [
        statsRes, phase1Res, phase2Res, pendingDataRes, 
        premiumRes, vendorLeadsRes, helpCenterRes, vendorsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/interest/workflow?status=PendingAdminPhase1&t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/interest/workflow?status=PendingAdminPhase2&t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/pending-data?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/premium-requests?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/vendor-leads?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/help-center/issues?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_BASE}/api/admin/vendors?t=${timestamp}`, { headers }).catch(() => ({ data: { success: false } }))
      ]);

      let newVendorLeadsCount = 0;
      if (vendorLeadsRes.data.success && vendorLeadsRes.data.data) {
          newVendorLeadsCount = vendorLeadsRes.data.data.filter(lead => lead.status === 'New').length;
      }

      let newHelpCenterCount = 0;
      if (helpCenterRes.data.success && helpCenterRes.data.data) {
          newHelpCenterCount = helpCenterRes.data.data.filter(issue => issue.status === 'Pending').length;
      }

      // Calculate pending vendors that are waiting for admin approval
      let pendingVendorsCount = 0;
      if (vendorsRes.data.success && vendorsRes.data.vendors) {
          pendingVendorsCount = vendorsRes.data.vendors.filter(v => !v.isApproved).length;
      }

      setStats({
        pendingReg: statsRes.data.success ? statsRes.data.stats.actionQueue.pendingRegistrationPayments : 0,
        newRequests: phase1Res.data.success ? phase1Res.data.data.length : 0,
        acceptedMatches: phase2Res.data.success ? phase2Res.data.data.length : 0,
        pendingData: pendingDataRes.data.success ? pendingDataRes.data.data.length : 0, 
        pendingPremium: premiumRes.data.success ? premiumRes.data.data.filter(req => req.status === 'Pending').length : 0,
        pendingVendorLeads: newVendorLeadsCount,
        pendingHelpCenter: newHelpCenterCount,
        pendingVendors: pendingVendorsCount // Set the count here
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
    window.addEventListener("helpCenterUpdated", fetchCounts); 
    window.addEventListener("vendorUpdated", fetchCounts); // Ensure it catches vendor updates
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
        window.removeEventListener("helpCenterUpdated", fetchCounts);
        window.removeEventListener("vendorUpdated", fetchCounts);
        window.removeEventListener("focus", fetchCounts);
        clearInterval(intervalId);
    }
  }, [fetchCounts, location.pathname]); 

  const totalPendingInterests = stats.newRequests + stats.acceptedMatches;

  const allLinks = [
    { id: "dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} />, iconColor: "#3B82F6", label: "Dashboard" },
    { id: "users", path: "/admin/users", icon: <Users size={18} />, iconColor: "#10B981", label: "User Registry" },
    { id: "premium-users", path: "/admin/premium-user", icon: <UserSearch size={18} />, iconColor: "#EF4444", label: "Premium Users" },
    { id: "reg-approvals", path: "/admin/registration-approvals", icon: <CheckCircle size={18} />, iconColor: "#0EA5E9", label: "Reg. Approvals", badge: stats.pendingReg },
    { id: "interest-approvals", path: "/admin/interest-approvals", icon: <Heart size={18} />, iconColor: "#EC4899", label: "Interest Approvals", badge: totalPendingInterests },
    { id: "data-approval", path: "/admin/data-approval", icon: <FileCheck size={18} />, iconColor: "#8B5CF6", label: "Data Approval", badge: stats.pendingData },
    { id: "premium-users", path: "/admin/premium-users", icon: <Crown size={18} />, iconColor: "#F59E0B", label: "Premium Requests", badge: stats.pendingPremium },
    { id: "vendor-leads", path: "/admin/vendor-leads", icon: <Target size={18} />, iconColor: "#14B8A6", label: "Vendor Leads", badge: stats.pendingVendorLeads },
    { id: "help-center", path: "/admin/help-center", icon: <HelpCircle size={18} />, iconColor: "#84CC16", label: "Help Center", badge: stats.pendingHelpCenter }, 
    
    // MOVED: Vendors is now above Agents and includes the notification badge
    { id: "vendors", path: "/admin/vendors", icon: <Store size={18} />, iconColor: "#F97316", label: "Vendors", badge: stats.pendingVendors },
    { id: "agents", path: "/admin/agents", icon: <Briefcase size={18} />, iconColor: "#64748B", label: "Agents" },
    
    { id: "user-certificates", path: "/admin/user-certificates", icon: <Award size={18} />, iconColor: "#EAB308", label: "User Acceptance" },
    { id: "add-data", path: "/admin/add-fields", icon: <Layers size={18} />, iconColor: "#6366F1", label: "Add Data" },
    { id: "manage-pages", path: "/admin/page-content", icon: <FileEdit size={18} />, iconColor: "#334155", label: "Manage Pages" },
    { id: "testimonials", path: "/admin/add-testimonial", icon: <MessageSquare size={18} />, iconColor: "#A855F7", label: "Testimonials" },
    { id: "fee-settings", path: "/admin/fee-settings", icon: <Settings size={18} />, iconColor: "#475569", label: "Fee Settings" },
    { id: "create-moderator", path: "/admin/moderater", icon: <UserPlus size={18} />, iconColor: "#2DD4BF", label: "Create Moderator" }
  ];

  const filteredLinks = allLinks.filter(link => {
    if (!adminInfo) return false;
    if (adminInfo.role === 'SuperAdmin') return true;
    return adminInfo.permissions?.includes(link.id);
  });

  const checkScroll = useCallback(() => {
    if (navRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = navRef.current;
      setCanScroll(scrollHeight - scrollTop > clientHeight + 5);
    }
  }, []);

  useEffect(() => {
    checkScroll(); 

    const timeoutId = setTimeout(() => {
      checkScroll();
    }, 150);

    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScroll);
    }
  }, [filteredLinks.length, checkScroll]); 

  const handleLogout = () => {
    if (closeMobileMenu) closeMobileMenu(); 

    const info = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const isSuperAdmin = info.role === 'SuperAdmin';

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');

    if (isSuperAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/moderator');
    }
  };

  const formatBadge = (count) => {
    if (!count || count <= 0) return null;
    return count > 99 ? '99+' : count;
  };

  return (
    <aside className="ks-sidebar-container">
      <div className="ks-sidebar-header">
        <h2 className="ks-sidebar-title">KalyanaShobha</h2>
        <span className="ks-sidebar-subtitle">
          {adminInfo?.role === 'SuperAdmin' ? 'Admin Portal' : 'Moderator Portal'}
        </span>
      </div>

      <div className="ks-nav-wrapper">
        <nav className="ks-sidebar-nav" ref={navRef} onScroll={checkScroll}>
          <ul>
            {filteredLinks.map((link) => (
              <li key={link.id}>
                <NavLink 
                  to={link.path} 
                  className={({ isActive }) => `ks-nav-link ${isActive ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  {({ isActive }) => (
                    <>
                      <div 
                        className="ks-nav-icon-wrapper" 
                        style={{ color: isActive ? '#FFFFFF' : link.iconColor }}
                      >
                        {link.icon}
                        {link.badge > 0 && (
                          <span className="ks-notification-badge">{formatBadge(link.badge)}</span>
                        )}
                      </div>
                      <span className="ks-nav-label">{link.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {canScroll && (
          <div className="ks-scroll-indicator">
            <ChevronDown size={20} color="#9CA3AF" />
          </div>
        )}
      </div>

      <div className="ks-sidebar-footer">
        <button onClick={handleLogout} className="ks-logout-btn">
          <LogOut size={18} />
          <span className="ks-nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

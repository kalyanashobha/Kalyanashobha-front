import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; 

import { 
  Users, UserCheck, UserX, 
  CheckCircle, Heart, Briefcase, Share2, Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      // Simulate slight delay to show off skeleton (optional, remove in production)
      // await new Promise(r => setTimeout(r, 1000)); 
      
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to load stats');
      }
    } catch (err) {
      setError('System Unavailable');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Card Component with Navigation
  const StatCard = ({ label, value, icon: Icon, path, colorType = "amber" }) => {
    // Define color styles based on type
    const styles = {
      amber: { color: '#D97706', bg: '#FFFBEB', border: 'hover:border-amber-400' }, // Amber-600
      red:   { color: '#DC2626', bg: '#FEF2F2', border: 'hover:border-red-400' },   // Red-600
    };

    const currentStyle = styles[colorType] || styles.amber;

    return (
      <div 
        className={`ks-stat-card ${path ? 'clickable' : ''}`} 
        onClick={() => path && navigate(path)}
      >
        <div className="ks-card-header">
          <div 
            className="ks-icon-box" 
            style={{ color: currentStyle.color, backgroundColor: currentStyle.bg }}
          >
            {Icon && <Icon size={22} strokeWidth={2} />}
          </div>
          <span className="ks-trend-indicator">●</span>
        </div>

        <div className="ks-card-body">
          <h2 className="ks-stat-value">
            {value !== undefined ? value.toLocaleString() : '0'}
          </h2>
          <p className="ks-stat-label">{label}</p>
        </div>
      </div>
    );
  };

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="ks-stat-card skeleton-wrapper">
      <div className="ks-card-header">
        <div className="skeleton-icon skeleton-pulse"></div>
      </div>
      <div className="ks-card-body">
        <div className="skeleton-text-lg skeleton-pulse"></div>
        <div className="skeleton-text-sm skeleton-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="ks-dashboard-container">
      
      {/* Header */}
      <header className="ks-page-header">
        <div>
          <h1 className="ks-title">Overview</h1>
          <p className="ks-subtitle">Welcome back, Admin</p>
        </div>
        <div className="ks-date-pill">
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {error && <div className="ks-alert-banner">{error}</div>}

      <div className="ks-grid-layout">
        
        {/* SECTION: USER METRICS */}
        <div className="ks-section-wrapper">
          <h3 className="ks-section-title">User Registry</h3>
          <div className="ks-metrics-grid">
            {loading ? (
              <>
                <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard 
                  label="Total Users" 
                  value={stats?.users?.total} 
                  icon={Users} 
                  path="/admin/users"
                  colorType="amber"
                />
                <StatCard 
                  label="Male Profiles" 
                  value={stats?.users?.males} 
                  icon={UserCheck} 
                  path="/admin/users" 
                  colorType="amber"
                />
                <StatCard 
                  label="Female Profiles" 
                  value={stats?.users?.females} 
                  icon={UserCheck} 
                  path="/admin/users" 
                  colorType="red"
                />
                <StatCard 
                  label="Restricted / Blocked" 
                  value={stats?.users?.blocked} 
                  icon={UserX} 
                  path="/admin/users" 
                  colorType="red"
                />
              </>
            )}
          </div>
        </div>

        {/* SECTION: BUSINESS HEALTH */}
        <div className="ks-section-wrapper">
          <h3 className="ks-section-title">Business & Activity</h3>
          <div className="ks-metrics-grid">
            {loading ? (
              <>
                <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard 
                  label="Active Agents" 
                  value={stats?.referrals?.totalAgents} 
                  icon={Briefcase} 
                  path="/admin/agents" 
                  colorType="amber"
                />
                <StatCard 
                  label="Interests Sent" 
                  value={stats?.platformHealth?.totalInterestsSent} 
                  icon={Heart} 
                  path="/admin/interest-approvals" 
                  colorType="red"
                />
                <StatCard 
                  label="Successful Matches" 
                  value={stats?.platformHealth?.successfulMatches} 
                  icon={CheckCircle} 
                  path="/admin/registration-approvals" 
                  colorType="amber"
                />
                <StatCard 
                  label="Referrals Made" 
                  value={stats?.referrals?.totalReferredUsers} 
                  icon={Share2} 
                  path="/admin/agents" 
                  colorType="red"
                />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CreditCard, LogOut, Link as LinkIcon, 
  Plus, X, Clock, ChevronRight, Activity,
  User, IdCard, MapPin, Briefcase, Heart, UserPlus, CheckCircle,
  Mail, Phone, Lock, Calendar, GraduationCap, Building2, Wallet,
  Ruler, Utensils, Globe, Map, UserCircle
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import './AgentPortal.css'; 

const API_BASE = "https://kalyanashobha-back.vercel.app/api/agent";
const PUBLIC_API_BASE = "https://kalyanashobha-back.vercel.app/api/public";

// --- SKELETON LOADERS ---
const StatSkeleton = () => (
  <div className="app-skeleton-grid">
    {[1, 2, 3].map((i) => (
      <div key={i} className="app-skeleton-card">
        <div className="app-sk-line short"></div>
        <div className="app-sk-line big"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="app-skeleton-table">
    <div className="app-sk-header"></div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="app-sk-row">
        <div className="app-sk-cell"></div>
        <div className="app-sk-cell"></div>
        <div className="app-sk-cell"></div>
      </div>
    ))}
  </div>
);

// --- HELPER FUNCTION FOR HEIGHT CONVERSION ---
const formatHeightOption = (val) => {
  const cm = parseInt(val, 10);
  if (isNaN(cm)) return val; 
  
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return `${feet} ft ${inches} in (${cm} cm)`;
};

// --- CUSTOM SEARCHABLE COMBO INPUT ---
const AgentComboInput = ({ label, name, value, onChange, options, required, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState(options || []);
    const wrapperRef = useRef(null);
  
    useEffect(() => { setFiltered(options || []); }, [options]);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    const handleInputChange = (e) => {
      onChange(e); 
      setIsOpen(true);
      const val = e.target.value.toLowerCase();
      setFiltered((options || []).filter(opt => {
         const text = typeof opt === 'string' ? opt : opt.name;
         return text.toLowerCase().includes(val);
      }));
    };
  
    const handleSelect = (val) => {
      onChange({ target: { name, value: val } });
      setIsOpen(false);
    };
  
    return (
      <div className={`app-input-wrap ${Icon ? 'app-with-icon' : ''}`} ref={wrapperRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
        <label>{label} {required && '*'}</label>
        <div className="app-input-inner" style={{ position: 'relative' }}>
          {Icon && <Icon size={18} className="app-field-icon" />}
          <input 
            type="text" name={name} value={value} onChange={handleInputChange} 
            onFocus={() => { setIsOpen(true); setFiltered(options || []); }}
            placeholder={placeholder || "Type or select..."} required={required} autoComplete="off"
          />
          {isOpen && filtered && filtered.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', 
              zIndex: 100, padding: '5px', margin: '5px 0 0 0', listStyle: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {filtered.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.name;
                return (
                  <li key={idx} onClick={() => handleSelect(text)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', color: '#334155' }}
                      onMouseEnter={(e) => { e.target.style.backgroundColor = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}>
                    {text}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    );
};

const AgentDashboard = () => {
  const navigate = useNavigate();

  // State
  const [token] = useState(localStorage.getItem('agentToken'));
  const [agentInfo] = useState(JSON.parse(localStorage.getItem('agentInfo') || 'null'));

  const [activeTab, setActiveTab] = useState('overview'); 
  const [stats, setStats] = useState({ totalReferrals: 0, paidReferrals: 0, pendingApprovals: 0 });
  const [usersList, setUsersList] = useState([]);
  const [memPayments, setMemPayments] = useState([]);
  const [interestsStatus, setInterestsStatus] = useState([]); 
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Dynamic States from Master Data
  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);
  const [dynamicOptions, setDynamicOptions] = useState({
      Education: [], Designation: [], Income: [], Country: [], State: [], City: [], Height: [], Diet: []
  });

  // UI States
  const [showImageModal, setShowImageModal] = useState(null); 
  const [regLoading, setRegLoading] = useState(false);
  
  // Registration Flow State
  const [regStep, setRegStep] = useState(1);
  const TOTAL_STEPS = 6;

  const [regData, setRegData] = useState({
    profileFor: 'Client', firstName: '', lastName: '', gender: 'Male', dob: '', 
    maritalStatus: 'Never Married', height: '', diet: '',
    community: '', caste: '', subCommunity: '', gothra: '',
    country: '', state: '', city: '', residentsIn: 'Own',
    highestQualification: '', collegeName: '', workType: 'Private', 
    jobRole: '', companyName: '', annualIncome: '',
    mobileNumber: '', email: '', password: ''
  });

  // Effects
  useEffect(() => {
    if (!token) {
      navigate('/agent/login', { replace: true });
      return;
    }
    fetchAllData();
    fetchCommunities();
    fetchDynamicMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchAllData = async () => {
    setDashboardLoading(true);
    try {
      const headers = { Authorization: token };
      const [sRes, uRes, mpRes, isRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/users`, { headers }), 
        fetch(`${API_BASE}/payments/registrations`, { headers }),
        fetch(`${API_BASE}/users/interests`, { headers }) 
      ]);

      const [sData, uData, mpData, isData] = await Promise.all([
        sRes.json(), uRes.json(), mpRes.json(), isRes.json()
      ]);

      if(sData.success) setStats(sData.stats);
      if(uData.success) setUsersList(uData.users);
      if(mpData.success) setMemPayments(mpData.payments);
      if(isData.success) setInterestsStatus(isData.data);

    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
      const data = await response.json();
      if (data.success) {
        setMasterCommunities(data.data);
      }
    } catch (err) {
      console.error("Failed to load communities", err);
    }
  };

  const fetchDynamicMasterData = async () => {
      const categories = ['Education', 'Designation', 'Income', 'Country', 'State', 'City', 'Height', 'Diet'];
      const newOptions = { ...dynamicOptions };
      
      await Promise.all(categories.map(async (category) => {
        try {
          const res = await fetch(`${PUBLIC_API_BASE}/master-data/${category}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            if (category === 'Height') {
              // Convert raw CM numbers to formatted string for the dropdown options
              newOptions[category] = json.data.map(item => formatHeightOption(item.name));
            } else {
              newOptions[category] = json.data.map(item => item.name);
            }
          }
        } catch (err) { console.error(`Failed to fetch master data for ${category}`); }
      }));
      
      setDynamicOptions(newOptions);
  };

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentInfo');
    navigate('/agent/login', { replace: true });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/registration?refId=${agentInfo?.id || agentInfo?._id}&refName=${encodeURIComponent(agentInfo?.name)}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral Link Copied!"); 
  };

  const renderStatusBadge = (status, isBoolean = false) => {
    if (isBoolean) {
      return status ? <span className="app-badge app-badge-success">Active</span> : <span className="app-badge app-badge-pending">Pending</span>;
    }
    const s = status?.toLowerCase() || '';
    if (s.includes('success') || s.includes('accepted')) return <span className="app-badge app-badge-success">{status}</span>;
    if (s.includes('reject') || s.includes('decline')) return <span className="app-badge app-badge-danger">{status}</span>;
    return <span className="app-badge app-badge-pending">{status || 'Pending'}</span>;
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    if (name === 'community') {
      setRegData({ ...regData, community: value, caste: '', subCommunity: '' });
      const found = masterCommunities.find(c => c.name === value);
      if (found) setAvailableSubCommunities(found.subCommunities || []);
      else setAvailableSubCommunities([]);
    } else {
      setRegData({ ...regData, [name]: value });
    }
  };

  const nextRegStep = () => setRegStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prevRegStep = () => setRegStep(prev => Math.max(prev - 1, 1));

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if(regStep < TOTAL_STEPS) {
        nextRegStep();
        return;
    }

    setRegLoading(true);
    const toastId = toast.loading("Registering new client...");

    // Extract exactly the numeric CM value out of the formatted string (e.g., "5 ft 3 in (160 cm)" -> 160)
    const heightString = regData.height ? regData.height.toString() : "";
    const cmMatch = heightString.match(/\((\d+)\s*cm\)/) || heightString.match(/\d+/g);
    const numericHeight = cmMatch ? parseInt(cmMatch.pop(), 10) : 0;

    const payload = {
      ...regData,
      subCommunity: regData.caste, 
      height: numericHeight, // Sending only the raw number as requested
      rawHeight: numericHeight, 
      referredByAgentId: agentInfo?.id || agentInfo?._id,
      referredByAgentName: agentInfo?.name,
      referralType: "manual"
    };

    try {
      const res = await fetch(`${API_BASE}/register-user`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        toast.update(toastId, { render: "Client Successfully Registered!", type: "success", isLoading: false, autoClose: 3000 });
        setRegData({ 
          profileFor: 'Client', firstName: '', lastName: '', gender: 'Male', dob: '', 
          maritalStatus: 'Never Married', height: '', diet: '',
          community: '', caste: '', subCommunity: '', gothra: '',
          country: '', state: '', city: '', residentsIn: 'Own',
          highestQualification: '', collegeName: '', workType: 'Private', 
          jobRole: '', companyName: '', annualIncome: '',
          mobileNumber: '', email: '', password: ''
        });
        setAvailableSubCommunities([]); 
        setRegStep(1);
        setActiveTab('users'); 
        fetchAllData(); 
      } else {
        toast.update(toastId, { render: data.message || "Registration Failed", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) { 
        toast.update(toastId, { render: "Network Error", type: "error", isLoading: false, autoClose: 3000 });
    } finally { setRegLoading(false); }
  };

  if (!token) return null; 

  return (
    <div className="app-crm-layout">
      <ToastContainer position="top-center" theme="colored" />

      {/* --- MOBILE HEADER --- */}
      <header className="app-mobile-header">
        <div className="app-mob-agent-info">
          <div className="app-mob-avatar">{agentInfo?.name?.charAt(0) || 'A'}</div>
          <div className="app-mob-details">
            <span className="app-mob-name">{agentInfo?.name || 'Agent'}</span>
            <span className="app-mob-id">ID: {agentInfo?.agentCode || 'AGENT'}</span>
          </div>
        </div>
        <button className="app-mob-logout" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </header>

      {/* --- SIDEBAR / BOTTOM NAV --- */}
      <aside className="app-crm-sidebar">
        <div className="app-sidebar-brand desktop-only">
          <div className="app-brand-logo">K</div>
          <div className="app-brand-text">
            <h2>KalyanaShobha</h2>
            <span>Agent Portal</span>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <Clock size={20} /> <span>Overview</span>
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={20} /> <span>Directory</span>
          </button>
          
          <button className={`app-nav-highlight ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            <UserPlus size={20} /> <span>Register</span>
          </button>

          <button className={activeTab === 'mem_payments' ? 'active' : ''} onClick={() => setActiveTab('mem_payments')}>
            <CreditCard size={20} /> <span>Payments</span>
          </button>
          <button className={activeTab === 'int_status' ? 'active' : ''} onClick={() => setActiveTab('int_status')}>
            <Activity size={20} /> <span>Activity</span>
          </button>
        </nav>

        <div className="app-sidebar-footer desktop-only">
          <button className="app-logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="app-crm-main">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="app-animate-fade">
            <header className="app-page-header">
              <div className="app-header-title-group">
                <h1>Dashboard Overview</h1>
                <p className="app-subtitle">Welcome back, {agentInfo?.name}</p>
              </div>
              <button className="app-btn-outline" onClick={copyLink}>
                <LinkIcon size={16} /> <span className="desktop-text">Copy Invite Link</span><span className="mobile-text">Copy Link</span>
              </button>
            </header>

            {dashboardLoading ? <StatSkeleton /> : (
              <div className="app-metric-grid">
                 <div className="app-metric-card">
                    <div className="app-metric-icon bg-blue-light"><Users size={24} className="text-blue" /></div>
                    <div className="app-metric-data">
                      <span className="app-metric-label">Total Referrals</span>
                      <span className="app-metric-val">{stats.totalReferrals}</span>
                    </div>
                 </div>
                 <div className="app-metric-card">
                    <div className="app-metric-icon bg-green-light"><CheckCircle size={24} className="text-green" /></div>
                    <div className="app-metric-data">
                      <span className="app-metric-label">Paid Conversions</span>
                      <span className="app-metric-val">{stats.paidReferrals}</span>
                    </div>
                 </div>
                 <div className="app-metric-card">
                    <div className="app-metric-icon bg-orange-light"><Activity size={24} className="text-orange" /></div>
                    <div className="app-metric-data">
                      <span className="app-metric-label">Pending Action</span>
                      <span className="app-metric-val">{stats.pendingApprovals}</span>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* DIRECTORY TAB */}
        {activeTab === 'users' && (
          <div className="app-animate-fade">
            <header className="app-page-header">
               <div className="app-header-title-group">
                 <h1>Client Directory</h1>
                 <p className="app-subtitle">Manage all your registered clients</p>
               </div>
               <button className="app-btn-primary app-btn-green" onClick={() => setActiveTab('register')}>
                 <Plus size={16} /> <span>Register New</span>
               </button>
            </header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="app-data-table-wrapper">
                <table className="app-data-table">
                  <thead><tr><th>Client Profile</th><th>Contact</th><th>Status</th><th>Registered Date</th></tr></thead>
                  <tbody>
                    {usersList.length === 0 && <tr><td colSpan="4" className="app-empty">No clients found.</td></tr>}
                    {usersList.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="app-cell-primary">{u.firstName} {u.lastName}</div>
                          <div className="app-cell-secondary">{u.uniqueId}</div>
                        </td>
                        <td>
                          <div className="app-cell-primary">{u.mobileNumber}</div>
                        </td>
                        <td>{renderStatusBadge(u.isPaidMember, true)}</td>
                        <td className="app-cell-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- REGISTER CLIENT TAB --- */}
        {activeTab === 'register' && (
          <div className="app-animate-fade app-register-page">
            <header className="app-page-header">
              <div className="app-header-title-group">
                <h1>Register New Client</h1>
                <p className="app-subtitle">Fill in the details to add a new premium profile to your directory</p>
              </div>
            </header>

            <div className="app-register-card">
              {/* Premium Stepper */}
              <div className="app-modern-stepper">
                {Array.from({length: TOTAL_STEPS}, (_, i) => i + 1).map(step => (
                  <div key={step} className={`app-step-item ${regStep > step ? 'completed' : ''} ${regStep === step ? 'current' : ''}`}>
                    <div className="app-step-circle">
                      {regStep > step ? <CheckCircle size={16} strokeWidth={3} /> : step}
                    </div>
                    {step < TOTAL_STEPS && <div className="app-step-line"></div>}
                  </div>
                ))}
              </div>

              <div className="app-register-body">
                <form id="app-agent-reg-form" onSubmit={handleRegisterSubmit}>
                  
                  {/* STEP 1: Profile Intent */}
                  {regStep === 1 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-profile-setup-header">
                        <div className="app-profile-top-icon">
                          <User size={36} color="#f97316" strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="app-form-group">
                        <h3 className="app-screenshot-heading">This profile is for</h3>
                        <div className="app-pill-options">
                            {['Client', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Friend'].map(opt => (
                                <button 
                                  type="button" 
                                  key={opt} 
                                  className={`app-pill-btn ${regData.profileFor === opt ? 'active' : ''}`} 
                                  onClick={() => setRegData({...regData, profileFor: opt})}
                                >
                                  {regData.profileFor === opt ? (
                                    <CheckCircle className="pill-check" size={20} fill="#dc2626" color="white" />
                                  ) : (
                                    <div className="pill-uncheck"></div>
                                  )}
                                  <span>{opt}</span>
                                </button>
                            ))}
                        </div>
                      </div>

                      <div className="app-form-group mt-5">
                        <h3 className="app-screenshot-heading">Gender</h3>
                        <div className="app-pill-options">
                            {['Male', 'Female'].map(gen => (
                                <button 
                                  type="button" 
                                  key={gen} 
                                  className={`app-pill-btn ${regData.gender === gen ? 'active' : ''}`} 
                                  onClick={() => setRegData({...regData, gender: gen})}
                                >
                                  {regData.gender === gen ? (
                                    <CheckCircle className="pill-check" size={20} fill="#dc2626" color="white" />
                                  ) : (
                                    <div className="pill-uncheck"></div>
                                  )}
                                  <span>{gen}</span>
                                </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Account Setup (UPDATED WITH PHONE INPUT) */}
                  {regStep === 2 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-step-header">
                        <div className="app-step-icon bg-indigo"><UserPlus size={24} /></div>
                        <div>
                          <h2>Account Credentials</h2>
                          <p>Contact and login details.</p>
                        </div>
                      </div>

                      <div className="app-form-grid mt-4">
                        
                        {/* --- NEW PHONE INPUT INTEGRATION --- */}
                        <div className="app-input-wrap">
                          <label>Mobile Number *</label>
                          <PhoneInput
                              country={'in'} 
                              value={regData.mobileNumber}
                              onChange={(phone) => setRegData({ ...regData, mobileNumber: phone })}
                              inputProps={{
                                  name: 'mobileNumber',
                                  required: true,
                              }}
                              inputStyle={{ 
                                  width: '100%', 
                                  height: '42px', 
                                  fontSize: '0.95rem', 
                                  borderRadius: '8px', 
                                  border: '1px solid #cbd5e1',
                                  color: '#0f172a'
                              }}
                              buttonStyle={{ 
                                  borderRadius: '8px 0 0 8px', 
                                  border: '1px solid #cbd5e1', 
                                  backgroundColor: '#f8fafc',
                              }}
                          />
                        </div>

                        <div className="app-input-wrap app-with-icon">
                          <label>Email Address *</label>
                          <div className="app-input-inner">
                            <Mail size={18} className="app-field-icon" />
                            <input type="email" name="email" value={regData.email} onChange={handleRegChange} placeholder="client@example.com" required />
                          </div>
                        </div>
                      </div>

                      <div className="app-input-wrap app-with-icon mt-4">
                        <label>Set Temporary Password *</label>
                        <div className="app-input-inner">
                          <Lock size={18} className="app-field-icon" />
                          <input type="text" name="password" value={regData.password} onChange={handleRegChange} placeholder="Create a secure password" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Personal */}
                  {regStep === 3 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-step-header">
                        <div className="app-step-icon bg-purple"><UserCircle size={24} /></div>
                        <div>
                          <h2>Personal Details</h2>
                          <p>Client's identity and marital background.</p>
                        </div>
                      </div>

                      <div className="app-form-grid">
                        <div className="app-input-wrap app-with-icon">
                          <label>First Name *</label>
                          <div className="app-input-inner">
                            <User size={18} className="app-field-icon" />
                            <input type="text" name="firstName" value={regData.firstName} onChange={handleRegChange} placeholder="Enter first name" required />
                          </div>
                        </div>
                        <div className="app-input-wrap app-with-icon">
                          <label>Last Name *</label>
                          <div className="app-input-inner">
                            <IdCard size={18} className="app-field-icon" />
                            <input type="text" name="lastName" value={regData.lastName} onChange={handleRegChange} placeholder="Enter surname" required />
                          </div>
                        </div>
                      </div>

                      <div className="app-form-grid mt-4">
                        <div className="app-input-wrap app-with-icon">
                          <label>Date of Birth *</label>
                          <div className="app-input-inner">
                            <Calendar size={18} className="app-field-icon" />
                            <input type="date" name="dob" value={regData.dob} onChange={handleRegChange} required />
                          </div>
                        </div>
                        <div className="app-input-wrap app-with-icon">
                          <label>Marital Status</label>
                          <div className="app-input-inner">
                            <Heart size={18} className="app-field-icon" />
                            <select name="maritalStatus" value={regData.maritalStatus} onChange={handleRegChange}>
                              <option>Never Married</option><option>Divorced</option><option>Widowed</option><option>Awaiting Divorce</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Socio-Cultural */}
                  {regStep === 4 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-step-header">
                        <div className="app-step-icon bg-teal"><Globe size={24} /></div>
                        <div>
                          <h2>Socio-Cultural Background</h2>
                          <p>Community specifics.</p>
                        </div>
                      </div>

                      <div className="app-form-grid mt-4">
                        <AgentComboInput 
                          label="Community" name="community" 
                          value={regData.community} onChange={handleRegChange} 
                          options={masterCommunities} required={true}
                        />
                        <AgentComboInput 
                          label="Sub-Community / Caste" name="caste" 
                          value={regData.caste} onChange={handleRegChange} 
                          options={availableSubCommunities} required={true}
                        />
                      </div>

                      <div className="app-input-wrap app-with-icon mt-4">
                        <label>Gothra</label>
                        <div className="app-input-inner">
                          <Users size={18} className="app-field-icon" />
                          <input type="text" name="gothra" value={regData.gothra} onChange={handleRegChange} placeholder="Enter Gothra (Optional)" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Career */}
                  {regStep === 5 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-step-header">
                        <div className="app-step-icon bg-amber"><Briefcase size={24} /></div>
                        <div>
                          <h2>Career & Education</h2>
                          <p>Professional background and income.</p>
                        </div>
                      </div>

                      <div className="app-form-grid">
                          <AgentComboInput 
                            label="Education" name="highestQualification" 
                            value={regData.highestQualification} onChange={handleRegChange} 
                            options={dynamicOptions.Education} required={true} icon={GraduationCap}
                          />
                          <div className="app-input-wrap app-with-icon">
                            <label>Work Sector</label>
                            <div className="app-input-inner">
                              <Building2 size={18} className="app-field-icon" />
                              <select name="workType" value={regData.workType} onChange={handleRegChange}>
                                <option>Private</option><option>Govt</option><option>Business</option><option>Self-Employed</option>
                              </select>
                            </div>
                          </div>
                      </div>

                      <div className="app-input-wrap app-with-icon mt-4">
                        <label>College/University</label>
                        <div className="app-input-inner">
                          <GraduationCap size={18} className="app-field-icon" />
                          <input type="text" name="collegeName" value={regData.collegeName} onChange={handleRegChange} placeholder="Highest degree college"/>
                        </div>
                      </div>

                      <div className="app-form-grid mt-4">
                        <AgentComboInput 
                          label="Job Role" name="jobRole" 
                          value={regData.jobRole} onChange={handleRegChange} 
                          options={dynamicOptions.Designation} required={false} icon={User}
                        />
                        <div className="app-input-wrap app-with-icon">
                          <label>Company Name</label>
                          <div className="app-input-inner">
                            <Building2 size={18} className="app-field-icon" />
                            <input type="text" name="companyName" value={regData.companyName} onChange={handleRegChange} placeholder="Current employer" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <AgentComboInput 
                          label="Annual Income" name="annualIncome" 
                          value={regData.annualIncome} onChange={handleRegChange} 
                          options={dynamicOptions.Income} required={false} icon={Wallet}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Location */}
                  {regStep === 6 && (
                    <div className="app-step-content app-slide-fwd">
                      <div className="app-step-header">
                        <div className="app-step-icon bg-red"><MapPin size={24} /></div>
                        <div>
                          <h2>Physical & Location</h2>
                          <p>Lifestyle and geographic details.</p>
                        </div>
                      </div>

                      <div className="app-form-grid">
                        <AgentComboInput 
                          label="Height" name="height" 
                          value={regData.height} onChange={handleRegChange} 
                          options={dynamicOptions.Height} required={true} icon={Ruler}
                          placeholder="Select height"
                        />
                        
                        <AgentComboInput 
                          label="Diet" name="diet" 
                          value={regData.diet} onChange={handleRegChange} 
                          options={dynamicOptions.Diet} required={true} icon={Utensils}
                          placeholder="Select diet"
                        />
                      </div>

                      <div className="app-input-wrap app-with-icon mt-4">
                        <label>Residents In</label>
                        <div className="app-input-inner">
                          <Building2 size={18} className="app-field-icon" />
                          <select name="residentsIn" value={regData.residentsIn} onChange={handleRegChange}>
                            <option value="Own">Own</option>
                            <option value="Rent">Rent</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <AgentComboInput 
                          label="Country" name="country" 
                          value={regData.country} onChange={handleRegChange} 
                          options={dynamicOptions.Country} required={true} icon={Globe}
                        />
                      </div>

                      <div className="app-form-grid mt-4">
                        <AgentComboInput 
                          label="State" name="state" 
                          value={regData.state} onChange={handleRegChange} 
                          options={dynamicOptions.State} required={true} icon={Map}
                        />
                        <AgentComboInput 
                          label="City" name="city" 
                          value={regData.city} onChange={handleRegChange} 
                          options={dynamicOptions.City} required={true} icon={MapPin}
                        />
                      </div>
                    </div>
                  )}

                </form>
              </div>

              <div className="app-register-footer">
                {regStep > 1 ? (
                  <button type="button" className="app-btn-outline" onClick={prevRegStep}>Back</button>
                ) : ( <div></div> )}

                {regStep === TOTAL_STEPS ? (
                  <button type="submit" form="app-agent-reg-form" className="app-btn-primary app-btn-green submit-pulse" disabled={regLoading}>
                      {regLoading ? 'Processing...' : 'Complete Profile'} <CheckCircle size={18} />
                  </button>
                ) : (
                  <button type="button" className="app-btn-primary app-btn-green" onClick={nextRegStep}>
                      Continue <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MEMBERSHIP PAYMENTS */}
        {activeTab === 'mem_payments' && (
          <div className="app-animate-fade">
            <header className="app-page-header">
              <div className="app-header-title-group">
                <h1>Membership Log</h1>
                <p className="app-subtitle">Track client subscription payments</p>
              </div>
            </header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="app-data-table-wrapper">
                <table className="app-data-table">
                  <thead><tr><th>Client</th><th>Amount</th><th>UTR / Ref</th><th>Proof</th><th>Status</th></tr></thead>
                  <tbody>
                    {memPayments.length === 0 && <tr><td colSpan="5" className="app-empty">No transactions.</td></tr>}
                    {memPayments.map(p => (
                      <tr key={p._id}>
                        <td className="app-cell-primary">{p.userId?.firstName} {p.userId?.lastName}</td>
                        <td className="app-cell-primary">₹{p.amount?.toLocaleString()}</td>
                        <td className="app-font-mono">{p.utrNumber}</td>
                        <td><button className="app-link-btn" onClick={() => setShowImageModal(p.screenshotUrl)}>View</button></td>
                        <td>{renderStatusBadge(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INTEREST STATUS */}
        {activeTab === 'int_status' && (
          <div className="app-animate-fade">
            <header className="app-page-header">
              <div className="app-header-title-group">
                <h1>Match Activity</h1>
                <p className="app-subtitle">Monitor interest requests for your clients</p>
              </div>
            </header>

            {dashboardLoading ? <TableSkeleton /> : (
              <div className="app-data-table-wrapper">
                <table className="app-data-table">
                  <thead><tr><th>Direction</th><th>My Client</th><th>Match Profile</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {interestsStatus.length === 0 && <tr><td colSpan="5" className="app-empty">No activity.</td></tr>}
                    {interestsStatus.map(item => (
                      <tr key={item.interestId}>
                        <td>
                          <span className={`app-dir-badge ${item.direction === 'Sent' ? 'sent' : 'received'}`}>
                            {item.direction === 'Sent' ? '↗' : '↙'}
                          </span>
                        </td>
                        <td>
                          <div className="app-cell-primary">{item.myClient?.firstName} {item.myClient?.lastName}</div>
                          <div className="app-cell-secondary">{item.myClient?.uniqueId}</div>
                        </td>
                        <td>
                          <div className="app-cell-primary">{item.matchProfile?.firstName} {item.matchProfile?.lastName}</div>
                          <div className="app-cell-secondary">{item.matchProfile?.uniqueId}</div>
                        </td>
                        <td className="app-cell-secondary">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>{renderStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showImageModal && (
        <div className="app-modal-overlay app-animate-fade" onClick={() => setShowImageModal(null)}>
          <div className="app-image-modal" onClick={e => e.stopPropagation()}>
            <button className="app-close-abs" onClick={() => setShowImageModal(null)}><X size={20} /></button>
            <img src={showImageModal} alt="Payment Proof" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;

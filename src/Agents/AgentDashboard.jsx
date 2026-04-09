import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CreditCard, LogOut, Link as LinkIcon, 
  Plus, Clock, ChevronRight, Activity,
  User, IdCard, MapPin, Briefcase, Heart, UserPlus, CheckCircle,
  Mail, Lock, Calendar, GraduationCap, Building2, Wallet,
  Ruler, Utensils, Globe, Map, UserCircle, ArrowRight, ArrowDown, X, Check, Search, Star,
  Copy, Share2
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
  <div className="crm-skeleton-grid">
    {[1, 2, 3].map((i) => (
      <div key={i} className="crm-skeleton-card">
        <div className="crm-sk-line crm-short"></div>
        <div className="crm-sk-line crm-big"></div>
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="crm-skeleton-list">
    <div className="crm-sk-header"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="crm-sk-list-row">
        <div className="crm-sk-cell"></div>
        <div className="crm-sk-cell"></div>
        <div className="crm-sk-cell"></div>
      </div>
    ))}
  </div>
);

const formatHeightOption = (val) => {
  const cm = parseInt(val, 10);
  if (isNaN(cm)) return val; 
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet} ft ${inches} in (${cm} cm)`;
};

const AgentSelect = ({ label, name, value, onChange, options, required, icon: Icon, placeholder }) => (
  <div className={`crm-input-wrap ${Icon ? 'crm-with-icon' : ''}`}>
    <label>{label} {required && <span className="text-red-req">*</span>}</label>
    <div className="crm-input-inner">
      {Icon && <Icon size={18} className="crm-field-icon" />}
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">{placeholder || "Select..."}</option>
        {options?.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.name}>
            {typeof opt === 'string' ? opt : opt.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const AgentComboInput = ({ label, name, value, onChange, options, required, icon: Icon, placeholder, disabled }) => {
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
      <div className={`crm-input-wrap ${Icon ? 'crm-with-icon' : ''}`} ref={wrapperRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
        <label>{label} {required && <span className="text-red-req">*</span>}</label>
        <div className="crm-input-inner" style={{ position: 'relative' }}>
          {Icon && <Icon size={18} className="crm-field-icon" />}
          <input 
            type="text" name={name} value={value} onChange={handleInputChange} 
            onFocus={() => { if (!disabled) { setIsOpen(true); setFiltered(options || []); } }}
            placeholder={placeholder || "Type or select..."} required={required} autoComplete="off"
            disabled={disabled}
            className={disabled ? 'is-disabled' : ''}
          />
          {isOpen && filtered && filtered.length > 0 && !disabled && (
            <ul className="crm-combo-dropdown">
              {filtered.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.name;
                return (
                  <li key={idx} onClick={() => handleSelect(text)}>{text}</li>
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
  const [token] = useState(localStorage.getItem('agentToken'));
  const [agentInfo] = useState(JSON.parse(localStorage.getItem('agentInfo') || 'null'));

  const [activeTab, setActiveTab] = useState('overview'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [stats, setStats] = useState({ totalReferrals: 0, paidReferrals: 0, pendingApprovals: 0 });
  const [usersList, setUsersList] = useState([]);
  const [memPayments, setMemPayments] = useState([]);
  const [interestsStatus, setInterestsStatus] = useState([]); 
  const [premiumUsers, setPremiumUsers] = useState([]); 
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [dynamicOptions, setDynamicOptions] = useState({
      Education: [], Designation: [], Income: [], Country: [], Height: [], Diet: [], Sector: [], MaritalStatus: []
  });

  const [showImageModal, setShowImageModal] = useState(null); 
  const [regLoading, setRegLoading] = useState(false);
  const mainScrollRef = useRef(null);

  const [regStep, setRegStep] = useState(1);
  const TOTAL_STEPS = 9; 

  // --- SEARCH AND PAGINATION STATES ---
  const ITEMS_PER_PAGE = 10;

  const [clientSearch, setClientSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);

  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);

  const [premiumSearch, setPremiumSearch] = useState(''); 
  const [premiumPage, setPremiumPage] = useState(1); 

  const [regData, setRegData] = useState({
    profileFor: 'Myself', firstName: '', lastName: '', gender: 'Male', dob: '', 
    maritalStatus: '', height: '', diet: '', community: '', caste: '', subCommunity: '', gothra: '',
    country: '', state: '', city: '', residentsIn: 'Own', highestQualification: '', collegeName: '', workType: '', 
    jobRole: '', companyName: '', annualIncome: '', nri: 'No', mobileNumber: '', email: '', password: ''
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('agentToken'); 
    localStorage.removeItem('agentInfo');
    navigate('/agent', { replace: true });
  }, [navigate]);

  // --- GUARANTEED SCROLL HIDING LOGIC ---
  const handleScrollCheck = useCallback(() => {
    let isScrollable = false;
    let isAtBottom = false;

    const BUFFER = activeTab === 'register' ? 220 : 180; 

    if (mainScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;

      if (scrollHeight > clientHeight + 10) {
        isScrollable = true;
        if (scrollTop + clientHeight >= scrollHeight - BUFFER) {
          isAtBottom = true;
        }
      }
    }

    const winHeight = window.innerHeight;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (docHeight > winHeight + 10) {
      isScrollable = true;
      const scrollY = Math.ceil(window.scrollY || document.documentElement.scrollTop);

      if (scrollY + winHeight >= docHeight - BUFFER) {
        isAtBottom = true;
      }
    }

    setShowScroll(isScrollable && !isAtBottom);
  }, [activeTab]);

  useEffect(() => {
    handleScrollCheck();
    
    // Listeners for manual scrolling & resizing
    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    window.addEventListener('resize', handleScrollCheck);

    // FIXED: Robust Resize Observer that checks both the specific ref AND the entire document body
    // This catches layout shifts in production that happen post-render.
    const resizeObserver = new ResizeObserver(() => {
      handleScrollCheck();
    });

    if (mainScrollRef.current) {
      resizeObserver.observe(mainScrollRef.current);
    }
    resizeObserver.observe(document.body); 

    // Staggered fallbacks extended slightly for production network/CSS delays
    const t1 = setTimeout(handleScrollCheck, 150);
    const t2 = setTimeout(handleScrollCheck, 500);
    const t3 = setTimeout(handleScrollCheck, 1000);
    const t4 = setTimeout(handleScrollCheck, 2000);

    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('resize', handleScrollCheck);
      resizeObserver.disconnect();
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3); 
      clearTimeout(t4);
    };
  }, [handleScrollCheck, activeTab, regStep, dashboardLoading, stats, usersList, interestsStatus, memPayments, premiumUsers]);

  const scrollToBottom = () => {
    const el = mainScrollRef.current;
    if (el && el.scrollHeight > el.clientHeight + 5) {
      el.scrollBy({ top: 400, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!token) { handleLogout(); return; }
    fetchAllData(); fetchCommunities(); fetchDynamicMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, handleLogout]);

  const fetchAllData = async () => {
    setDashboardLoading(true);
    try {
      const headers = { Authorization: token };
      const responses = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/users`, { headers }), 
        fetch(`${API_BASE}/payments/registrations`, { headers }),
        fetch(`${API_BASE}/users/interests`, { headers }),
        fetch(`${API_BASE}/premium-requests/resolved`, { headers }) 
      ]);

      if (responses.some(res => res.status === 401 || res.status === 403)) {
          toast.error("Session expired. Please log in again.");
          handleLogout();
          return;
      }

      const [sData, uData, mpData, isData, prData] = await Promise.all(responses.map(res => res.json()));

      if (sData.success === false && sData.message?.toLowerCase().includes("token")) {
          handleLogout();
          return;
      }

      if(sData.success) setStats(sData.stats);
      if(uData.success) setUsersList(uData.users);
      if(mpData.success) setMemPayments(mpData.payments);
      if(isData.success) setInterestsStatus(isData.data);
      if(prData.success) setPremiumUsers(prData.data);

    } catch (error) { 
        toast.error("Failed to load dashboard data"); 
    } 
    finally { setDashboardLoading(false); }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
      const data = await response.json();
      if (data.success) setMasterCommunities(data.data);
    } catch (err) {}
  };

  const fetchDynamicMasterData = async () => {
      const categories = ['Education', 'Designation', 'Income', 'Country', 'Height', 'Diet', 'Sector', 'MaritalStatus'];
      const newOptions = { ...dynamicOptions };
      await Promise.all(categories.map(async (category) => {
        try {
          const res = await fetch(`${PUBLIC_API_BASE}/master-data/${category}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            newOptions[category] = category === 'Height' ? json.data.map(item => formatHeightOption(item.name)) : json.data.map(item => item.name);
          }
        } catch (err) {}
      }));
      setDynamicOptions(newOptions);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/registration?refId=${agentInfo?.id || agentInfo?._id}&refName=${encodeURIComponent(agentInfo?.name)}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral Link Copied!"); 
  };

  const shareLink = async () => {
    const link = `${window.location.origin}/registration?refId=${agentInfo?.id || agentInfo?._id}&refName=${encodeURIComponent(agentInfo?.name)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Register for KalyanaShobha',
          text: `Join KalyanaShobha using my referral link!`,
          url: link
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      toast.info("Share not supported on this browser. Link copied instead!");
      copyLink();
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); 

    if (tab === 'users') { setClientSearch(''); setClientPage(1); }
    if (tab === 'premium') { setPremiumSearch(''); setPremiumPage(1); }
    if (tab === 'mem_payments') { setPaymentSearch(''); setPaymentPage(1); }
    if (tab === 'int_status') { setActivitySearch(''); setActivityPage(1); }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStatusBadge = (status, isBoolean = false) => {
    if (isBoolean) return status ? <span className="crm-badge crm-badge-success">Premium</span> : <span className="crm-badge crm-badge-pending">Free</span>;
    const s = status?.toLowerCase() || '';
    if (s.includes('success') || s.includes('accepted') || s.includes('resolved')) return <span className="crm-badge crm-badge-success">{status}</span>;
    if (s.includes('reject') || s.includes('decline')) return <span className="crm-badge crm-badge-danger">{status}</span>;
    return <span className="crm-badge crm-badge-pending">{status || 'Pending'}</span>;
  };

  const handleRegChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'community') {
      setRegData({ ...regData, community: value, caste: '', subCommunity: '' });
      const found = masterCommunities.find(c => c.name === value);
      setAvailableSubCommunities(found ? found.subCommunities || [] : []);
    } else if (name === 'country') {
      setRegData({ ...regData, country: value, state: '', city: '' });
      setAvailableStates([]); setAvailableCities([]);
      if (value) {
        try {
          const res = await fetch(`${PUBLIC_API_BASE}/master-data/State?parent=${value}`);
          const json = await res.json();
          if (json.success) setAvailableStates(json.data.map(d => d.name));
        } catch(e) {}
      }
    } else if (name === 'state') {
      setRegData({ ...regData, state: value, city: '' });
      setAvailableCities([]);
      if (value) {
        try {
          const res = await fetch(`${PUBLIC_API_BASE}/master-data/City?parent=${value}`);
          const json = await res.json();
          if (json.success) setAvailableCities(json.data.map(d => d.name));
        } catch(e) {}
      }
    } else {
      setRegData({ ...regData, [name]: value });
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1: return regData.profileFor && regData.gender;
      case 2:
        if (!regData.mobileNumber || regData.mobileNumber.length < 10) { toast.error("Valid mobile number required"); return false; }
        if (!regData.email || !regData.email.includes('@')) { toast.error("Valid email required"); return false; }
        if (!regData.password) { toast.error("Password required"); return false; }
        return true;
      case 3:
        if (!regData.firstName || !regData.lastName || !regData.dob) { toast.error("Name and Date of Birth required"); return false; }
        if (regData.dob && regData.gender) {
            const dobDate = new Date(regData.dob); const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
            if (regData.gender === 'Male' && age < 21) { toast.error("Men must be at least 21."); return false; }
            if (regData.gender === 'Female' && age < 18) { toast.error("Women must be at least 18."); return false; }
        }
        return true;
      case 4:
        if (!regData.maritalStatus || !regData.height || !regData.diet) { toast.error("Marital status, height, and diet required"); return false; }
        return true;
      case 5:
        if (!regData.community || !regData.caste || !regData.gothra) { toast.error("All socio-cultural details required"); return false; }
        return true;
      case 6:
        if (!regData.highestQualification) { toast.error("Highest qualification required"); return false; }
        return true;
      case 7:
        return true;
      case 8:
        if (!regData.nri) { toast.error("NRI status required"); return false; }
        return true;
      case 9:
        if (!regData.country || !regData.state || !regData.city) { toast.error("All location details required"); return false; }
        return true;
      default: return true;
    }
  };

  const nextRegStep = () => { 
    if (validateStep(regStep)) {
      setRegStep(prev => Math.min(prev + 1, TOTAL_STEPS)); 
      window.scrollTo(0,0);
      if(mainScrollRef.current) mainScrollRef.current.scrollTo(0,0);

      setTimeout(handleScrollCheck, 150);
      setTimeout(handleScrollCheck, 500);
    } 
  };

  const prevRegStep = () => { 
    setRegStep(prev => Math.max(prev - 1, 1)); 
    window.scrollTo(0,0); 
    if(mainScrollRef.current) mainScrollRef.current.scrollTo(0,0);

    setTimeout(handleScrollCheck, 150);
    setTimeout(handleScrollCheck, 500);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(regStep)) return; 
    if(regStep < TOTAL_STEPS) { nextRegStep(); return; }

    setRegLoading(true);
    const toastId = toast.loading("Registering client...");

    const heightString = regData.height ? regData.height.toString() : "";
    const cmMatch = heightString.match(/\((\d+)\s*cm\)/) || heightString.match(/\d+/g);
    const numericHeight = cmMatch ? parseInt(cmMatch.pop(), 10) : 0;

    let calculatedAge = null;
    if (regData.dob) {
        const dobDate = new Date(regData.dob); const today = new Date();
        calculatedAge = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) calculatedAge--;
    }

    const payload = {
      ...regData, subCommunity: regData.caste, height: numericHeight, rawHeight: numericHeight, age: calculatedAge, 
      referredByAgentId: agentInfo?.id || agentInfo?._id, referredByAgentName: agentInfo?.name, referralType: "manual"
    };

    try {
      const res = await fetch(`${API_BASE}/register-user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': token }, body: JSON.stringify(payload)
      });
      if (res.status === 401 || res.status === 403) {
          toast.update(toastId, { render: "Session Expired", type: "error", isLoading: false, autoClose: 3000 });
          handleLogout();
          return;
      }

      const data = await res.json();

      if (data.success) {
        toast.update(toastId, { render: "Client Registered!", type: "success", isLoading: false, autoClose: 3000 });
        setRegData({ 
          profileFor: 'Myself', firstName: '', lastName: '', gender: 'Male', dob: '', maritalStatus: '', height: '', diet: '',
          community: '', caste: '', subCommunity: '', gothra: '', country: '', state: '', city: '', residentsIn: 'Own',
          highestQualification: '', collegeName: '', workType: '', jobRole: '', companyName: '', annualIncome: '', nri: 'No',
          mobileNumber: '', email: '', password: ''
        });
        setAvailableSubCommunities([]); setAvailableStates([]); setAvailableCities([]); setRegStep(1); setActiveTab('users'); fetchAllData(); 
      } else {
        toast.update(toastId, { render: data.message || "Registration Failed", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) { toast.update(toastId, { render: "Network Error", type: "error", isLoading: false, autoClose: 3000 }); } 
    finally { setRegLoading(false); }
  };

  const filteredClients = usersList.filter(u => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(clientSearch.toLowerCase()) ||
    (u.uniqueId || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
    (u.mobileNumber || '').includes(clientSearch)
  );
  const totalClientPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = filteredClients.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE);

  const filteredPremium = premiumUsers.filter(p => 
    (p.userId?.firstName + ' ' + p.userId?.lastName).toLowerCase().includes(premiumSearch.toLowerCase()) ||
    (p.userId?.uniqueId || '').toLowerCase().includes(premiumSearch.toLowerCase()) ||
    (p.userId?.mobileNumber || '').includes(premiumSearch)
  );
  const totalPremiumPages = Math.max(1, Math.ceil(filteredPremium.length / ITEMS_PER_PAGE));
  const paginatedPremium = filteredPremium.slice((premiumPage - 1) * ITEMS_PER_PAGE, premiumPage * ITEMS_PER_PAGE);

  const filteredPayments = memPayments.filter(p => 
    (p.userId?.firstName + ' ' + p.userId?.lastName).toLowerCase().includes(paymentSearch.toLowerCase()) ||
    (p.utrNumber || '').toLowerCase().includes(paymentSearch.toLowerCase())
  );
  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE));
  const paginatedPayments = filteredPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE);

  const filteredActivity = interestsStatus.filter(i => 
    (i.myClient?.firstName + ' ' + i.myClient?.lastName).toLowerCase().includes(activitySearch.toLowerCase()) ||
    (i.matchProfile?.firstName + ' ' + i.matchProfile?.lastName).toLowerCase().includes(activitySearch.toLowerCase())
  );
  const totalActivityPages = Math.max(1, Math.ceil(filteredActivity.length / ITEMS_PER_PAGE));
  const paginatedActivity = filteredActivity.slice((activityPage - 1) * ITEMS_PER_PAGE, activityPage * ITEMS_PER_PAGE);

  if (!token) return null; 

  return (
    <div className="crm-master-layout">
      <ToastContainer position="top-center" theme="colored" />

      <div className={`crm-scroll-indicator ${showScroll ? 'show' : 'hide'}`} onClick={scrollToBottom}>
        <ArrowDown size={20} strokeWidth={3} />
      </div>

      {isMobileMenuOpen && <div className="crm-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <header className="crm-mobile-topbar">
        <div className="crm-mobile-brand">
          <img src="/Kalyanashobha.png" alt="KalyanaShobha Logo" className="crm-mob-brand-img" />
        </div>

        <button 
          className={`crm-burger-btn ${isMobileMenuOpen ? 'is-open' : ''}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="crm-custom-burger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      <aside className={`crm-nav-sidebar ${isMobileMenuOpen ? 'nav-open' : ''}`}>
        <div className="crm-brand-section">
          <img src="/Kalyanashobha.png" alt="KalyanaShobha Logo" className="crm-brand-img" />
        </div>

        <div className="crm-user-profile crm-show-mobile">
          <div className="crm-avatar">{agentInfo?.name?.charAt(0) || 'A'}</div>
          <div>
            <div className="crm-username">{agentInfo?.name || 'Agent'}</div>
            <div className="crm-userid">ID: {agentInfo?.agentCode || 'AGENT'}</div>
          </div>
        </div>

        <nav className="crm-navigation">
          <button className={activeTab === 'overview' ? 'tab-active' : ''} onClick={() => handleNavClick('overview')}>
            <Clock size={20} /> <span>Overview</span>
          </button>
          <button className={activeTab === 'users' ? 'tab-active' : ''} onClick={() => handleNavClick('users')}>
            <Users size={20} /> <span>My Clients</span>
          </button>

          <button className={activeTab === 'premium' ? 'tab-active' : ''} onClick={() => handleNavClick('premium')}>
            <Star size={20} /> <span>Premium Clients</span>
          </button>

          <button className={`crm-nav-special ${activeTab === 'register' ? 'tab-active' : ''}`} onClick={() => handleNavClick('register')}>
            <UserPlus size={20} /> <span>Register</span>
          </button>

          <button className={activeTab === 'mem_payments' ? 'tab-active' : ''} onClick={() => handleNavClick('mem_payments')}>
            <CreditCard size={20} /> <span>Payments</span>
          </button>
          <button className={activeTab === 'int_status' ? 'tab-active' : ''} onClick={() => handleNavClick('int_status')}>
            <Activity size={20} /> <span>Match Activity</span>
          </button>

          <button className="crm-nav-logout" onClick={handleLogout}>
            <LogOut size={20} color="#dc2626" /> <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="crm-main-area" ref={mainScrollRef} onScroll={handleScrollCheck} style={{ paddingBottom: '120px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="crm-fade-in">
            <div className="crm-hero-banner">
              <picture>
                <source media="(max-width: 768px)" srcSet="https://res.cloudinary.com/dppiuypop/image/upload/v1773852088/uploads/m7apo90xh8znxsahepis.png" />
                <img src="https://res.cloudinary.com/dppiuypop/image/upload/v1774083320/uploads/ehkxyd0jr1ar69z0yass.png" alt="Agent Portal" className="crm-hero-img" onLoad={handleScrollCheck} />
              </picture>
              <div className="crm-hero-overlay-fade"></div>
              <div className="crm-hero-content">
                <h2>Welcome to the Agent Portal</h2>
                <p>Manage your client profiles, track referrals, and monitor match activities effortlessly.</p>
              </div>
            </div>

            <header className="crm-view-header mt-4">
              <div className="crm-header-text">
                <h1>Dashboard</h1>
                <p className="crm-subtext">Welcome back, {agentInfo?.name}. Here is what's happening.</p>
              </div>
            </header>

            {dashboardLoading ? <StatSkeleton /> : (
              <>
                <div className="crm-stats-grid">
                   <div className="crm-stat-box">
                      <div className="crm-stat-icon crm-bg-blue-light"><Users size={24} className="crm-text-blue" /></div>
                      <div className="crm-stat-info">
                        <span className="crm-stat-label">Referrals</span>
                        <span className="crm-stat-number">{stats.totalReferrals}</span>
                      </div>
                   </div>
                   <div className="crm-stat-box" onClick={() => handleNavClick('premium')} style={{cursor: 'pointer'}}>
                      <div className="crm-stat-icon crm-bg-green-light"><CheckCircle size={24} className="crm-text-green" /></div>
                      <div className="crm-stat-info">
                        <span className="crm-stat-label">Paid</span>
                        <span className="crm-stat-number">{stats.paidReferrals}</span>
                      </div>
                   </div>
                   <div className="crm-stat-box">
                      <div className="crm-stat-icon crm-bg-amber-light"><Clock size={24} className="crm-text-amber" /></div>
                      <div className="crm-stat-info">
                        <span className="crm-stat-label">Pending</span>
                        <span className="crm-stat-number">{stats.pendingApprovals}</span>
                      </div>
                   </div>
                </div>

                <div className="crm-action-hub">
                  <h2>Quick Actions</h2>
                  <div className="crm-action-grid">
                    <button className="crm-action-card" onClick={() => setActiveTab('register')}>
                      <div className="crm-ac-icon crm-bg-blue-light crm-text-blue"><UserPlus size={20} /></div>
                      <div className="crm-ac-details">
                        <strong>New Client</strong>
                        <span>Add profile</span>
                      </div>
                      <ChevronRight size={18} className="crm-ac-arrow" />
                    </button>

                    <div className="crm-action-card" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div className="crm-ac-icon crm-bg-red-light crm-text-red"><LinkIcon size={20} /></div>
                        <div className="crm-ac-details">
                          <strong>Invite Link</strong>
                          <span>Send link</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <button 
                            onClick={(e) => { e.stopPropagation(); copyLink(); }} 
                            style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Copy Link"
                         >
                            <Copy size={18} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); shareLink(); }} 
                            style={{ background: '#f0fdf4', color: '#22c55e', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Share Link"
                         >
                            <Share2 size={18} />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MY CLIENTS TAB */}
        {activeTab === 'users' && (
          <div className="crm-fade-in">
            <header className="crm-view-header">
               <div className="crm-header-text">
                 <h1>My Clients</h1>
                 <p className="crm-subtext">Manage all the profiles you have referred</p>
               </div>
               <button className="crm-btn-solid crm-btn-blue" onClick={() => setActiveTab('register')}>
                 <Plus size={16} /> <span className="crm-hide-mobile">Register New</span><span className="crm-show-mobile">New</span>
               </button>
            </header>

            <div className="crm-search-box">
               <Search size={18} className="crm-search-icon" />
               <input type="text" placeholder="Search by name, ID, or phone..." value={clientSearch} onChange={e => {setClientSearch(e.target.value); setClientPage(1);}} />
            </div>

            {dashboardLoading ? <ListSkeleton /> : (
              <div className="crm-list-wrapper">
                <div className="crm-list-header crm-grid-clients">
                  <div>Client Profile</div>
                  <div>Contact</div>
                  <div>Status</div>
                  <div>Registered Date</div>
                </div>

                <div className="crm-list-body">
                  {paginatedClients.length === 0 && (
                    <div className="crm-empty-view"><Users size={40} /><h3>No clients found</h3><p>Try a different search or add a client.</p></div>
                  )}
                  {paginatedClients.map(u => (
                    <div className="crm-list-item crm-grid-clients" key={u._id}>
                      <div className="crm-list-cell" data-label="Client Profile">
                        <div className="crm-cell-content">
                          <div className="crm-text-primary">{u.firstName} {u.lastName}</div>
                          <div className="crm-text-secondary">{u.uniqueId}</div>
                        </div>
                      </div>
                      <div className="crm-list-cell" data-label="Contact">
                        <div className="crm-cell-content">
                          <div className="crm-text-primary">{u.mobileNumber}</div>
                        </div>
                      </div>
                      <div className="crm-list-cell" data-label="Status">
                        <div className="crm-cell-content">{renderStatusBadge(u.isPaidMember, true)}</div>
                      </div>
                      <div className="crm-list-cell" data-label="Registered">
                        <div className="crm-cell-content crm-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="crm-pagination">
                   <button className="crm-page-btn" disabled={clientPage === 1} onClick={() => setClientPage(clientPage - 1)}>Previous</button>
                   <span className="crm-page-info">Page {clientPage} of {totalClientPages}</span>
                   <button className="crm-page-btn" disabled={clientPage >= totalClientPages} onClick={() => setClientPage(clientPage + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREMIUM CLIENTS TAB */}
        {activeTab === 'premium' && (
          <div className="crm-fade-in">
            <header className="crm-view-header">
               <div className="crm-header-text">
                 <h1>Premium Clients</h1>
                 <p className="crm-subtext">View your clients who have successfully upgraded to Premium</p>
               </div>
            </header>

            <div className="crm-search-box">
               <Search size={18} className="crm-search-icon" />
               <input type="text" placeholder="Search by name, ID, or phone..." value={premiumSearch} onChange={e => {setPremiumSearch(e.target.value); setPremiumPage(1);}} />
            </div>

            {dashboardLoading ? <ListSkeleton /> : (
              <div className="crm-list-wrapper">
                <div className="crm-list-header crm-grid-premium">
                  <div>Client Profile</div>
                  <div>Contact Details</div>
                  <div>Location</div>
                  <div>Upgrade Date</div>
                </div>

                <div className="crm-list-body">
                  {paginatedPremium.length === 0 && (
                    <div className="crm-empty-view"><Star size={40} /><h3>No premium clients found</h3><p>Clients who upgrade will appear here.</p></div>
                  )}
                  {paginatedPremium.map(p => (
                    <div className="crm-list-item crm-grid-premium" key={p._id}>
                      <div className="crm-list-cell" data-label="Client Profile">
                        <div className="crm-cell-content">
                          <div className="crm-text-primary">{p.userId?.firstName} {p.userId?.lastName}</div>
                          <div className="crm-text-secondary">{p.userId?.uniqueId}</div>
                        </div>
                      </div>
                      <div className="crm-list-cell" data-label="Contact Details">
                        <div className="crm-cell-content">
                          <div className="crm-text-primary">{p.userId?.mobileNumber}</div>
                          <div className="crm-text-secondary">{p.userId?.email}</div>
                        </div>
                      </div>
                      <div className="crm-list-cell" data-label="Location">
                        <div className="crm-cell-content crm-text-primary">
                          {p.userId?.city && p.userId?.state ? `${p.userId?.city}, ${p.userId?.state}` : 'N/A'}
                        </div>
                      </div>
                      <div className="crm-list-cell" data-label="Upgrade Date">
                        <div className="crm-cell-content crm-text-secondary">{new Date(p.requestDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="crm-pagination">
                   <button className="crm-page-btn" disabled={premiumPage === 1} onClick={() => setPremiumPage(premiumPage - 1)}>Previous</button>
                   <span className="crm-page-info">Page {premiumPage} of {totalPremiumPages}</span>
                   <button className="crm-page-btn" disabled={premiumPage >= totalPremiumPages} onClick={() => setPremiumPage(premiumPage + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- REGISTER CLIENT TAB --- */}
        {activeTab === 'register' && (
          <div className="crm-fade-in crm-register-view">
            <div className="crm-form-card">

              <div className="crm-premium-stepper">
                <div className="crm-stepper-text">STEP {regStep} OF {TOTAL_STEPS}</div>
                <div className="crm-stepper-bar-container">
                  <div className="crm-stepper-bar-fill" style={{ width: `${(regStep / TOTAL_STEPS) * 100}%` }}></div>
                </div>
              </div>

              <div className="crm-form-body">
                <form id="crm-agent-reg" onSubmit={handleRegisterSubmit}>

                  {/* STEP 1: Basic Setup */}
                  {regStep === 1 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-step-top-icon">
                        <User size={32} strokeWidth={2} className="crm-user-line-icon" />
                      </div>

                      <h2 className="crm-step-main-title">This profile is for</h2>
                      <div className="crm-pro-radio-grid mt-4">
                          {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Friend'].map(opt => (
                              <button type="button" key={opt} className={`crm-pro-radio ${regData.profileFor === opt ? 'selected' : ''}`} onClick={() => setRegData({...regData, profileFor: opt})}>
                                <div className="radio-circle">
                                    {regData.profileFor === opt && <Check size={14} strokeWidth={4} className="radio-inner-check" />}
                                </div>
                                <span>{opt}</span>
                              </button>
                          ))}
                      </div>

                      <h2 className="crm-step-main-title mt-5">Gender</h2>
                      <div className="crm-pro-radio-grid mt-4">
                          {['Male', 'Female'].map(gen => (
                              <button type="button" key={gen} className={`crm-pro-radio ${regData.gender === gen ? 'selected' : ''}`} onClick={() => setRegData({...regData, gender: gen})}>
                                <div className="radio-circle">
                                    {regData.gender === gen && <Check size={14} strokeWidth={4} className="radio-inner-check" />}
                                </div>
                                <span>{gen}</span>
                              </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Account */}
                  {regStep === 2 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-red"><UserPlus size={24} /></div><div><h2>Account Credentials</h2><p>Contact and secure login details.</p></div></div>
                      <div className="crm-field-row mt-4">
                        <div className="crm-input-wrap">
                          <label>Mobile Number <span className="text-red-req">*</span></label>
                          <PhoneInput country={'in'} value={regData.mobileNumber} onChange={(phone) => setRegData({ ...regData, mobileNumber: phone })} inputProps={{ name: 'mobileNumber', required: true }}
                              inputStyle={{ width: '100%', height: '48px', fontSize: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a' }} buttonStyle={{ borderRadius: '10px 0 0 10px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }} />
                        </div>
                        <div className="crm-input-wrap crm-with-icon">
                          <label>Email Address <span className="text-red-req">*</span></label>
                          <div className="crm-input-inner">
                            <Mail size={18} className="crm-field-icon" /><input type="email" name="email" value={regData.email} onChange={handleRegChange} placeholder="client@example.com" required />
                          </div>
                        </div>
                      </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                        <label>Set Password <span className="text-red-req">*</span></label>
                        <div className="crm-input-inner">
                          <Lock size={18} className="crm-field-icon" /><input type="text" name="password" value={regData.password} onChange={handleRegChange} placeholder="Create secure password" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Identity Details */}
                  {regStep === 3 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-amber"><UserCircle size={24} /></div><div><h2>Identity Details</h2><p>Basic personal information.</p></div></div>
                      <div className="crm-field-row mt-4">
                        <div className="crm-input-wrap crm-with-icon">
                          <label>First Name <span className="text-red-req">*</span></label>
                          <div className="crm-input-inner"><User size={18} className="crm-field-icon" /><input type="text" name="firstName" value={regData.firstName} onChange={handleRegChange} placeholder="First name" required /></div>
                        </div>
                        <div className="crm-input-wrap crm-with-icon">
                          <label>Last Name <span className="text-red-req">*</span></label>
                          <div className="crm-input-inner"><IdCard size={18} className="crm-field-icon" /><input type="text" name="lastName" value={regData.lastName} onChange={handleRegChange} placeholder="Surname" required /></div>
                        </div>
                      </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                          <label>Date of Birth <span className="text-red-req">*</span></label>
                          <div className="crm-input-inner"><Calendar size={18} className="crm-field-icon" /><input type="date" name="dob" value={regData.dob} onChange={handleRegChange} required /></div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Physical & Marital */}
                  {regStep === 4 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-blue"><Heart size={24} /></div><div><h2>Physical & Marital</h2><p>Lifestyle and status.</p></div></div>
                      <div className="crm-field-row mt-4">
                        <AgentSelect label="Marital Status" name="maritalStatus" value={regData.maritalStatus} onChange={handleRegChange} options={dynamicOptions.MaritalStatus} required={true} icon={Heart} />
                        <AgentSelect label="Height" name="height" value={regData.height} onChange={handleRegChange} options={dynamicOptions.Height} required={true} icon={Ruler} />
                      </div>
                      <div className="mt-4">
                        <AgentSelect label="Diet" name="diet" value={regData.diet} onChange={handleRegChange} options={dynamicOptions.Diet} required={true} icon={Utensils} />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Socio-Cultural */}
                  {regStep === 5 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-yellow"><Globe size={24} /></div><div><h2>Socio-Cultural</h2><p>Community specifics.</p></div></div>
                      <div className="crm-field-row mt-4">
                        <AgentComboInput label="Community" name="community" value={regData.community} onChange={handleRegChange} options={masterCommunities} required={true} />
                        <AgentComboInput label="Caste" name="caste" value={regData.caste} onChange={handleRegChange} options={availableSubCommunities} required={true} />
                      </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                        <label>Gothra <span className="text-red-req">*</span></label>
                        <div className="crm-input-inner"><Users size={18} className="crm-field-icon" /><input type="text" name="gothra" value={regData.gothra} onChange={handleRegChange} placeholder="Enter Gothra" required /></div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Education */}
                  {regStep === 6 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-green"><GraduationCap size={24} /></div><div><h2>Education</h2><p>Academic background.</p></div></div>
                      <div className="mt-4">
                          <AgentComboInput label="Highest Qualification" name="highestQualification" value={regData.highestQualification} onChange={handleRegChange} options={dynamicOptions.Education} required={true} icon={GraduationCap} />
                          </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                        <label>College/University</label>
                        <div className="crm-input-inner"><GraduationCap size={18} className="crm-field-icon" /><input type="text" name="collegeName" value={regData.collegeName} onChange={handleRegChange} placeholder="Highest degree college"/></div>
                      </div>
                    </div>
                  )}

                  {/* STEP 7: Career Details */}
                  {regStep === 7 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-amber"><Briefcase size={24} /></div><div><h2>Career Details</h2><p>Professional background.</p></div></div>
                      <div className="crm-field-row mt-4">
                          <AgentSelect label="Work Sector" name="workType" value={regData.workType} onChange={handleRegChange} options={dynamicOptions.Sector} required={false} icon={Building2} />
                          <AgentComboInput label="Job Role" name="jobRole" value={regData.jobRole} onChange={handleRegChange} options={dynamicOptions.Designation} required={false} icon={User} />
                      </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                          <label>Company Name</label>
                          <div className="crm-input-inner"><Building2 size={18} className="crm-field-icon" /><input type="text" name="companyName" value={regData.companyName} onChange={handleRegChange} placeholder="Current employer" /></div>
                      </div>
                    </div>
                  )}

                  {/* STEP 8: Income & Residency */}
                  {regStep === 8 && (
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-blue"><Wallet size={24} /></div><div><h2>Income & Residency</h2><p>Financial and living status.</p></div></div>
                      <div className="crm-field-row mt-4">
                        <AgentSelect label="Annual Income" name="annualIncome" value={regData.annualIncome} onChange={handleRegChange} options={dynamicOptions.Income} required={false} icon={Wallet} />
                        <AgentSelect label="NRI Status" name="nri" value={regData.nri} onChange={handleRegChange} options={['Yes', 'No']} required={true} icon={Globe} />
                      </div>
                      <div className="crm-input-wrap crm-with-icon mt-4">
                        <label>Residents In</label>
                        <div className="crm-input-inner">
                          <Building2 size={18} className="crm-field-icon" />
                          <select name="residentsIn" value={regData.residentsIn} onChange={handleRegChange}>
                            <option value="Own">Own</option>
                            <option value="Rent">Rent</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 9: Location */}
                  {regStep === 9 && ( 
                    <div className="crm-step-panel crm-slide-up">
                      <div className="crm-panel-header"><div className="crm-panel-icon crm-grad-red"><MapPin size={24} /></div><div><h2>Location</h2><p>Current geographic details.</p></div></div>
                      <div className="mt-4">
                        <AgentComboInput label="Country" name="country" value={regData.country} onChange={handleRegChange} options={dynamicOptions.Country} required={true} icon={Globe} />
                      </div>
                      <div className="crm-field-row mt-4">
                        <div onClick={() => !regData.country && toast.info("Please select a Country first")}><AgentComboInput label="State" name="state" value={regData.state} onChange={handleRegChange} options={availableStates} required={true} icon={Map} disabled={!regData.country} /></div>
                        <div onClick={() => regData.country && !regData.state && toast.info("Please select a State first")}><AgentComboInput label="City" name="city" value={regData.city} onChange={handleRegChange} options={availableCities} required={true} icon={MapPin} disabled={!regData.state} /></div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="crm-form-footer">
                {regStep > 1 ? (<button type="button" className="crm-btn-ghost" onClick={prevRegStep}>Back</button>) : ( <div></div> )}
                {regStep === TOTAL_STEPS ? (
                  <button type="submit" form="crm-agent-reg" className="crm-btn-red crm-pulse-anim" disabled={regLoading}>
                      {regLoading ? 'Processing...' : 'Complete Profile'} <CheckCircle size={18} />
                  </button>
                ) : (
                  <button type="button" className="crm-btn-red" onClick={nextRegStep}>Continue <ArrowRight size={18} /></button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MEMBERSHIP PAYMENTS */}
        {activeTab === 'mem_payments' && (
          <div className="crm-fade-in">
             <header className="crm-view-header">
              <div className="crm-header-text">
                <h1>Membership Log</h1>
                <p className="crm-subtext">Track client subscription payments</p>
              </div>
            </header>

            <div className="crm-search-box">
               <Search size={18} className="crm-search-icon" />
               <input type="text" placeholder="Search by name or reference ID..." value={paymentSearch} onChange={e => {setPaymentSearch(e.target.value); setPaymentPage(1);}} />
            </div>

            {dashboardLoading ? <ListSkeleton /> : (
              <div className="crm-list-wrapper">
                <div className="crm-list-header crm-grid-payments">
                  <div>Client</div><div>Amount</div><div>UTR / Ref</div><div>Proof</div><div>Status</div>
                </div>
                <div className="crm-list-body">
                  {paginatedPayments.length === 0 && <div className="crm-empty-view"><CreditCard size={40} /><h3>No payment records</h3></div>}
                  {paginatedPayments.map(p => (
                    <div className="crm-list-item crm-grid-payments" key={p._id}>
                      <div className="crm-list-cell" data-label="Client"><div className="crm-cell-content crm-text-primary">{p.userId?.firstName} {p.userId?.lastName}</div></div>
                      <div className="crm-list-cell" data-label="Amount"><div className="crm-cell-content crm-text-primary">₹{p.amount?.toLocaleString()}</div></div>
                      <div className="crm-list-cell" data-label="UTR / Ref"><div className="crm-cell-content crm-mono-text">{p.utrNumber}</div></div>
                      <div className="crm-list-cell" data-label="Proof"><div className="crm-cell-content"><button className="crm-btn-link" onClick={() => setShowImageModal(p.screenshotUrl)}>View</button></div></div>
                      <div className="crm-list-cell" data-label="Status"><div className="crm-cell-content">{renderStatusBadge(p.status)}</div></div>
                    </div>
                  ))}
                </div>

                <div className="crm-pagination">
                   <button className="crm-page-btn" disabled={paymentPage === 1} onClick={() => setPaymentPage(paymentPage - 1)}>Previous</button>
                   <span className="crm-page-info">Page {paymentPage} of {totalPaymentPages}</span>
                   <button className="crm-page-btn" disabled={paymentPage >= totalPaymentPages} onClick={() => setPaymentPage(paymentPage + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MATCH ACTIVITY */}
        {activeTab === 'int_status' && (
          <div className="crm-fade-in">
             <header className="crm-view-header">
              <div className="crm-header-text">
                <h1>Match Activity</h1>
                <p className="crm-subtext">Monitor interest requests sent and received</p>
              </div>
            </header>

            <div className="crm-search-box">
               <Search size={18} className="crm-search-icon" />
               <input type="text" placeholder="Search client or match name..." value={activitySearch} onChange={e => {setActivitySearch(e.target.value); setActivityPage(1);}} />
            </div>

            {dashboardLoading ? <ListSkeleton /> : (
              <div className="crm-list-wrapper">
                <div className="crm-list-header crm-grid-activity">
                  <div>Direction</div><div>My Client</div><div>Match Profile</div><div>Date</div><div>Status</div>
                </div>
                <div className="crm-list-body">
                  {paginatedActivity.length === 0 && <div className="crm-empty-view"><Activity size={40} /><h3>No Match Activity</h3></div>}
                  {paginatedActivity.map(item => (
                    <div className="crm-list-item crm-grid-activity" key={item.interestId}>
                      <div className="crm-list-cell" data-label="Direction"><div className="crm-cell-content"><span className={`crm-dir-icon ${item.direction === 'Sent' ? 'is-sent' : 'is-recv'}`}>{item.direction === 'Sent' ? '↗' : '↙'}</span></div></div>
                      <div className="crm-list-cell" data-label="My Client"><div className="crm-cell-content"><div className="crm-text-primary">{item.myClient?.firstName} {item.myClient?.lastName}</div><div className="crm-text-secondary">{item.myClient?.uniqueId}</div></div></div>
                      <div className="crm-list-cell" data-label="Match Profile"><div className="crm-cell-content"><div className="crm-text-primary">{item.matchProfile?.firstName} {item.matchProfile?.lastName}</div><div className="crm-text-secondary">{item.matchProfile?.uniqueId}</div></div></div>
                      <div className="crm-list-cell" data-label="Date"><div className="crm-cell-content crm-text-secondary">{new Date(item.date).toLocaleDateString()}</div></div>
                      <div className="crm-list-cell" data-label="Status"><div className="crm-cell-content">{renderStatusBadge(item.status)}</div></div>
                    </div>
                  ))}
                </div>

                <div className="crm-pagination">
                   <button className="crm-page-btn" disabled={activityPage === 1} onClick={() => setActivityPage(activityPage - 1)}>Previous</button>
                   <span className="crm-page-info">Page {activityPage} of {totalActivityPages}</span>
                   <button className="crm-page-btn" disabled={activityPage >= totalActivityPages} onClick={() => setActivityPage(activityPage + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="crm-bottom-nav">
        <button className={activeTab === 'overview' ? 'tab-active crm-nav-blue' : ''} onClick={() => handleNavClick('overview')}><Clock size={20} /><span className="crm-nav-text">Home</span></button>
        <button className={activeTab === 'users' ? 'tab-active crm-nav-green' : ''} onClick={() => handleNavClick('users')}><Users size={20} /><span className="crm-nav-text">Clients</span></button>
        <div className={`crm-bottom-nav-main-wrapper ${activeTab === 'register' ? 'tab-active' : ''}`} onClick={() => handleNavClick('register')}><div className="main-fab"><UserPlus size={20} /></div></div>
        <button className={activeTab === 'mem_payments' ? 'tab-active crm-nav-amber' : ''} onClick={() => handleNavClick('mem_payments')}><CreditCard size={20} /><span className="crm-nav-text">Payments</span></button>
        <button className={activeTab === 'int_status' ? 'tab-active crm-nav-red' : ''} onClick={() => handleNavClick('int_status')}><Activity size={20} /><span className="crm-nav-text">Activity</span></button>
      </nav>

      {showImageModal && (
        <div className="crm-modal-bg crm-fade-in" onClick={() => setShowImageModal(null)}>
          <div className="crm-modal-content" onClick={e => e.stopPropagation()}>
            <button className="crm-modal-close" onClick={() => setShowImageModal(null)}><X size={20} /></button>
            <img src={showImageModal} alt="Payment Proof" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;

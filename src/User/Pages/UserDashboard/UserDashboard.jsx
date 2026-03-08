import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../Components/Navbar.jsx"; 
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import './UserDashboard.css';

// --- SVG ICONS ---
const Icons = {
  Female: () => <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%"><path d="M12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z" fill="#F59E0B" /><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2Z" fill="#DC2626" /></svg>,
  Male: () => <svg viewBox="0 0 24 24" fill="#3B82F6" width="100%" height="100%"><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z"/></svg>,
  Verify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
};

// --- SEARCHABLE COMBO INPUT ---
const DashboardComboInput = ({ label, name, value, onChange, options, required, onKeyDown }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState(options || []);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
  
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
      
      if (inputRef.current) {
        const form = inputRef.current.closest('form');
        if (form) {
          const focusableElements = Array.from(form.querySelectorAll('input, select, button[type="submit"]'));
          const index = focusableElements.indexOf(inputRef.current);
          if (index > -1 && index < focusableElements.length - 1) {
            focusableElements[index + 1].focus();
          }
        }
      }
    };
  
    return (
      <div className="ud-form-group" ref={wrapperRef} style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
        <label className="ud-label">{label} {required && <span className="ud-required">*</span>}</label>
        <div style={{ position: 'relative' }}>
          <input 
            ref={inputRef}
            type="text" name={name} value={value} onChange={handleInputChange} 
            onFocus={() => { setIsOpen(true); setFiltered(options || []); }}
            onKeyDown={onKeyDown}
            placeholder="Type or select..." className="ud-input" autoComplete="off" required={required}
          />
          <div style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: '#64748b' }} onClick={() => setIsOpen(!isOpen)}>
            <Icons.ChevronDown />
          </div>
          
          {isOpen && filtered && filtered.length > 0 && (
            <ul className="ud-combo-dropdown">
              {filtered.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.name;
                return (
                  <li key={idx} onClick={() => handleSelect(text)}>
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

const DashboardSkeleton = () => (
  <div className="ud-grid">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="ud-skeleton-card">
        <div className="ud-sk-circle ud-sk-animate"></div>
        <div className="ud-sk-line ud-w-80 ud-sk-animate"></div>
        <div className="ud-sk-line ud-w-40 ud-sk-animate"></div>
        <div className="ud-sk-block ud-sk-animate"></div>
      </div>
    ))}
  </div>
);

// --- USER FRIENDLY STATUS LABELS ---
const getUserFriendlyStatus = (status) => {
    switch (status) {

        case 'PendingAdminPhase1':
            return 'Request Under Admin Review';

        case 'PendingUser':
            return 'Awaiting Member Response';

        case 'PendingAdminPhase2':
            return 'Final Verification in Progress';

        case 'Accepted':
        case 'Finalized':
            return 'Connection Established';

        case 'Declined':
            return 'Interest Declined';

        case 'Rejected':
            return 'Request Not Approved';

        case 'PendingPaymentVerification':
            return 'Payment Verification in Progress';

        case 'PendingAdmin':
            return 'Awaiting Admin Approval';

        default:
            return 'Processing';
    }
};

const formatDisplayName = (fullName) => {
  if (!fullName) return "Unknown";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

  const knownSurnames = ["adepu", "reddy", "sharma", "goud", "rao", "yadav", "patel", "singh", "kumar"];
  let surname = "";
  let givenName = "";
  const firstWord = parts[0].toLowerCase();
  const lastWord = parts[parts.length - 1].toLowerCase();

  if (knownSurnames.includes(firstWord)) {
      surname = parts[0]; givenName = parts.slice(1).join(" ");
  } else if (knownSurnames.includes(lastWord)) {
      surname = parts[parts.length - 1]; givenName = parts.slice(0, -1).join(" ");
  } else {
      surname = parts[parts.length - 1]; givenName = parts.slice(0, -1).join(" ");
  }

  const surnameInitial = surname.charAt(0).toUpperCase();
  const formattedGivenName = givenName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return `${surnameInitial}. ${formattedGivenName}`;
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [regPaymentStatus, setRegPaymentStatus] = useState(null);

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);

  // ALL DYNAMIC OPTIONS
  const [dynamicOptions, setDynamicOptions] = useState({
    Moonsign: [], Star: [], Pada: [], MotherTongue: [], Complexion: [],
    Education: [], Designation: [], MaritalStatus: [], State: [], City: [], Diet: [], Income: [], Country: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // ALL FILTER STATES (Removed minSalary)
  const [filters, setFilters] = useState({
    searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
    education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
    country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: ''
  });

  const [needsExtraDetails, setNeedsExtraDetails] = useState(false);
  const [showExtraDetailsModal, setShowExtraDetailsModal] = useState(false);
  const [submittingExtraDetails, setSubmittingExtraDetails] = useState(false);
  const [extraDetailsForm, setExtraDetailsForm] = useState({
      moonsign: '', star: '', pada: '', motherTongue: '', timeOfBirth: '', placeOfBirth: '', nativeLocation: '', complexion: '',
      fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', noOfBrothers: 0, noOfBrothersMarried: 0, noOfSisters: 0, noOfSistersMarried: 0
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [needsPhotos, setNeedsPhotos] = useState(false);
  const [photoFiles, setPhotoFiles] = useState({ primary: null, secondary: null }); 
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api/user";
  const PUBLIC_API_BASE = "https://kalyanashobha-back.vercel.app/api/public";

  useEffect(() => {
    fetchFeedAndData({});
    fetchCommunities();
    fetchDynamicOptions(); 
    fetchUserStatuses(); 
  }, []);

  const fetchDynamicOptions = async () => {
    const categories = ['Moonsign', 'Star', 'Pada', 'MotherTongue', 'Complexion', 'Education', 'Designation', 'MaritalStatus', 'State', 'City', 'Diet', 'Income', 'Country'];
    const newOptions = { ...dynamicOptions };
    
    await Promise.all(categories.map(async (category) => {
      try {
        const res = await fetch(`${PUBLIC_API_BASE}/master-data/${category}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          newOptions[category] = json.data.map(item => item.name);
        }
      } catch (err) { console.error(`Failed to fetch master data for ${category}`); }
    }));
    
    setDynamicOptions(newOptions);
  };

  const fetchUserStatuses = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      let activeUserId = userId;
      if (!activeUserId) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          activeUserId = storedUser._id || storedUser.id;
      }

      if (!token || !activeUserId) return;

      try {
          const extraRes = await fetch(`${API_BASE_URL}/extra-details/${activeUserId}`, { headers: { 'Authorization': token } });
          const extraData = await extraRes.json();
          if (extraData.success && !extraData.hasAstrologyAndFamilyDetails) {
              setNeedsExtraDetails(true);
              setShowExtraDetailsModal(true); 
          }

          const photoRes = await fetch(`${API_BASE_URL}/photos-status`, { headers: { 'Authorization': token } });
          const photoData = await photoRes.json();
          if (photoData.success && !photoData.hasPhotos) {
              setNeedsPhotos(true);
          }
      } catch (err) {
          console.error("Failed to fetch user status", err);
      }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
      const data = await response.json();
      if (data.success) setMasterCommunities(data.data);
    } catch (err) { console.error("Failed to load communities", err); }
  };

  const fetchFeedAndData = async (filterData) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      setSearchLoading(true);
      const feedRes = await fetch(`${API_BASE_URL}/dashboard/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(filterData)
      });
      const feedData = await feedRes.json();

      if (feedData.success) {
        setMatches(feedData.data);
        setIsPremium(feedData.isPremium || false);

        if (Object.keys(filterData).length > 0 && feedData.count > 0) toast.success(`Found ${feedData.count} matches`);
        else if (Object.keys(filterData).length > 0 && feedData.count === 0) toast("No matches found");

        if (!feedData.isPremium) {
          const regRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", { headers: { 'Authorization': token } });
          const regData = await regRes.json();
          if (regData.success && regData.paymentFound) setRegPaymentStatus(regData.data);
        }
      } else {
        if (feedRes.status === 401) { localStorage.removeItem('token'); navigate('/login'); }
        toast.error(feedData.message || "Failed to load data");
      }

    } catch (err) {
      toast.error("Network error");
    } finally {
      setDashboardLoading(false);
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'community') {
      const found = masterCommunities.find(c => c.name === value);
      if (found) setAvailableSubCommunities(found.subCommunities || []);
      else setAvailableSubCommunities([]);
      setFilters(prev => ({ ...prev, community: value === "Any" ? "" : value, subCommunity: '' }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value === "Any" ? "" : value }));
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (!isPremium) return toast.error("Upgrade to Premium to search matches!");
    fetchFeedAndData(filters);
  };

  const clearFilters = () => {
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    const emptyFilters = { 
        searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
        education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
        country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: '' 
    };
    setFilters(emptyFilters);
    setAvailableSubCommunities([]);
    fetchFeedAndData(emptyFilters); 
  };

  const handleVerifyClick = () => {
    if (regPaymentStatus?.status === 'PendingVerification') {
        toast("Verification is currently in progress. Please wait for admin approval.", { icon: '⏳' });
        return;
    }
    
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; }
    
    navigate('/payment-registration');
  };

  const handleExtraDetailsChange = (e) => {
      const { name, value } = e.target;
      setExtraDetailsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEnterToNext = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault(); 
      const form = e.target.closest('form');
      const focusableElements = Array.from(form.querySelectorAll('input, select, button[type="submit"]'));
      const index = focusableElements.indexOf(e.target);
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  const submitExtraDetails = async (e) => {
      e.preventDefault();
      setSubmittingExtraDetails(true);
      
      let userId = localStorage.getItem('userId');
      if (!userId) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          userId = storedUser._id || storedUser.id;
      }

      if (!userId) {
          toast.error("Session expired. Please login again.");
          setSubmittingExtraDetails(false);
          return;
      }

      const payload = {
          userId: userId,
          astrologyDetails: {
              moonsign: extraDetailsForm.moonsign,
              star: extraDetailsForm.star,
              pada: extraDetailsForm.pada,
              motherTongue: extraDetailsForm.motherTongue,
              timeOfBirth: extraDetailsForm.timeOfBirth,
              placeOfBirth: extraDetailsForm.placeOfBirth,
              nativeLocation: extraDetailsForm.nativeLocation,
              complexion: extraDetailsForm.complexion
          },
          familyDetails: {
              fatherName: extraDetailsForm.fatherName,
              fatherOccupation: extraDetailsForm.fatherOccupation,
              motherName: extraDetailsForm.motherName,
              motherOccupation: extraDetailsForm.motherOccupation,
              noOfBrothers: Number(extraDetailsForm.noOfBrothers),
              noOfBrothersMarried: Number(extraDetailsForm.noOfBrothersMarried),
              noOfSisters: Number(extraDetailsForm.noOfSisters),
              noOfSistersMarried: Number(extraDetailsForm.noOfSistersMarried)
          }
      };

      try {
          const res = await fetch(`${API_BASE_URL}/extra-details`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': localStorage.getItem('token') 
              },
              body: JSON.stringify(payload)
          });
          
          const data = await res.json();
          if (data.success) {
              setNeedsExtraDetails(false);
              setShowExtraDetailsModal(false);
              toast.success("Additional details saved successfully!");
              
              if (needsPhotos) { setShowPhotoModal(true); } 
          } else {
              toast.error(data.message);
          }
      } catch (err) {
          toast.error("Network error while saving details");
      } finally {
          setSubmittingExtraDetails(false);
      }
  };

  const handlePhotoSelect = (type, file) => { if (file) setPhotoFiles(prev => ({ ...prev, [type]: file })); };

    const submitPhotos = async (e) => {
    e.preventDefault();
    
    if (!photoFiles.primary || !photoFiles.secondary) {
        return toast.error("Essential photos required");
    }

    // --- Check file sizes before uploading (Limit to 4MB total) ---
    const primarySizeMB = photoFiles.primary.size / (1024 * 1024);
    const secondarySizeMB = photoFiles.secondary.size / (1024 * 1024);
    
    if (primarySizeMB + secondarySizeMB > 4) {
        return toast.error("Photos are too large! Please choose images under 2MB each.");
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('photos', photoFiles.primary);
    formData.append('photos', photoFiles.secondary);
  
    try {
      const res = await fetch(`${API_BASE_URL}/upload-photos`, {
        method: 'POST', 
        headers: { 'Authorization': localStorage.getItem('token') }, 
        body: formData
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error Response:", errorText);
        throw new Error(`Server returned status: ${res.status}`);
      }
  
      const data = await res.json();
      if (data.success || res.ok) { 
          setNeedsPhotos(false); 
          setShowPhotoModal(false); 
          toast.success("Photos updated");
          navigate('/payment-registration');
      } else { 
          toast.error(data.message); 
      }
    } catch (error) { 
        console.error("Upload Error:", error);
        toast.error(`Upload failed: ${error.message}`); 
    } finally { 
        setUploading(false); 
    }
  };


  const handleConnect = async (profile) => {
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; } 
    
    if (!isPremium) {
       if (regPaymentStatus?.status === 'PendingVerification') toast("Verification in progress");
       else handleVerifyClick();
       return;
    }
    
    setActionLoading(true);
    try {
      const res = await fetch("https://kalyanashobha-back.vercel.app/api/interest/send", {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') 
        }, 
        body: JSON.stringify({ receiverId: profile.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setMatches(prev => prev.map(m => m.id === profile.id ? { ...m, interestStatus: 'PendingAdminPhase1' } : m));
        toast.success("Interest sent to Admin for approval");
      } else { 
        if (data.currentStatus) {
            setMatches(prev => prev.map(m => m.id === profile.id ? { ...m, interestStatus: data.currentStatus } : m));
        }
        toast.error(data.message); 
      }
    } catch { 
        toast.error("Network error"); 
    } finally { 
        setActionLoading(false); 
    }
  };

  const renderStatusBtn = (profile) => {
    const status = profile.interestStatus;
    if (status && status !== 'Rejected') {
        return (
            <button className="ud-btn ud-btn-disabled" disabled>
                {getUserFriendlyStatus(status)}
            </button>
        );
    }
    return (
      <button 
        className={`ud-btn ${!isPremium ? 'ud-btn-locked' : 'ud-btn-accent'}`} 
        onClick={() => handleConnect(profile)}
        disabled={actionLoading}
      >
        {!isPremium ? <><Icons.Lock /> Verify to Connect</> : (actionLoading ? "Sending..." : "Send Interest")}
      </button>
    );
  };

  return (
    <>
      <Navbar />
      <Toaster toastOptions={{ style: { background: '#1e293b', color: '#fff', fontFamily: 'Inter' } }} />

      <div className="ud-dashboard">
        <div className="ud-container ud-header-section">
          <p className="ud-subtitle">Find your perfect match</p>
        </div>

        {dashboardLoading ? <DashboardSkeleton /> : (
          <div className="ud-container">

            {/* --- SEARCH SECTION --- */}
            <div className="ud-search-section">
              <div className="ud-search-card">
                {!isPremium && (
                  <div className="ud-search-locked-overlay" onClick={handleVerifyClick} style={{ cursor: regPaymentStatus?.status === 'PendingVerification' ? 'default' : 'pointer' }}>
                    {regPaymentStatus?.status === 'PendingVerification' ? (
                      <><div className="ud-pending-status"><Icons.Verify /> Verification Pending</div><p className="ud-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Waiting for admin approval.</p></>
                    ) : (
                      <><div className="ud-lock-msg"><Icons.Lock /> Premium Search</div><p className="ud-subtitle" style={{ fontSize: '0.8rem' }}>Verify profile to use Advanced Filters</p></>
                    )}
                  </div>
                )}

                <div className="ud-search-bar">
                  <div className="ud-search-input-group">
                    <div className="ud-search-icon-box"><Icons.Search /></div>
                    <input type="text" name="searchId" className="ud-main-search-input" placeholder="Search by ID (e.g. KS1023)..." value={filters.searchId} onChange={handleFilterChange} disabled={!isPremium}/>
                  </div>
                  <button className={`ud-filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => isPremium && setShowFilters(!showFilters)} disabled={!isPremium}><Icons.Filter /> Advanced <Icons.ChevronDown /></button>
                  <button className="ud-btn ud-btn-primary" style={{width:'auto', padding:'0.75rem 1.5rem'}} onClick={handleSearch} disabled={!isPremium || searchLoading}>{searchLoading ? 'Searching...' : 'Search'}</button>
                </div>

                {/* --- FILTERS PANEL --- */}
                {showFilters && isPremium && (
                  <div className="ud-filters-panel">
                    <div className="ud-filters-grid">
                      <div className="ud-form-group">
                        <label className="ud-label">Age (Years)</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <input type="number" name="minAge" placeholder="Min" className="ud-input" value={filters.minAge} onChange={handleFilterChange}/>
                          <input type="number" name="maxAge" placeholder="Max" className="ud-input" value={filters.maxAge} onChange={handleFilterChange}/>
                        </div>
                      </div>
                      
                      <div className="ud-form-group">
                        <label className="ud-label">Marital Status</label>
                        <select name="maritalStatus" className="ud-input" value={filters.maritalStatus} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.MaritalStatus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Education</label>
                        <select name="education" className="ud-input" value={filters.education} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Education.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Community</label>
                        <select name="community" className="ud-input" value={filters.community} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {masterCommunities.map((c, idx) => (<option key={idx} value={c.name}>{c.name}</option>))}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Sub-Community / Caste</label>
                        <select name="subCommunity" className="ud-input" value={filters.subCommunity} onChange={handleFilterChange} disabled={!filters.community}>
                          <option value="">Any</option>
                          {availableSubCommunities.map((sub, idx) => { 
                            const val = typeof sub === 'string' ? sub : sub.name; 
                            return <option key={idx} value={val}>{val}</option>; 
                          })}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Occupation</label>
                        <select name="occupation" className="ud-input" value={filters.occupation} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Designation.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Country</label>
                        <select name="country" className="ud-input" value={filters.country} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Country.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">State</label>
                        <select name="state" className="ud-input" value={filters.state} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.State.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">City</label>
                        <select name="city" className="ud-input" value={filters.city} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.City.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Mother Tongue</label>
                        <select name="motherTongue" className="ud-input" value={filters.motherTongue} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.MotherTongue.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Star (Nakshatram)</label>
                        <select name="star" className="ud-input" value={filters.star} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Star.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Pada</label>
                        <select name="pada" className="ud-input" value={filters.pada} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Pada.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Diet</label>
                        <select name="diet" className="ud-input" value={filters.diet} onChange={handleFilterChange}>
                          <option value="">Any</option>
                          {dynamicOptions.Diet.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="ud-form-group">
                        <label className="ud-label">Height (Cm)</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <input type="number" name="minHeight" placeholder="Min" className="ud-input" value={filters.minHeight} onChange={handleFilterChange}/>
                          <input type="number" name="maxHeight" placeholder="Max" className="ud-input" value={filters.maxHeight} onChange={handleFilterChange}/>
                        </div>
                      </div>
                    </div>
                    <div className="ud-filter-actions">
                      <button className="ud-btn ud-btn-outline" style={{width:'auto'}} onClick={clearFilters}>Reset All</button>
                      <button className="ud-btn ud-btn-accent" style={{width:'auto'}} onClick={handleSearch}>Apply Filters</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- BANNER --- */}
            {!isPremium && regPaymentStatus?.status !== 'PendingVerification' && (
              <div className="ud-banner">
                <div className="ud-banner-info"><h3>Complete Verification</h3><p>Unlock premium features to connect with profiles.</p></div>
                <button className="ud-btn ud-btn-primary" style={{width:'auto'}} onClick={handleVerifyClick}>Verify Now</button>
              </div>
            )}

            {/* --- EMPTY STATE --- */}
            {matches.length === 0 && (
              <div className="ud-empty-state">
                <div style={{width:'60px', height:'60px', margin:'0 auto', color:'#cbd5e1'}}><Icons.Search /></div>
                <h3>No Matches Found</h3>
                <p>Try adjusting your filters.</p>
                {filters.searchId || filters.minAge || filters.community ? (
                    <button className="ud-btn ud-btn-outline" style={{marginTop:'1rem', width:'auto', display:'inline-flex'}} onClick={clearFilters}>Clear Filters</button>
                ) : null}
              </div>
            )}

            {/* --- GRID --- */}
            <div className="ud-grid">
              {matches.map((profile) => (
                <div key={profile.id} className="ud-card">
                  <div className="ud-card-header"><div className="ud-avatar-box">{profile.gender === 'Male' ? <Icons.Male /> : <Icons.Female />}</div></div>
                  <div className="ud-card-body">
                    <div className="ud-profile-header">
                      <div className="ud-name">{formatDisplayName(profile.name)} <Icons.Verify /></div>
                      <span className="ud-age-badge">{profile.age} Yrs</span>
                    </div>
                    
                    <p className="ud-job">{profile.occupation || profile.job || "Not Specified"}</p>
                    <div className="ud-info-grid">
                      <div className="ud-info-item"><span className="ud-lbl">Education</span><span className="ud-val">{profile.education || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Community</span><span className="ud-val">{profile.community || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Sub-Community</span><span className="ud-val">{profile.subCommunity || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Location</span><span className="ud-val">{profile.location || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">ID</span><span className="ud-val">{profile.uniqueId || "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Height</span><span className="ud-val">{profile.height ? `${profile.height} cm` : "--"}</span></div>
                      <div className="ud-info-item"><span className="ud-lbl">Status</span><span className="ud-val">{profile.status || "--"}</span></div>
                    </div>
                    <div style={{marginTop:'auto'}}>
                       {renderStatusBtn(profile)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- EXTRA DETAILS MODAL --- */}
      {showExtraDetailsModal && (
        <div className="ud-overlay">
          <div className="ud-modal-large">
            {/* Sticky Header */}
            <div className="ud-modal-header">
               <div>
                  <h2 className="ud-title">Complete Your Profile</h2>
                  <p className="ud-subtitle">Please provide these details to proceed with verification.</p>
               </div>
               <button className="ud-close-btn" onClick={() => setShowExtraDetailsModal(false)}>✕</button>
            </div>
            
            <div className="ud-modal-body">
               {/* Added onKeyDown to Form to capture Enter presses */}
               <form onSubmit={submitExtraDetails} onKeyDown={handleEnterToNext}>
                 
                 <div className="ud-form-section">
                   <h4 className="ud-section-title">Additional Details</h4>
                   <div className="ud-grid-2">
                     <DashboardComboInput label="Moonsign" name="moonsign" value={extraDetailsForm.moonsign} onChange={handleExtraDetailsChange} options={dynamicOptions.Moonsign} required={true} onKeyDown={handleEnterToNext} />
                     <DashboardComboInput label="Star (Nakshatram)" name="star" value={extraDetailsForm.star} onChange={handleExtraDetailsChange} options={dynamicOptions.Star} required={true} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Pada/Quarter" name="pada" value={extraDetailsForm.pada} onChange={handleExtraDetailsChange} options={dynamicOptions.Pada} required={false} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Mother Tongue" name="motherTongue" value={extraDetailsForm.motherTongue} onChange={handleExtraDetailsChange} options={dynamicOptions.MotherTongue} required={true} onKeyDown={handleEnterToNext}/>
                     
                     <div className="ud-form-group">
                       <label className="ud-label">Time of Birth</label>
                       <input type="text" name="timeOfBirth" className="ud-input" placeholder="e.g. 9:30 AM" value={extraDetailsForm.timeOfBirth} onChange={handleExtraDetailsChange}/>
                     </div>
                     
                     <div className="ud-form-group"><label className="ud-label">Place of Birth</label><input type="text" name="placeOfBirth" className="ud-input" placeholder="City or Village name" value={extraDetailsForm.placeOfBirth} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">Native Location</label><input type="text" name="nativeLocation" className="ud-input" placeholder="Native Place" value={extraDetailsForm.nativeLocation} onChange={handleExtraDetailsChange}/></div>
                     
                     <DashboardComboInput label="Complexion" name="complexion" value={extraDetailsForm.complexion} onChange={handleExtraDetailsChange} options={dynamicOptions.Complexion} required={false} onKeyDown={handleEnterToNext}/>
                   </div>
                 </div>

                 <div className="ud-form-section">
                   <h4 className="ud-section-title">Family Information</h4>
                   <div className="ud-grid-2">
                     <div className="ud-form-group"><label className="ud-label">Father's Name <span className="ud-required">*</span></label><input type="text" name="fatherName" className="ud-input" value={extraDetailsForm.fatherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="ud-form-group"><label className="ud-label">Father's Occupation</label><input type="text" name="fatherOccupation" className="ud-input" value={extraDetailsForm.fatherOccupation} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">Mother's Name <span className="ud-required">*</span></label><input type="text" name="motherName" className="ud-input" value={extraDetailsForm.motherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="ud-form-group"><label className="ud-label">Mother's Occupation</label><input type="text" name="motherOccupation" className="ud-input" value={extraDetailsForm.motherOccupation} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">No. of Brothers</label><input type="number" name="noOfBrothers" className="ud-input" min="0" value={extraDetailsForm.noOfBrothers} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">Brothers Married</label><input type="number" name="noOfBrothersMarried" className="ud-input" min="0" value={extraDetailsForm.noOfBrothersMarried} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">No. of Sisters</label><input type="number" name="noOfSisters" className="ud-input" min="0" value={extraDetailsForm.noOfSisters} onChange={handleExtraDetailsChange}/></div>
                     <div className="ud-form-group"><label className="ud-label">Sisters Married</label><input type="number" name="noOfSistersMarried" className="ud-input" min="0" value={extraDetailsForm.noOfSistersMarried} onChange={handleExtraDetailsChange}/></div>
                   </div>
                 </div>

                 <div className="ud-modal-footer">
                    <button type="submit" className="ud-btn ud-btn-primary ud-btn-large" disabled={submittingExtraDetails}>
                      {submittingExtraDetails ? "Saving..." : "Save Details & Continue"}
                    </button>
                 </div>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* --- PHOTO MODAL --- */}
      {showPhotoModal && (
        <div className="ud-overlay">
          <div className="ud-modal">
            <button className="ud-close-btn" onClick={() => setShowPhotoModal(false)}>✕</button>
            <h2 className="ud-title">Profile Photos Required</h2>
            <p className="ud-subtitle" style={{marginBottom:'1.5rem'}}>Upload your photos to proceed with verification.</p>
            <form onSubmit={submitPhotos}>
              {['primary', 'secondary'].map((type) => (
                <div key={type} className="ud-form-group">
                  <label className="ud-label">{type === 'primary' ? 'Primary Profile Photo' : 'Secondary Portrait'}</label>
                  <div className={`ud-upload-zone ${photoFiles[type] ? 'active' : ''}`}>
                    <input className="ud-file-input" type="file" accept="image/*" onChange={(e) => handlePhotoSelect(type, e.target.files[0])} />
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem'}}><Icons.Upload /><span className="ud-lbl">{photoFiles[type] ? photoFiles[type].name : "Click to Upload"}</span></div>
                  </div>
                </div>
              ))}
              <button type="submit" className="ud-btn ud-btn-primary" disabled={uploading}>{uploading ? "Uploading..." : "Save & Continue to Payment"}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;

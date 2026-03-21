import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../Components/Navbar.jsx"; 
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import SignatureCanvas from 'react-signature-canvas';
import Footer from '../../Components/Footer.jsx';
import './UserDashboard.css';

// --- STANDARD SVG ICONS (Professional & Scalable) ---
const Icons = {
  Female: () => <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%"><path d="M12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z" fill="#F59E0B" /><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2Z" fill="#DC2626" /></svg>,
  Male: () => <svg viewBox="0 0 24 24" fill="#3B82F6" width="100%" height="100%"><path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 14C7.33 14 4 17.33 4 22H20C20 17.33 16.67 14 12 14Z"/></svg>,
  Verify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Diamond: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M11 3 8 9l4 13 4-13-3-6"></path><path d="M2 9h20"></path></svg>,
  Info: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Loader: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dash-spinner-icon"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
};

// --- HELPER FUNCTION: Convert Canvas Data URL to File Object ---
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// --- CUSTOM TIME PICKER COMPONENT ---
const CustomTimePicker = ({ isOpen, onClose, onSet, initialTime }) => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (isOpen && initialTime) {
      const match = initialTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        setHour(match[1]);
        setMinute(match[2]);
        setPeriod(match[3].toUpperCase());
      }
    }
  }, [isOpen, initialTime]);

  const handleSet = () => {
    if (hour && minute) {
      const formattedHour = hour.padStart(2, '0');
      const formattedMinute = minute.padStart(2, '0');
      onSet(`${formattedHour}:${formattedMinute} ${period}`);
    } else {
      onSet(''); 
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      width: '320px', backgroundColor: '#fff', padding: '0', borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500' }}>Set time</h3>
      </div>
      
      <div style={{ padding: '24px 20px' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Type in time</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" placeholder="12" min="1" max="12" value={hour}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 12) val = '12';
                setHour(val);
              }}
              style={{ width: '100%', fontSize: '1.5rem', textAlign: 'center', border: 'none', borderBottom: '2px solid #6366f1', padding: '8px 0', outline: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>hour</span>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', paddingBottom: '20px' }}>:</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" placeholder="00" min="0" max="59" value={minute}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 59) val = '59';
                setMinute(val);
              }}
              style={{ width: '100%', fontSize: '1.5rem', textAlign: 'center', border: 'none', borderBottom: '2px solid #6366f1', padding: '8px 0', outline: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>minute</span>
          </div>
          <div style={{ flex: 1 }}>
            <select 
              value={period} onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '100%', padding: '12px 8px', fontSize: '1rem', border: 'none', outline: 'none', background: 'transparent', appearance: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              <option value="AM">AM</option><option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px', gap: '16px' }}>
        <button type="button" onClick={() => { setHour(''); setMinute(''); setPeriod('AM'); }} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>CLEAR</button>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>CANCEL</button>
        <button type="button" onClick={handleSet} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer' }}>SET</button>
      </div>
    </div>
  );
};

// --- SEARCHABLE COMBO INPUT ---
const DashboardComboInput = ({ label, name, value, onChange, options, required, onKeyDown, disabled, errorMessage }) => {
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
      if (disabled) return;
      onChange(e); 
      setIsOpen(true);
      const val = e.target.value.toLowerCase();
      setFiltered((options || []).filter(opt => {
         const text = typeof opt === 'string' ? opt : opt.name;
         return text.toLowerCase().includes(val);
      }));
    };

    const handleFocus = () => {
      if (disabled) {
        if (inputRef.current) inputRef.current.blur(); // Don't allow typing
        if (errorMessage) toast(errorMessage, { icon: <Icons.Info /> });
        return;
      }
      setIsOpen(true); 
      setFiltered(options || []);
    }
  
    const handleSelect = (val) => {
      if (disabled) return;
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
      <div 
        className="dash-form-group" 
        ref={wrapperRef} 
        style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}
        onClick={() => {
            if (disabled && errorMessage) toast(errorMessage, { icon: <Icons.Info /> });
        }}
      >
        <label className="dash-label">{label} {required && <span className="dash-required">*</span>}</label>
        <div style={{ position: 'relative' }}>
          <input 
            ref={inputRef} 
            type="text" 
            name={name} 
            value={value} 
            onChange={handleInputChange} 
            onFocus={handleFocus} 
            onKeyDown={onKeyDown}
            placeholder="Type or select..." 
            className="dash-input" 
            autoComplete="off" 
            required={required && !disabled}
            style={{ 
              backgroundColor: disabled ? '#f1f5f9' : '#fff',
              cursor: disabled ? 'not-allowed' : 'text'
            }}
            readOnly={disabled} // Native way to prevent mobile keyboards popping up if disabled
          />
          <div 
            style={{ 
                position: 'absolute', right: '12px', top: '12px', 
                cursor: disabled ? 'not-allowed' : 'pointer', 
                color: '#64748b' 
            }} 
            onClick={() => {
                if (!disabled) setIsOpen(!isOpen)
            }}
          >
            <Icons.ChevronDown />
          </div>
          {isOpen && !disabled && filtered && filtered.length > 0 && (
            <ul className="dash-combo-dropdown">
              {filtered.map((opt, idx) => {
                const text = typeof opt === 'string' ? opt : opt.name;
                return <li key={idx} onClick={() => handleSelect(text)}>{text}</li>
              })}
            </ul>
          )}
        </div>
      </div>
    );
};

const DashboardSkeleton = () => (
  <div className="dash-grid">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="dash-skeleton-card">
        <div className="dash-sk-circle dash-sk-animate"></div>
        <div className="dash-sk-line dash-w-80 dash-sk-animate"></div>
        <div className="dash-sk-line dash-w-40 dash-sk-animate"></div>
        <div className="dash-sk-block dash-sk-animate"></div>
      </div>
    ))}
  </div>
);

const getUserFriendlyStatus = (status) => {
    switch (status) {
        case 'PendingAdminPhase1': return 'Request Under Admin Review';
        case 'PendingUser': return 'Awaiting Member Response';
        case 'PendingAdminPhase2': return 'Final Verification in Progress';
        case 'Accepted':
        case 'Finalized': return 'Connection Established';
        case 'Declined': return 'Interest Declined';
        case 'Rejected': return 'Request Not Approved';
        case 'PendingPaymentVerification': return 'Payment Verification in Progress';
        case 'PendingAdmin': return 'Awaiting Admin Approval';
        default: return 'Processing';
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

// --- HELPER COMPONENT FOR DEPENDENT DROPDOWNS (Used in main filters) ---
const DependentSelect = ({ label, name, value, onChange, disabled, options, emptyOption = "Any", errorMessage }) => {
  return (
    <div className="dash-form-group">
      <label className="dash-label">{label}</label>
      <div 
        style={{ position: 'relative', width: '100%' }}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            toast(errorMessage, { icon: <Icons.Info /> });
          }
        }}
      >
        <select 
          name={name} 
          className="dash-input" 
          value={value} 
          onChange={onChange} 
          disabled={disabled}
          style={{ 
            width: '100%', 
            backgroundColor: disabled ? '#f1f5f9' : '#fff',
            cursor: disabled ? 'pointer' : 'default', 
            pointerEvents: disabled ? 'none' : 'auto' 
          }}
        >
          {disabled ? (
              <option value=""></option>
          ) : (
              <>
                <option value="">{emptyOption}</option>
                {options.map((opt, idx) => {
                  const val = typeof opt === 'string' ? opt : opt.name;
                  return <option key={idx} value={val}>{val}</option>;
                })}
              </>
          )}
        </select>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [regPaymentStatus, setRegPaymentStatus] = useState(null);
  
  const [premiumRequestLoading, setPremiumRequestLoading] = useState(false);
  const [premiumRequested, setPremiumRequested] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState(null); 

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);

  const [filterStates, setFilterStates] = useState([]);
  const [filterCities, setFilterCities] = useState([]);

  // Need separate states for extra details to not conflict with search filters
  const [extraDetailsStates, setExtraDetailsStates] = useState([]);
  const [extraDetailsCities, setExtraDetailsCities] = useState([]);

  const [dynamicOptions, setDynamicOptions] = useState({
    Moonsign: [], Star: [], Pada: [], MotherTongue: [], Complexion: [],
    Education: [], Designation: [], MaritalStatus: [], Diet: [], Income: [], Country: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
    education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
    country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: '', complexion: ''
  });

  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [submittingSignature, setSubmittingSignature] = useState(false);
  
  const sigRef = useRef(null);

  const [needsExtraDetails, setNeedsExtraDetails] = useState(false);
  const [showExtraDetailsModal, setShowExtraDetailsModal] = useState(false);
  const [submittingExtraDetails, setSubmittingExtraDetails] = useState(false);
  
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [extraDetailsForm, setExtraDetailsForm] = useState({
      moonsign: '', star: '', pada: '', motherTongue: '', timeOfBirth: '', placeOfBirth: '', nativeLocation: '', complexion: '',
      country: '', state: '', city: '', // Added country state city to form
      familyType: '', fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', noOfBrothers: 0, noOfBrothersMarried: 0, noOfSisters: 0, noOfSistersMarried: 0
  });

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [needsPhotos, setNeedsPhotos] = useState(false);
  const [photoFiles, setPhotoFiles] = useState({ primary: null, secondary: null }); 
  const [uploading, setUploading] = useState(false);
  const [compressingPhotos, setCompressingPhotos] = useState({ primary: false, secondary: false });

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api/user";
  const PUBLIC_API_BASE = "https://kalyanashobha-back.vercel.app/api/public";

  useEffect(() => {
    const initDashboard = async () => {
      let commData = [];
      try {
        const response = await fetch(`${PUBLIC_API_BASE}/get-all-communities`);
        const data = await response.json();
        if (data.success) {
            setMasterCommunities(data.data);
            commData = data.data;
        }
      } catch (err) { console.error("Failed to load communities", err); }

      fetchDynamicOptions(); 
      fetchUserStatuses(); 

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const statusRes = await fetch(`${API_BASE_URL}/premium-status`, { headers: { 'Authorization': token }});
          const statusData = await statusRes.json();
          if (statusData.success) {
              setPremiumStatus(statusData.status); 
              setPremiumRequested(statusData.status === 'Pending' || statusData.status === 'Contacted');
          }

          const prefRes = await fetch(`${API_BASE_URL}/preference`, { headers: { 'Authorization': token }});
          const prefJson = await prefRes.json();
          
          if (prefJson.success && prefJson.data) {
             const p = prefJson.data;
             const savedFilters = {
                searchId: '', minAge: p.minAge || '', maxAge: p.maxAge || '', minHeight: p.minHeight || '', maxHeight: p.maxHeight || '',
                education: p.education || '', community: p.community || '', subCommunity: p.subCommunity || '',
                occupation: p.occupation || '', maritalStatus: p.maritalStatus || '', country: p.country || '',
                state: p.state || '', city: p.city || '', diet: p.diet || '', motherTongue: p.motherTongue || '',
                star: p.star || '', pada: p.pada || '', complexion: p.complexion || ''
             };
             
             setFilters(savedFilters);
             
             if (p.community) {
                 const found = commData.find(c => c.name === p.community);
                 if (found) setAvailableSubCommunities(found.subCommunities || []);
             }
             
             if (p.country) {
                fetch(`${PUBLIC_API_BASE}/master-data/State?parent=${p.country}`)
                    .then(res => res.json())
                    .then(json => { if(json.success) setFilterStates(json.data.map(d=>d.name)); })
                    .catch(e => {});
             }
             if (p.state) {
                fetch(`${PUBLIC_API_BASE}/master-data/City?parent=${p.state}`)
                    .then(res => res.json())
                    .then(json => { if(json.success) setFilterCities(json.data.map(d=>d.name)); })
                    .catch(e => {});
             }

             fetchFeedAndData(savedFilters);
             return; 
          }
        } catch (e) { console.error("Failed to load user info", e); }
      }
      
      fetchFeedAndData({});
    };

    initDashboard();
  }, []);

  useEffect(() => {
    const checkStatuses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const statusRes = await fetch(`${API_BASE_URL}/premium-status`, { headers: { 'Authorization': token }});
        const statusData = await statusRes.json();
        if (statusData.success) {
            setPremiumStatus(statusData.status);
            setPremiumRequested(statusData.status === 'Pending' || statusData.status === 'Contacted');
            if (statusData.status === 'Resolved') {
               setIsPremium(true); 
            }
        }

        const regRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", { headers: { 'Authorization': token } });
        const regData = await regRes.json();
        if (regData.success && regData.paymentFound) {
            setRegPaymentStatus(regData.data);
        } else {
            setRegPaymentStatus(null);
        }
      } catch (e) {
        console.error("Background status check failed", e);
      }
    };

    const intervalId = setInterval(checkStatuses, 15000); 
    window.addEventListener("focus", checkStatuses);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", checkStatuses);
    };
  }, []);

  const fetchDynamicOptions = async () => {
    const categories = ['Moonsign', 'Star', 'Pada', 'MotherTongue', 'Complexion', 'Education', 'Designation', 'MaritalStatus', 'Diet', 'Income', 'Country'];
    const newOptions = { ...dynamicOptions };
    await Promise.all(categories.map(async (category) => {
      try {
        const res = await fetch(`${PUBLIC_API_BASE}/master-data/${category}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) newOptions[category] = json.data.map(item => item.name);
      } catch (err) {}
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
          const profileRes = await fetch(`${API_BASE_URL}/my-profile`, { headers: { 'Authorization': token } });
          const profileData = await profileRes.json();
          let missingTerms = false;
          
          if (profileData.success && !profileData.user.termsAcceptedAt) {
              setNeedsTermsAcceptance(true);
              setShowTermsModal(true);
              missingTerms = true;
          }

          const extraRes = await fetch(`${API_BASE_URL}/extra-details/${activeUserId}`, { headers: { 'Authorization': token } });
          const extraData = await extraRes.json();
          if (extraData.success && !extraData.hasAstrologyAndFamilyDetails) {
              setNeedsExtraDetails(true);
              
              // Seed Extra Details Form with Profile Locations if they exist
              if (profileData.success && profileData.user) {
                  const u = profileData.user;
                  setExtraDetailsForm(prev => ({
                      ...prev,
                      country: u.country || '',
                      state: u.state || '',
                      city: u.city || ''
                  }));
                  
                  // Fetch state and city options for the extra details modal if pre-filled
                  if (u.country) {
                      fetch(`${PUBLIC_API_BASE}/master-data/State?parent=${u.country}`)
                          .then(r => r.json())
                          .then(j => { if(j.success) setExtraDetailsStates(j.data.map(d=>d.name)); })
                          .catch(e => {});
                  }
                  if (u.state) {
                      fetch(`${PUBLIC_API_BASE}/master-data/City?parent=${u.state}`)
                          .then(r => r.json())
                          .then(j => { if(j.success) setExtraDetailsCities(j.data.map(d=>d.name)); })
                          .catch(e => {});
                  }
              }

              if (!missingTerms) setShowExtraDetailsModal(true); 
          }

          const photoRes = await fetch(`${API_BASE_URL}/photos-status`, { headers: { 'Authorization': token } });
          const photoData = await photoRes.json();
          if (photoData.success && !photoData.hasPhotos) {
              setNeedsPhotos(true);
          }
      } catch (err) {}
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
        else if (Object.keys(filterData).length > 0 && feedData.count === 0) toast("No matches found based on current filters");

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

  const clearSignature = () => {
      if (sigRef.current) sigRef.current.clear();
  };

  const submitTerms = async (e) => {
    e.preventDefault();
    if (!termsAgreed) return toast.error("Please agree to the Terms & Conditions.");
    if (!sigRef.current || sigRef.current.isEmpty()) return toast.error("Please provide your digital signature.");

    setSubmittingSignature(true);

    try {
        const signatureDataURL = sigRef.current.toDataURL("image/png");
        const signatureFile = dataURLtoFile(signatureDataURL, "signature.png");

        const formData = new FormData();
        formData.append('digitalSignature', signatureFile);

        const res = await fetch(`${API_BASE_URL}/accept-terms`, {
            method: 'POST',
            headers: { 'Authorization': localStorage.getItem('token') },
            body: formData
        });
        const data = await res.json();
        
        if (data.success) {
            setNeedsTermsAcceptance(false);
            setShowTermsModal(false);
            toast.success("Terms accepted successfully!");
            
            if (needsExtraDetails) {
                setShowExtraDetailsModal(true);
            } else if (needsPhotos) {
                setShowPhotoModal(true);
            }
        } else {
            toast.error(data.message || "Failed to submit terms.");
        }
    } catch (err) {
        console.error("Terms Submit Error:", err);
        toast.error("Network error. Please try again.");
    } finally {
        setSubmittingSignature(false);
    }
  };

  const handlePremiumRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setPremiumRequestLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/premium-click-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token }
        });
        const data = await response.json();
        
        if (data.success) {
            toast.success("Request sent! Our team will contact you shortly.");
            setPremiumRequested(true);
            setPremiumStatus('Pending'); 
        } else {
            toast.error(data.message || "Something went wrong.");
        }
    } catch (error) {
        console.error("Premium Click Error:", error);
        toast.error("Network error while sending request.");
    } finally {
        setPremiumRequestLoading(false);
    }
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const safeValue = value === "Any" ? "" : value;

    if (name === 'community') {
      const found = masterCommunities.find(c => c.name === safeValue);
      if (found) setAvailableSubCommunities(found.subCommunities || []);
      else setAvailableSubCommunities([]);
      setFilters(prev => ({ ...prev, community: safeValue, subCommunity: '' }));
    } 
    else if (name === 'country') {
      setFilters(prev => ({ ...prev, country: safeValue, state: '', city: '' }));
      setFilterCities([]); 
      
      if (safeValue) {
         try {
           const res = await fetch(`${PUBLIC_API_BASE}/master-data/State?parent=${safeValue}`);
           const json = await res.json();
           if (json.success) setFilterStates(json.data.map(d => d.name));
         } catch(e) { setFilterStates([]); }
      } else {
         setFilterStates([]);
      }
    } 
    else if (name === 'state') {
      setFilters(prev => ({ ...prev, state: safeValue, city: '' }));
      
      if (safeValue) {
         try {
           const res = await fetch(`${PUBLIC_API_BASE}/master-data/City?parent=${safeValue}`);
           const json = await res.json();
           if (json.success) setFilterCities(json.data.map(d => d.name));
         } catch(e) { setFilterCities([]); }
      } else {
         setFilterCities([]);
      }
    } 
    else {
      setFilters(prev => ({ ...prev, [name]: safeValue }));
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (needsTermsAcceptance) { setShowTermsModal(true); return; }
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (!isPremium) return toast.error("Upgrade to Premium to search matches!");
    fetchFeedAndData(filters);
  };

  const clearFilters = () => {
    if (needsTermsAcceptance) { setShowTermsModal(true); return; }
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    const emptyFilters = { 
        searchId: '', minAge: '', maxAge: '', minHeight: '', maxHeight: '', 
        education: '', community: '', subCommunity: '', occupation: '', maritalStatus: '',
        country: '', state: '', city: '', diet: '', motherTongue: '', star: '', pada: '', complexion: '' 
    };
    setFilters(emptyFilters);
    setAvailableSubCommunities([]);
    setFilterStates([]); 
    setFilterCities([]);
    fetchFeedAndData(emptyFilters); 
  };

  const handleVerifyClick = () => {
    if (regPaymentStatus?.status === 'PendingVerification') {
        toast("Verification is currently in progress. Please wait for admin approval.", { icon: <Icons.Info /> });
        return;
    }
    
    if (needsTermsAcceptance) { setShowTermsModal(true); return; }
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; }
    
    navigate('/payment-registration');
  };

  const handleExtraDetailsChange = async (e) => {
      const { name, value } = e.target;
      const safeValue = value || "";

      if (name === 'country') {
        setExtraDetailsForm(prev => ({ ...prev, country: safeValue, state: '', city: '' }));
        setExtraDetailsCities([]); 
        if (safeValue) {
           try {
             const res = await fetch(`${PUBLIC_API_BASE}/master-data/State?parent=${safeValue}`);
             const json = await res.json();
             if (json.success) setExtraDetailsStates(json.data.map(d => d.name));
           } catch(e) { setExtraDetailsStates([]); }
        } else {
           setExtraDetailsStates([]);
        }
      } 
      else if (name === 'state') {
        setExtraDetailsForm(prev => ({ ...prev, state: safeValue, city: '' }));
        if (safeValue) {
           try {
             const res = await fetch(`${PUBLIC_API_BASE}/master-data/City?parent=${safeValue}`);
             const json = await res.json();
             if (json.success) setExtraDetailsCities(json.data.map(d => d.name));
           } catch(e) { setExtraDetailsCities([]); }
        } else {
           setExtraDetailsCities([]);
        }
      } 
      else {
        setExtraDetailsForm(prev => ({ ...prev, [name]: safeValue }));
      }
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
          // Add country, state, city to base payload if API expects it
          country: extraDetailsForm.country,
          state: extraDetailsForm.state,
          city: extraDetailsForm.city,
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
              familyType: extraDetailsForm.familyType,
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

  const handlePhotoSelect = async (type, file) => { 
    if (file) { 
      try {
        setCompressingPhotos(prev => ({ ...prev, [type]: true }));
        
        const options = { 
          maxSizeMB: 1, 
          maxWidthOrHeight: 1920, 
          useWebWorker: false, 
          alwaysKeepResolution: true 
        };
        
        const compressedFile = await imageCompression(file, options);
        setPhotoFiles(prev => ({ ...prev, [type]: compressedFile }));
        
      } catch (error) {
        console.error("Compression Error:", error);
        toast.error("Failed to compress image. Please try another photo.");
      } finally {
        setCompressingPhotos(prev => ({ ...prev, [type]: false }));
      }
    } 
  };


  const submitPhotos = async (e) => {
    e.preventDefault();
    if (!photoFiles.primary || !photoFiles.secondary) return toast.error("Essential photos required");

    const primarySizeMB = photoFiles.primary.size / (1024 * 1024);
    const secondarySizeMB = photoFiles.secondary.size / (1024 * 1024);
    if (primarySizeMB + secondarySizeMB > 2.5) return toast.error("Photos are too large even after compression! Please choose different images.");
    
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
  
      if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
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
    if (needsTermsAcceptance) { setShowTermsModal(true); return; }
    if (needsExtraDetails) { setShowExtraDetailsModal(true); return; }
    if (needsPhotos) { setShowPhotoModal(true); return; } 
    if (!isPremium) {
       if (regPaymentStatus?.status === 'PendingVerification') toast("Verification in progress", { icon: <Icons.Info /> });
       else handleVerifyClick();
       return;
    }
    
    setActionLoadingId(profile.id);
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
        setActionLoadingId(null); 
    }
  };

  const renderStatusBtn = (profile) => {
    const status = profile.interestStatus;
    if (status && status !== 'Rejected') {
        return (
            <button className="dash-btn dash-btn-disabled" disabled>
                {getUserFriendlyStatus(status)}
            </button>
        );
    }

    const isThisLoading = actionLoadingId === profile.id;

    return (
      <button 
        className={`dash-btn ${!isPremium ? 'dash-btn-locked' : 'dash-btn-accent'}`} 
        onClick={() => handleConnect(profile)}
        disabled={isThisLoading || (actionLoadingId !== null)} 
      >
        {!isPremium ? <><Icons.Lock /> Verify to Connect</> : (isThisLoading ? "Sending..." : "Send Interest")}
      </button>
    );
  };

  const siblingOptions = Array.from({ length: 11 }, (_, i) => i);

  return (
    <>
      <Navbar />
      {/* UPDATED: Pass containerStyle to Toaster to move it down below the Navbar */}
      <Toaster 
        position="top-center" 
        toastOptions={{ 
            style: { background: '#1e293b', color: '#fff', fontFamily: 'Inter' } 
        }} 
        containerStyle={{
            top: '85px', // Moves toasts down by 85px to clear the header!
            zIndex: 9999999
        }}
      />

      <div className="dash-wrapper">

        <div className="dash-hero-section">
          <div className="dash-hero-overlay"></div>
          
          <div className="dash-container dash-hero-content">
            <div className="dash-hero-content-inner">
              <h1 className="dash-hero-title">Find your perfect match</h1>
              <p className="dash-hero-subtitle">Discover profiles curated just for you.</p>
              
              <div className="dash-hero-search-wrapper">
                {!isPremium && (
                  <div className="dash-search-locked-overlay" onClick={handleVerifyClick} style={{ cursor: regPaymentStatus?.status === 'PendingVerification' ? 'default' : 'pointer' }}>
                    {regPaymentStatus?.status === 'PendingVerification' ? (
                      <><div className="dash-pending-status"><Icons.Verify /> Verification Pending</div><span style={{ fontSize: '0.85rem' }}>Waiting for admin approval.</span></>
                    ) : (
                      <><div className="dash-lock-msg"><Icons.Lock /> Premium Search</div><span style={{ fontSize: '0.85rem' }}>Verify profile to use Advanced Filters</span></>
                    )}
                  </div>
                )}

                <div className="dash-hero-search-bar">
                  <div className="dash-hero-search-input-group">
                    <div className="dash-search-icon-box"><Icons.Search /></div>
                    <input 
                      type="text" 
                      name="searchId" 
                      className="dash-hero-main-search-input" 
                      placeholder="Search by ID..." 
                      value={filters.searchId} 
                      onChange={handleFilterChange} 
                      disabled={!isPremium}
                    />
                    {/* ADDED: "X" clear button inside the text search */}
                    {filters.searchId && isPremium && (
                      <button 
                        className="dash-search-clear-btn"
                        onClick={() => {
                          const updatedFilters = { ...filters, searchId: '' };
                          setFilters(updatedFilters);
                          fetchFeedAndData(updatedFilters);
                        }}
                      >
                        <Icons.Close />
                      </button>
                    )}
                  </div>
                  
                  <div className="dash-hero-search-divider"></div>
                  
                  {/* FIXED: Toggle properly for Desktop to show 'Close' when open */}
                  <button className="dash-hero-filter-toggle" onClick={() => isPremium && setShowFilters(!showFilters)} disabled={!isPremium}>
                    {showFilters ? <Icons.Close /> : <Icons.Filter />}
                    <span className="dash-btn-text">{showFilters ? "Close" : "Filters"}</span>
                  </button>
                  
                  <button className="dash-hero-search-btn" onClick={handleSearch} disabled={!isPremium || searchLoading}>
                    {searchLoading ? (
                      <Icons.Loader />
                    ) : (
                      <>
                        <span className="dash-btn-text">Search</span>
                        <span className="dash-mobile-only-icon"><Icons.Search /></span>
                      </>
                    )}
                  </button>
                </div>

                {/* --- HIERARCHICAL / RESPONSIVE FILTERS PANEL --- */}
                {showFilters && isPremium && (
                  <>
                    <div className="dash-mobile-filter-backdrop" onClick={() => setShowFilters(false)}></div>
                    <div className="dash-filters-panel">
                      
                      {/* --- MOBILE SPECIFIC HEADER (Actions + Close Button at the top) --- */}
                      <div className="dash-filters-mobile-header">
                        <button className="dash-header-text-btn" onClick={() => { clearFilters(); setShowFilters(false); }}>
                           Reset
                        </button>
                        <h3 style={{flex: 1, textAlign: 'center'}}>Filters</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button className="dash-header-primary-btn" onClick={() => { handleSearch(); setShowFilters(false); }}>
                             Apply
                          </button>
                          {/* ADDED: Dedicated close 'X' icon for mobile */}
                          <button className="dash-header-close-btn" onClick={() => setShowFilters(false)}>
                             <Icons.Close />
                          </button>
                        </div>
                      </div>

                      <div className="dash-filters-grid">
                          <div className="dash-form-group">
                            <label className="dash-label">Age (Years)</label>
                            <div style={{display:'flex', gap:'0.5rem'}}>
                              <input type="number" name="minAge" placeholder="Min" className="dash-input" value={filters.minAge} onChange={handleFilterChange}/>
                              <input type="number" name="maxAge" placeholder="Max" className="dash-input" value={filters.maxAge} onChange={handleFilterChange}/>
                            </div>
                          </div>
                          
                          <div className="dash-form-group">
                            <label className="dash-label">Marital Status</label>
                            <select name="maritalStatus" className="dash-input" value={filters.maritalStatus} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.MaritalStatus.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Education</label>
                            <select name="education" className="dash-input" value={filters.education} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Education.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Community</label>
                            <select name="community" className="dash-input" value={filters.community} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {masterCommunities.map((c, idx) => (<option key={idx} value={c.name}>{c.name}</option>))}
                            </select>
                          </div>

                          {/* REPLACED WITH DependentSelect Component */}
                          <DependentSelect
                            label="Sub-Community / Caste"
                            name="subCommunity"
                            value={filters.subCommunity}
                            onChange={handleFilterChange}
                            disabled={!filters.community}
                            options={availableSubCommunities}
                            errorMessage="Please select a Community first"
                          />

                          <div className="dash-form-group">
                            <label className="dash-label">Occupation</label>
                            <select name="occupation" className="dash-input" value={filters.occupation} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Designation.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Country</label>
                            <select name="country" className="dash-input" value={filters.country} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Country.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          {/* REPLACED WITH DependentSelect Component */}
                          <DependentSelect
                            label="State"
                            name="state"
                            value={filters.state}
                            onChange={handleFilterChange}
                            disabled={!filters.country}
                            options={filterStates}
                            errorMessage="Please select a Country first"
                          />

                          {/* REPLACED WITH DependentSelect Component */}
                          <DependentSelect
                            label="City"
                            name="city"
                            value={filters.city}
                            onChange={handleFilterChange}
                            disabled={!filters.state}
                            options={filterCities}
                            errorMessage="Please select a State first"
                          />

                          <div className="dash-form-group">
                            <label className="dash-label">Mother Tongue</label>
                            <select name="motherTongue" className="dash-input" value={filters.motherTongue} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.MotherTongue.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Star (Nakshatram)</label>
                            <select name="star" className="dash-input" value={filters.star} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Star.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Pada</label>
                            <select name="pada" className="dash-input" value={filters.pada} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Pada.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Diet</label>
                            <select name="diet" className="dash-input" value={filters.diet} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Diet.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Complexion</label>
                            <select name="complexion" className="dash-input" value={filters.complexion} onChange={handleFilterChange}>
                              <option value="">Any</option>
                              {dynamicOptions.Complexion.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>

                          <div className="dash-form-group">
                            <label className="dash-label">Height (Cm)</label>
                            <div style={{display:'flex', gap:'0.5rem'}}>
                              <input type="number" name="minHeight" placeholder="Min" className="dash-input" value={filters.minHeight} onChange={handleFilterChange}/>
                              <input type="number" name="maxHeight" placeholder="Max" className="dash-input" value={filters.maxHeight} onChange={handleFilterChange}/>
                            </div>
                          </div>
                      </div>
                      
                      {/* Desktop ONLY actions at the bottom */}
                      <div className="dash-filter-actions">
                        <button className="dash-btn dash-btn-outline" style={{width:'auto', flex: 1}} onClick={() => { clearFilters(); setShowFilters(false); }}>Reset</button>
                        <button className="dash-btn dash-btn-accent" style={{width:'auto', flex: 2}} onClick={() => { handleSearch(); setShowFilters(false); }}>Apply Filters</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {dashboardLoading ? <div className="dash-container"><DashboardSkeleton /></div> : (
          <div className="dash-container">

            {/* --- PREMIUM UPGRADE BANNER --- */}
            {isPremium && premiumStatus !== 'Resolved' && (
              <div className={`dash-premium-banner-card ${premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted' ? 'requested' : ''}`}>
                <div className="dash-premium-bg-shape"></div>

                {(premiumRequested || premiumStatus === 'Pending' || premiumStatus === 'Contacted') ? (
                  <div className="dash-premium-content requested-content">
                    <div className="dash-premium-icon-box success-icon">
                      <Icons.CheckCircle />
                    </div>
                    <div className="dash-premium-text-col">
                      <h3>Request Received</h3>
                      <p>Our support team will contact you shortly to process your premium upgrade.</p>
                    </div>
                  </div>
                ) : (
                  <div className="dash-premium-content default-content">
                    <div className="dash-premium-icon-box gold-icon">
                      <Icons.Diamond />
                    </div>
                    <div className="dash-premium-text-col">
                      <h3>Upgrade to Premium</h3>
                      <p>Get personalized assistance from our expert matchmaking team. Request your exclusive upgrade today.</p>
                    </div>
                    <div className="dash-premium-action">
                      <button 
                        className="dash-premium-btn" 
                        onClick={handlePremiumRequest} 
                        disabled={premiumRequestLoading}
                      >
                        {premiumRequestLoading ? "Processing..." : <>Request Upgrade <Icons.ArrowRight /></>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- PENDING VERIFICATION BANNER --- */}
            {!isPremium && regPaymentStatus?.status === 'PendingVerification' && (
              <div style={{
                backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px 24px',
                marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#92400e'
              }}>
                 <div><Icons.Info /></div>
                 <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Verification in Progress</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>We have received your payment request. Our admin team is currently verifying the details.</p>
                 </div>
              </div>
            )}

            {/* --- EMPTY STATE --- */}
            {matches.length === 0 && (
              <div className="dash-empty-state">
                <div style={{width:'60px', height:'60px', margin:'0 auto', color:'#cbd5e1'}}><Icons.Search /></div>
                <h3>No Matches Found</h3>
                <p>Try adjusting your filters.</p>
                {filters.searchId || filters.minAge || filters.community ? (
                    <button className="dash-btn dash-btn-outline" style={{marginTop:'1rem', width:'auto', display:'inline-flex'}} onClick={clearFilters}>Clear Filters</button>
                ) : null}
              </div>
            )}

            {/* --- GRID --- */}
            <div className="dash-grid">
              {matches.map((profile) => (
                <div key={profile.id} className="dash-card">
                  <div className="dash-card-header"><div className="dash-avatar-box">{profile.gender === 'Male' ? <Icons.Male /> : <Icons.Female />}</div></div>
                  <div className="dash-card-body">
                    <div className="dash-profile-header">
                      <div className="dash-name">{formatDisplayName(profile.name)} <Icons.Verify /></div>
                      <span className="dash-age-badge">{profile.age} Yrs</span>
                    </div>
                    
                    <p className="dash-job">{profile.occupation || profile.job || "Not Specified"}</p>
                    <div className="dash-info-grid">
                      <div className="dash-info-item"><span className="dash-lbl">Education</span><span className="dash-val">{profile.education || "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">Community</span><span className="dash-val">{profile.community || "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">Sub-Community</span><span className="dash-val">{profile.subCommunity || "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">Location</span><span className="dash-val">{profile.location || "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">ID</span><span className="dash-val">{profile.uniqueId || "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">Height</span><span className="dash-val">{profile.height ? `${profile.height} cm` : "--"}</span></div>
                      <div className="dash-info-item"><span className="dash-lbl">Status</span><span className="dash-val">{profile.status || "--"}</span></div>
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

      {/* --- TERMS & CONDITIONS MODAL (HIGHEST PRIORITY) --- */}
      {showTermsModal && (
        <div className="dash-overlay" style={{ zIndex: 9999 }}>
          <div className="dash-modal">
            <h2 className="dash-title">Terms & Conditions</h2>
            <p className="dash-subtitle" style={{marginBottom:'1.5rem'}}>
               Welcome! As your profile was created by an agent, you must accept our terms and provide a digital signature to proceed with your account.
            </p>
            
            <form onSubmit={submitTerms}>
              <div className="dash-form-group">
                <label className="dash-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', lineHeight: '1.4' }}>
                  <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }} />
                  <span>I hereby declare that the information provided in my profile is true and correct. I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 'bold' }}>Terms & Conditions</a> of KalyanaShobha.</span>
                </label>
              </div>

              <div className="dash-form-group">
                <label className="dash-label">Digital Signature <span className="dash-required">*</span></label>
                <div style={{ border: '2px dashed #E2E8F0', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', marginBottom: '10px' }}>
                    <SignatureCanvas ref={sigRef} penColor="#1A1A1A" canvasProps={{ className: 'sigCanvas', style: { width: '100%', height: '160px', touchAction: 'none' } }} backgroundColor="#FFFFFF"/>
                </div>
                <button type="button" onClick={clearSignature} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>Clear Signature</button>
              </div>

              <button type="submit" className="dash-btn dash-btn-primary" disabled={submittingSignature || !termsAgreed}>
                {submittingSignature ? "Submitting..." : "Accept & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EXTRA DETAILS MODAL --- */}
      {showExtraDetailsModal && (
        <div className="dash-overlay">
          <div className="dash-modal-large" style={{ position: 'relative' }}>
            
            {showTimePicker && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                <CustomTimePicker isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} initialTime={extraDetailsForm.timeOfBirth} onSet={(formattedTime) => { setExtraDetailsForm(prev => ({ ...prev, timeOfBirth: formattedTime })); }} />
              </div>
            )}

            <div className="dash-modal-header">
               <div>
                  <h2 className="dash-title">Complete Your Profile</h2>
                  <p className="dash-subtitle">Please provide these details to proceed with verification.</p>
               </div>
               <button className="dash-close-btn" onClick={() => setShowExtraDetailsModal(false)}>✕</button>
            </div>
            
            <div className="dash-modal-body">
               <form onSubmit={submitExtraDetails} onKeyDown={handleEnterToNext}>
                 <div className="dash-form-section">
                   <h4 className="dash-section-title">Additional Details</h4>
                   <div className="dash-grid-2">
                     <DashboardComboInput label="Moonsign" name="moonsign" value={extraDetailsForm.moonsign} onChange={handleExtraDetailsChange} options={dynamicOptions.Moonsign} required={true} onKeyDown={handleEnterToNext} />
                     <DashboardComboInput label="Star (Nakshatram)" name="star" value={extraDetailsForm.star} onChange={handleExtraDetailsChange} options={dynamicOptions.Star} required={true} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Pada/Quarter" name="pada" value={extraDetailsForm.pada} onChange={handleExtraDetailsChange} options={dynamicOptions.Pada} required={false} onKeyDown={handleEnterToNext}/>
                     <DashboardComboInput label="Mother Tongue" name="motherTongue" value={extraDetailsForm.motherTongue} onChange={handleExtraDetailsChange} options={dynamicOptions.MotherTongue} required={true} onKeyDown={handleEnterToNext}/>
                     
                     <div className="dash-form-group">
                       <label className="dash-label">Time of Birth</label>
                       <div style={{ position: 'relative' }}>
                         <input type="text" name="timeOfBirth" className="dash-input" placeholder="02:30 PM" value={extraDetailsForm.timeOfBirth} readOnly onClick={() => setShowTimePicker(true)} style={{ cursor: 'pointer' }} />
                         <div style={{ position: 'absolute', right: '12px', top: '12px', color: '#64748b', pointerEvents: 'none' }}><Icons.ChevronDown /></div>
                       </div>
                     </div>
                     
                     <div className="dash-form-group"><label className="dash-label">Place of Birth</label><input type="text" name="placeOfBirth" className="dash-input" placeholder="City or Village name" value={extraDetailsForm.placeOfBirth} onChange={handleExtraDetailsChange}/></div>
                     <div className="dash-form-group"><label className="dash-label">Native Location</label><input type="text" name="nativeLocation" className="dash-input" placeholder="Native Place" value={extraDetailsForm.nativeLocation} onChange={handleExtraDetailsChange}/></div>
                     <DashboardComboInput label="Complexion" name="complexion" value={extraDetailsForm.complexion} onChange={handleExtraDetailsChange} options={dynamicOptions.Complexion} required={false} onKeyDown={handleEnterToNext}/>
                     
                     <div className="dash-form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                       <h4 className="dash-section-title" style={{ border: 'none', marginBottom: '0.5rem', padding: 0 }}>Current Location</h4>
                     </div>

                     
                   </div>
                 </div>

                 <div className="dash-form-section">
                   <h4 className="dash-section-title">Family Information</h4>
                   <div className="dash-grid-2">
                     <div className="dash-form-group">
                       <label className="dash-label">Family Type</label>
                       <select name="familyType" className="dash-input" value={extraDetailsForm.familyType} onChange={handleExtraDetailsChange}>
                         <option value="">Select Family Type</option>
                         <option value="Nuclear">Nuclear</option>
                         <option value="Joint">Joint</option>
                         <option value="Extended">Extended</option>
                       </select>
                     </div>
                     <div className="dash-form-group"><label className="dash-label">Father's Name <span className="dash-required">*</span></label><input type="text" name="fatherName" className="dash-input" value={extraDetailsForm.fatherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="dash-form-group">
                       <label className="dash-label">Father's Occupation</label>
                       <select name="fatherOccupation" className="dash-input" value={extraDetailsForm.fatherOccupation} onChange={handleExtraDetailsChange}>
                         <option value="">Select Occupation</option><option value="Employed">Employed</option><option value="Business">Business</option><option value="Professional">Professional</option><option value="Retired">Retired</option><option value="Not Employed">Not Employed</option><option value="Passed Away">Passed Away</option>
                       </select>
                     </div>
                     <div className="dash-form-group"><label className="dash-label">Mother's Name <span className="dash-required">*</span></label><input type="text" name="motherName" className="dash-input" value={extraDetailsForm.motherName} onChange={handleExtraDetailsChange} required/></div>
                     <div className="dash-form-group">
                       <label className="dash-label">Mother's Occupation</label>
                       <select name="motherOccupation" className="dash-input" value={extraDetailsForm.motherOccupation} onChange={handleExtraDetailsChange}>
                         <option value="">Select Occupation</option><option value="Homemaker">Homemaker</option><option value="Employed">Employed</option><option value="Business">Business</option><option value="Professional">Professional</option><option value="Retired">Retired</option><option value="Passed Away">Passed Away</option>
                       </select>
                     </div>
                     <div className="dash-form-group"><label className="dash-label">No. of Brothers</label><select name="noOfBrothers" className="dash-input" value={extraDetailsForm.noOfBrothers} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="dash-form-group"><label className="dash-label">Brothers Married</label><select name="noOfBrothersMarried" className="dash-input" value={extraDetailsForm.noOfBrothersMarried} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="dash-form-group"><label className="dash-label">No. of Sisters</label><select name="noOfSisters" className="dash-input" value={extraDetailsForm.noOfSisters} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                     <div className="dash-form-group"><label className="dash-label">Sisters Married</label><select name="noOfSistersMarried" className="dash-input" value={extraDetailsForm.noOfSistersMarried} onChange={handleExtraDetailsChange}>{siblingOptions.map(num => <option key={num} value={num}>{num}</option>)}</select></div>
                   </div>
                 </div>

                 <div className="dash-modal-footer">
                    <button type="submit" className="dash-btn dash-btn-primary dash-btn-large" disabled={submittingExtraDetails}>
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
        <div className="dash-overlay">
          <div className="dash-modal">
            <button className="dash-close-btn" onClick={() => setShowPhotoModal(false)}>✕</button>
            <h2 className="dash-title">Profile Photos Required</h2>
            <p className="dash-subtitle" style={{marginBottom:'1.5rem'}}>Upload your photos to proceed with verification.</p>
            <form onSubmit={submitPhotos}>
              {['primary', 'secondary'].map((type) => {
                const isLocked = type === 'secondary' && !photoFiles.primary;
                const disableInput = isLocked || compressingPhotos[type] || uploading;
                return (
                  <div key={type} className="dash-form-group">
                    <label className="dash-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {type === 'primary' ? 'Primary Profile Photo' : 'Secondary Portrait'}
                      {isLocked && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}></span>}
                    </label>
                    
                    <div 
                      className={`dash-upload-zone ${photoFiles[type] ? 'active' : ''}`}
                      style={{ opacity: disableInput ? 0.6 : 1, cursor: disableInput ? 'not-allowed' : 'pointer', backgroundColor: disableInput ? '#f1f5f9' : '' }}
                    >
                      <input className="dash-file-input" type="file" accept="image/*" onChange={(e) => handlePhotoSelect(type, e.target.files[0])} disabled={disableInput}/>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', color: isLocked ? '#94a3b8' : 'inherit'}}>
                        {isLocked ? <Icons.Lock /> : (compressingPhotos[type] || uploading) ? <Icons.Loader /> : <Icons.Upload />}
                        <span className="dash-lbl">
                          {isLocked ? "Upload primary photo first" : uploading ? "Uploading to server..." : compressingPhotos[type] ? "Processing Image..." : (photoFiles[type] ? photoFiles[type].name : "Click to Upload")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="submit" className="dash-btn dash-btn-primary" disabled={uploading || !photoFiles.primary || !photoFiles.secondary || compressingPhotos.primary || compressingPhotos.secondary}>
                {uploading ? "Uploading Data..." : "Save & Continue to Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer/>
    </>
  );
};

export default UserDashboard;

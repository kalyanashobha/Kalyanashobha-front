import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import imageCompression from 'browser-image-compression'; 
import { 
  Search, Filter, Trash2, Ban, CheckCircle, 
  User, X, ChevronLeft, ChevronRight, ChevronDown,
  Briefcase, MapPin, Shield, 
  Crown, Sparkles, Phone, Calendar, Hash,
  Moon, Users, Upload 
} from 'lucide-react';
import './UserManagement.css'; 

const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api";

const MARITAL_STATUSES = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

const INITIAL_FILTERS = {
  memberId: '', gender: '', maritalStatus: '',
  minAge: '', maxAge: '', community: '', 
  subCommunity: '', education: '', occupation: '',
  country: '', state: '', city: '', motherTongue: ''
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
      width: '320px', 
      backgroundColor: '#fff', 
      padding: '0', 
      borderRadius: '12px', 
      overflow: 'hidden',
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
              type="number" 
              placeholder="12"
              min="1" max="12"
              value={hour}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 12) val = '12';
                setHour(val);
              }}
              style={{ 
                width: '100%', fontSize: '1.5rem', textAlign: 'center', 
                border: 'none', borderBottom: '2px solid #6366f1', 
                padding: '8px 0', outline: 'none' 
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>hour</span>
          </div>
          
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', paddingBottom: '20px' }}>:</span>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" 
              placeholder="00"
              min="0" max="59"
              value={minute}
              onChange={(e) => {
                let val = e.target.value;
                if (val.length > 2) val = val.slice(-2);
                if (parseInt(val) > 59) val = '59';
                setMinute(val);
              }}
              style={{ 
                width: '100%', fontSize: '1.5rem', textAlign: 'center', 
                border: 'none', borderBottom: '2px solid #6366f1', 
                padding: '8px 0', outline: 'none' 
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>minute</span>
          </div>
          
          <div style={{ flex: 1 }}>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 8px', fontSize: '1rem', 
                border: 'none', outline: 'none', background: 'transparent',
                appearance: 'none', cursor: 'pointer', textAlign: 'center'
              }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
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

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [processingId, setProcessingId] = useState(null); 

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dynamic Master Data States
  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]);
  
  const [masterCountries, setMasterCountries] = useState([]);
  const [masterEducations, setMasterEducations] = useState([]);
  const [masterOccupations, setMasterOccupations] = useState([]);
  const [masterMotherTongues, setMasterMotherTongues] = useState([]);
  const [masterStars, setMasterStars] = useState([]);
  const [masterMoonsigns, setMasterMoonsigns] = useState([]);

  const [advStates, setAdvStates] = useState([]);
  const [advCities, setAdvCities] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [referralFilter, setReferralFilter] = useState("all");
  const [advFilters, setAdvFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    const fetchInitialMasterData = async () => {
      try {
        const [
          commRes, countryRes, eduRes, occRes, mtRes, starRes, moonRes
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/public/get-all-communities`),
          axios.get(`${API_BASE_URL}/public/master-data/Country`),
          axios.get(`${API_BASE_URL}/public/master-data/Education`),
          axios.get(`${API_BASE_URL}/public/master-data/Designation`), 
          axios.get(`${API_BASE_URL}/public/master-data/MotherTongue`),
          axios.get(`${API_BASE_URL}/public/master-data/Star`),
          axios.get(`${API_BASE_URL}/public/master-data/Moonsign`)
        ]);

        if (commRes.data.success) setMasterCommunities(commRes.data.data);
        if (countryRes.data.success) setMasterCountries(countryRes.data.data);
        if (eduRes.data.success) setMasterEducations(eduRes.data.data);
        if (occRes.data.success) setMasterOccupations(occRes.data.data);
        if (mtRes.data.success) setMasterMotherTongues(mtRes.data.data); 
        if (starRes.data.success) setMasterStars(starRes.data.data); 
        if (moonRes.data.success) setMasterMoonsigns(moonRes.data.data); 

      } catch (err) {
        console.error("Failed to load master data", err);
      }
    };
    
    fetchInitialMasterData();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/admin/users/advanced`, {
        headers: { Authorization: token },
        params: {
          search: searchTerm,
          referralType: referralFilter === 'all' ? '' : referralFilter,
          page: page,
          limit: 6 
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showAdvanced) {
        const timer = setTimeout(() => fetchUsers(), 500);
        return () => clearTimeout(timer);
    }
  }, [searchTerm, referralFilter, page, showAdvanced]);

  const handleAdvChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'community') {
      setAdvFilters({ ...advFilters, community: value, subCommunity: '' });
      const found = masterCommunities.find(c => c.name === value);
      if (found) {
        setAvailableSubCommunities(found.subCommunities || []);
      } else {
        setAvailableSubCommunities([]);
      }
    } else if (name === 'country') {
      setAdvFilters({ ...advFilters, country: value, state: '', city: '' });
      setAdvCities([]); 
      
      if (value) {
        try {
          const res = await axios.get(`${API_BASE_URL}/public/master-data/State?parent=${value}`);
          setAdvStates(res.data.success ? res.data.data : []);
        } catch (error) { console.error("Failed to fetch states"); }
      } else {
        setAdvStates([]);
      }
    } else if (name === 'state') {
      setAdvFilters({ ...advFilters, state: value, city: '' });
      if (value) {
        try {
          const res = await axios.get(`${API_BASE_URL}/public/master-data/City?parent=${value}`);
          setAdvCities(res.data.success ? res.data.data : []);
        } catch (error) { console.error("Failed to fetch cities"); }
      } else {
        setAdvCities([]);
      }
    } else {
      setAdvFilters({ ...advFilters, [name]: value });
    }
  };

  const executeAdvancedSearch = async (e) => {
    if(e) e.preventDefault();
    setLoading(true); 
    const toastId = toast.loading("Searching..."); 

    try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.post(
            `${API_BASE_URL}/admin/users/search-advanced`, 
            advFilters,
            { headers: { Authorization: token } }
        );
        if (response.data.success) {
            setUsers(response.data.users);
            setTotalPages(1); 
            toast.update(toastId, { render: "Search completed", type: "success", isLoading: false, autoClose: 2000 });
        }
    } catch (error) {
        toast.update(toastId, { render: "Search failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
        setLoading(false);
    }
  };

  const clearAdvanced = () => {
    setAdvFilters(INITIAL_FILTERS);
    setAvailableSubCommunities([]); 
    setAdvStates([]); 
    setAdvCities([]);
    setShowAdvanced(false); 
    setPage(1);
  };

  const handleDelete = async (userId) => {
    if(!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    setProcessingId(userId);
    const toastId = toast.loading("Deleting user...");
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, { 
        headers: { Authorization: token } 
      });
      toast.update(toastId, { render: "User deleted successfully", type: "success", isLoading: false, autoClose: 3000 });
      showAdvanced ? executeAdvancedSearch() : fetchUsers();
    } catch (error) { 
      toast.update(toastId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlockToggle = async (userId, isActive) => {
    const action = isActive ? 'BLOCK' : 'UNBLOCK';
    if(!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    setProcessingId(userId);
    const toastId = toast.loading(`Processing ${action.toLowerCase()}...`);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${API_BASE_URL}/admin/users/restrict`, 
        { userId, restrict: isActive },
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
         toast.update(toastId, { render: `User ${action.toLowerCase()}ed successfully`, type: "success", isLoading: false, autoClose: 3000 });
         showAdvanced ? executeAdvancedSearch() : fetchUsers();
      }
    } catch (error) {
      toast.update(toastId, { render: "Action failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" theme="colored" />
      <div className="um-layout">
        <header className="um-header">
          <div className="um-header-content">
            <h1 className="um-title">User Registry</h1>
            <p className="um-subtitle">Manage members, agents, and system access.</p>
          </div>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`um-action-btn ${showAdvanced ? 'active' : ''}`}
          >
            {showAdvanced ? <><X size={16} /> Close Filter</> : <><Filter size={16} /> Advanced Filter</>}
          </button>
        </header>

        <div className="um-controls">
          {showAdvanced ? (
            <form onSubmit={executeAdvancedSearch} className="um-adv-form">
              <div className="um-form-grid">
                <div className="um-input-group">
                    <Hash size={14} className="um-input-icon"/>
                    <input name="memberId" value={advFilters.memberId} onChange={handleAdvChange} placeholder="Member ID" className="um-input" />
                </div>
                
                <select name="gender" value={advFilters.gender} onChange={handleAdvChange} className="um-input">
                    <option value="">Gender (Any)</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                
                <select name="maritalStatus" value={advFilters.maritalStatus} onChange={handleAdvChange} className="um-input">
                    <option value="">Marital Status (Any)</option>
                    {MARITAL_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                
                <div className="um-range-group">
                  <input type="number" name="minAge" placeholder="Min Age" value={advFilters.minAge} onChange={handleAdvChange} className="um-input" />
                  <span className="um-divider">-</span>
                  <input type="number" name="maxAge" placeholder="Max Age" value={advFilters.maxAge} onChange={handleAdvChange} className="um-input" />
                </div>

                <select name="community" value={advFilters.community} onChange={handleAdvChange} className="um-input">
                    <option value="">Community (Any)</option>
                    {masterCommunities.map((c, idx) => (
                      <option key={idx} value={c.name}>{c.name}</option>
                    ))}
                </select>

                <select name="subCommunity" value={advFilters.subCommunity} onChange={handleAdvChange} className="um-input" disabled={!advFilters.community}>
                    <option value="">Sub-Community / Caste (Any)</option>
                    {availableSubCommunities.map((sub, idx) => {
                      const val = typeof sub === 'string' ? sub : sub.name;
                      return <option key={idx} value={val}>{val}</option>;
                    })}
                </select>

                <select name="motherTongue" value={advFilters.motherTongue} onChange={handleAdvChange} className="um-input">
                    <option value="">Mother Tongue (Any)</option>
                    {masterMotherTongues.map((m, idx) => <option key={idx} value={m.name}>{m.name}</option>)}
                </select>

                <select name="education" value={advFilters.education} onChange={handleAdvChange} className="um-input">
                    <option value="">Education (Any)</option>
                    {masterEducations.map((e, idx) => <option key={idx} value={e.name}>{e.name}</option>)}
                </select>

                <select name="occupation" value={advFilters.occupation} onChange={handleAdvChange} className="um-input">
                    <option value="">Occupation (Any)</option>
                    {masterOccupations.map((o, idx) => <option key={idx} value={o.name}>{o.name}</option>)}
                </select>

                <select name="country" value={advFilters.country} onChange={handleAdvChange} className="um-input">
                    <option value="">Country (Any)</option>
                    {masterCountries.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                </select>

                <select name="state" value={advFilters.state} onChange={handleAdvChange} className="um-input" disabled={!advFilters.country}>
                    <option value="">State (Any)</option>
                    {advStates.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                </select>

                <select name="city" value={advFilters.city} onChange={handleAdvChange} className="um-input" disabled={!advFilters.state}>
                    <option value="">City (Any)</option>
                    {advCities.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                </select>

              </div>
              <div className="um-form-actions">
                <button type="button" onClick={clearAdvanced} className="um-text-btn">Reset</button>
                <button type="submit" className="um-primary-btn" disabled={loading}>{loading ? 'Searching...' : 'Apply Filters'}</button>
              </div>
            </form>
          ) : (
            <div className="um-quick-bar">
              <div className="um-search-wrapper">
                <Search className="um-search-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by ID, Name, Phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="um-search-input"
                />
              </div>
              <div className="um-filters">
                <select value={referralFilter} onChange={(e) => setReferralFilter(e.target.value)} className="um-select">
                  <option value="all">Source: All</option>
                  <option value="self">Self (Direct)</option>
                  <option value="agent">Agent Referred</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="um-grid">
          {loading ? (
            Array(6).fill(0).map((_, i) => <UserSkeleton key={i} />)
          ) : (
            users.length > 0 ? (
                users.map(user => (
                    <UserBlock 
                        key={user._id} 
                        user={user} 
                        isProcessing={processingId === user._id}
                        onView={() => setSelectedUser(user)}
                        onBlock={() => handleBlockToggle(user._id, user.isActive)}
                        onDelete={() => handleDelete(user._id)}
                    />
                ))
            ) : (
                <div className="um-empty">
                   <div className="um-empty-icon"><Search size={40}/></div>
                   <h3>No records found</h3>
                   <p>Try adjusting your search criteria.</p>
                </div>
            )
          )}
        </div>

        {!loading && !showAdvanced && users.length > 0 && (
            <div className="um-pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="um-page-btn"><ChevronLeft size={16} /></button>
                <span className="um-page-info">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="um-page-btn"><ChevronRight size={16} /></button>
            </div>
        )}

        {selectedUser && (
          <UserDetailModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            onUpdateSuccess={() => {
              setSelectedUser(null);
              showAdvanced ? executeAdvancedSearch() : fetchUsers();
            }}
            masterData={{
              communities: masterCommunities,
              educations: masterEducations,
              occupations: masterOccupations,
              countries: masterCountries,
              motherTongues: masterMotherTongues,
              stars: masterStars,
              moonsigns: masterMoonsigns
            }}
          />
        )}
      </div>
    </>
  );
};

const UserSkeleton = () => (
  <div className="user-card skeleton-card">
    <div className="uc-header skeleton-header">
       <div className="sk-blob sk-id"></div>
       <div className="sk-blob sk-badge"></div>
    </div>
    <div className="uc-body">
      <div className="uc-avatar-wrap">
        <div className="sk-blob sk-avatar"></div>
      </div>
      <div className="uc-details">
        <div className="sk-blob sk-line-long"></div>
        <div className="sk-blob sk-line-short"></div>
        <div className="sk-blob sk-line-medium"></div>
      </div>
    </div>
    <div className="uc-actions">
        <div className="sk-blob sk-btn"></div>
        <div className="sk-blob sk-icon"></div>
        <div className="sk-blob sk-icon"></div>
    </div>
  </div>
);

const UserBlock = ({ user, isProcessing, onView, onBlock, onDelete }) => {
  const getAge = (dob) => dob ? Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970) : "N/A";

  const isNewUser = () => {
    if (!user.createdAt) return false;
    const joinedDate = new Date(user.createdAt);
    return ((new Date() - joinedDate) / (1000 * 3600 * 24)) <= 7;
  };

  const hasAgent = user.referredByAgentId && typeof user.referredByAgentId === 'object';
  const agentName = hasAgent ? user.referredByAgentId.name : (user.referredByAgentName || "Unknown");
  const agentCode = hasAgent ? user.referredByAgentId.agentCode : "Manual Ref";

  return (
    <div className={`user-card ${!user.isActive ? 'restricted-user' : ''} ${user.isPaidMember ? 'is-premium' : ''}`}>
      <div className="uc-header">
        <span className="uc-id">{user.uniqueId || "N/A"}</span>
        <div className="uc-badges">
           {isNewUser() && <span className="badge-new"><Sparkles size={10} /> NEW</span>}
           {user.isPaidMember ? <span className="badge-paid"><Crown size={10} /></span> : <span className="badge-free">FREE</span>}
        </div>
      </div>

      {!user.isActive && <div className="uc-badge-restricted-overlay">RESTRICTED</div>}

      <div className="uc-body">
        <div className="uc-avatar-wrap">
          {user.photos?.[0] ? 
            <img src={user.photos[0]} alt="Profile" className="uc-avatar" /> : 
            <div className="uc-avatar-placeholder"><User size={24} /></div>
          }
        </div>
        <div className="uc-details">
          <h3 className="uc-name" title={`${user.firstName} ${user.lastName}`}>{user.firstName} {user.lastName}</h3>
          <div className="uc-meta-row">
            <span>{getAge(user.dob)} Yrs</span><span className="uc-dot">•</span><span>{user.gender}</span>
          </div>
          <p className="uc-location"><MapPin size={10} style={{marginRight:4}}/>{user.city}, {user.state}</p>

          {(hasAgent || user.referralType === 'manual') && (
            <div className="uc-agent-tag">
              <Shield size={10} className="agent-icon" />
              <div className="agent-info">
                <span className="agent-lbl">Referred By</span>
                <span className="agent-val">{agentName} <small>({agentCode})</small></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="uc-actions">
        <button onClick={onView} className="uc-btn-view" disabled={isProcessing}>View Profile</button>
        <div className="uc-icon-group">
          <button 
            onClick={onBlock} 
            className={`uc-icon-btn ${!user.isActive ? 'is-blocked' : ''}`} 
            disabled={isProcessing}
            title={user.isActive ? "Restrict User" : "Unblock User"}
          >
            {isProcessing ? <span className="loader-text">...</span> : (user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />)}
          </button>
          <button onClick={onDelete} className="uc-icon-btn delete" disabled={isProcessing}>
             {isProcessing ? <span className="loader-text">...</span> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormGroup = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>{label}</label>
    {children}
  </div>
);

const UserDetailModal = ({ user, onClose, onUpdateSuccess, masterData }) => {
  const [activeImg, setActiveImg] = useState(user.photos && user.photos.length > 0 ? user.photos[0] : null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false); 

  const [editStates, setEditStates] = useState([]);
  const [editCities, setEditCities] = useState([]);

  // --- SCROLL INDICATOR LOGIC ---
  const modalBodyRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const checkScroll = () => {
    if (modalBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalBodyRef.current;
      setShowScrollIndicator(scrollHeight > clientHeight + 10 && scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isEditing, user]);
  // -----------------------------

  const [formData, setFormData] = useState({
    firstName: user.firstName || '', lastName: user.lastName || '', gender: user.gender || '',
    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '', maritalStatus: user.maritalStatus || '',
    height: user.height || '', diet: user.diet || '', community: user.community || '',
    subCommunity: user.subCommunity || user.caste || '', gothra: user.gothra || '',
    highestQualification: user.highestQualification || '', collegeName: user.collegeName || '',
    jobRole: user.jobRole || '', companyName: user.companyName || '', annualIncome: user.annualIncome || '',
    city: user.city || '', state: user.state || '', country: user.country || '', residentsIn: user.residentsIn || '',
    nri: user.nri || 'No',

    star: user.astrologyDetails?.star || '', moonsign: user.astrologyDetails?.moonsign || '', pada: user.astrologyDetails?.pada || '',
    motherTongue: user.astrologyDetails?.motherTongue || '', timeOfBirth: user.astrologyDetails?.timeOfBirth || '',
    placeOfBirth: user.astrologyDetails?.placeOfBirth || '', nativeLocation: user.astrologyDetails?.nativeLocation || '',
    complexion: user.astrologyDetails?.complexion || '',

    familyType: user.familyDetails?.familyType || '', fatherName: user.familyDetails?.fatherName || '',
    fatherOccupation: user.familyDetails?.fatherOccupation || '', motherName: user.familyDetails?.motherName || '',
    motherOccupation: user.familyDetails?.motherOccupation || '', noOfBrothers: user.familyDetails?.noOfBrothers || 0,
    noOfBrothersMarried: user.familyDetails?.noOfBrothersMarried || 0, noOfSisters: user.familyDetails?.noOfSisters || 0,
    noOfSistersMarried: user.familyDetails?.noOfSistersMarried || 0
  });

  const [existingPhotos, setExistingPhotos] = useState(user.photos || []);
  const [newPhotos, setNewPhotos] = useState([]);

  useEffect(() => {
    const loadInitialLocations = async () => {
      if (formData.country) {
        try {
          const res = await axios.get(`${API_BASE_URL}/public/master-data/State?parent=${formData.country}`);
          if (res.data.success) setEditStates(res.data.data);
        } catch(e) {}
      }
      if (formData.state) {
        try {
          const res = await axios.get(`${API_BASE_URL}/public/master-data/City?parent=${formData.state}`);
          if (res.data.success) setEditCities(res.data.data);
        } catch(e) {}
      }
    };
    loadInitialLocations();
  }, []); 

  const selectedCommObj = masterData?.communities.find(c => c.name === formData.community);
  const editModeSubCommunities = selectedCommObj ? selectedCommObj.subCommunities : [];

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : "-";
  const hasAgent = user.referredByAgentId && typeof user.referredByAgentId === 'object';
  const agentName = hasAgent ? user.referredByAgentId.name : user.referredByAgentName;
  const agentCode = hasAgent ? user.referredByAgentId.agentCode : "Manual";

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'community') {
        setFormData(prev => ({ ...prev, [name]: value, subCommunity: '' }));
    } 
    else if (name === 'country') {
        setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
        setEditCities([]);
        if (value) {
            try {
                const res = await axios.get(`${API_BASE_URL}/public/master-data/State?parent=${value}`);
                setEditStates(res.data.success ? res.data.data : []);
            } catch (error) { setEditStates([]); }
        } else {
            setEditStates([]);
        }
    } 
    else if (name === 'state') {
        setFormData(prev => ({ ...prev, state: value, city: '' }));
        if (value) {
            try {
                const res = await axios.get(`${API_BASE_URL}/public/master-data/City?parent=${value}`);
                setEditCities(res.data.success ? res.data.data : []);
            } catch (error) { setEditCities([]); }
        } else {
            setEditCities([]);
        }
    } 
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveExistingPhoto = (urlToRemove) => {
    setExistingPhotos(prev => prev.filter(url => url !== urlToRemove));
    if (activeImg === urlToRemove) setActiveImg(existingPhotos[0] || null);
  };

  const handleNewPhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const totalPhotos = existingPhotos.length + newPhotos.length + files.length;
    if (totalPhotos > 2) {
      toast.error("You can only have a maximum of 2 photos.");
      e.target.value = null; 
      return;
    }

    const loadingToast = toast.loading("Compressing photos...");
    const processedFiles = [];

    try {
      const options = {
        maxSizeMB: 1,           
        maxWidthOrHeight: 1920, 
        useWebWorker: true      
      };

      for (let i = 0; i < files.length; i++) {
        const compressedFile = await imageCompression(files[i], options);

        const sizeMB = compressedFile.size / (1024 * 1024);
        if (sizeMB > 2.5) {
           toast.error(`Image is still too large (${sizeMB.toFixed(2)}MB) even after compression.`);
           continue; 
        }
        processedFiles.push(compressedFile);
      }

      setNewPhotos(prev => [...prev, ...processedFiles]);
      toast.update(loadingToast, { render: "Photos processed successfully", type: "success", isLoading: false, autoClose: 2000 });
      
    } catch (error) {
      console.error("Compression Error:", error);
      toast.update(loadingToast, { render: "Failed to compress images. Try another photo.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      e.target.value = null; 
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading("Saving updates...");
    
    try {
      const token = localStorage.getItem('adminToken');
      const submitData = new FormData();
      
      const mainData = {
          firstName: formData.firstName, lastName: formData.lastName, gender: formData.gender,
          dob: formData.dob, maritalStatus: formData.maritalStatus, height: formData.height, diet: formData.diet,
          community: formData.community, subCommunity: formData.subCommunity, gothra: formData.gothra,
          highestQualification: formData.highestQualification, collegeName: formData.collegeName,
          jobRole: formData.jobRole, companyName: formData.companyName, annualIncome: formData.annualIncome,
          city: formData.city, state: formData.state, country: formData.country, residentsIn: formData.residentsIn,
          nri: formData.nri
      };

      const astrologyData = {
          star: formData.star, moonsign: formData.moonsign, pada: formData.pada, motherTongue: formData.motherTongue,
          timeOfBirth: formData.timeOfBirth, placeOfBirth: formData.placeOfBirth, nativeLocation: formData.nativeLocation,
          complexion: formData.complexion
      };

      const familyData = {
          familyType: formData.familyType, fatherName: formData.fatherName, fatherOccupation: formData.fatherOccupation,
          motherName: formData.motherName, motherOccupation: formData.motherOccupation,
          noOfBrothers: formData.noOfBrothers, noOfBrothersMarried: formData.noOfBrothersMarried,
          noOfSisters: formData.noOfSisters, noOfSistersMarried: formData.noOfSistersMarried
      };

      Object.keys(mainData).forEach(key => submitData.append(key, mainData[key]));
      submitData.append('astrologyDetails', JSON.stringify(astrologyData));
      submitData.append('familyDetails', JSON.stringify(familyData));

      existingPhotos.forEach(photo => submitData.append('existingPhotos', photo));
      newPhotos.forEach(file => submitData.append('newPhotos', file, file.name || 'uploaded_photo.jpg')); 

      const response = await axios.put(`${API_BASE_URL}/admin/users/${user._id}/update`, submitData, {
        headers: { Authorization: token } 
      });

      if (response.data.success) {
        toast.update(toastId, { render: "Profile updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
        setIsEditing(false);
        if (onUpdateSuccess) onUpdateSuccess(); 
      }
    } catch (error) {
      toast.update(toastId, { render: "Failed to update profile", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal-container" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', position: 'relative'}}>
        
        {showTimePicker && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'inherit'
          }}>
            <CustomTimePicker 
              isOpen={showTimePicker} 
              onClose={() => setShowTimePicker(false)} 
              initialTime={formData.timeOfBirth}
              onSet={(formattedTime) => {
                setFormData(prev => ({ ...prev, timeOfBirth: formattedTime }));
              }} 
            />
          </div>
        )}

        <div className="um-modal-header">
          <div className="um-modal-title-group">
            <h2 className="um-modal-name">
              {isEditing ? "Edit Profile" : `${user.firstName} ${user.lastName}`}
              {!isEditing && user.isPaidMember && <Crown size={18} className="icon-gold"/>}
            </h2>
            <span className="um-modal-id-badge">{user.uniqueId}</span>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`um-action-btn ${isEditing ? 'active' : ''}`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button onClick={onClose} className="um-close-btn"><X size={24} /></button>
          </div>
        </div>

        <div className="um-modal-body" ref={modalBodyRef} onScroll={checkScroll}>
          {!isEditing ? (
            <>
              <div className="um-modal-top-bar">
                 <div className="um-top-chips">
                    <span className={`um-chip ${user.isPaidMember ? 'gold-chip' : ''}`}>
                      {user.isPaidMember ? 'Premium Member' : 'Free Member'}
                    </span>
                    <span className="um-chip"><Calendar size={12}/> Joined: {formatDate(user.createdAt)}</span>
                    {(hasAgent || user.referralType === 'manual') && (
                      <span className="um-chip agent">
                        <Shield size={12}/> Referred by: <strong>{agentName}</strong> (ID: {agentCode})
                      </span>
                    )}
                 </div>
              </div>

              {user.photos && user.photos.length > 0 ? (
                <div className="um-gallery-section">
                  <div className="um-gallery-main"><img src={activeImg} alt="Main View" /></div>
                  <div className="um-gallery-thumbs">
                    {user.photos.map((src, i) => (
                      <div key={i} className={`um-thumb ${activeImg === src ? 'active' : ''}`} onClick={() => setActiveImg(src)}>
                        <img src={src} alt={`Thumb ${i}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (<div className="um-no-photos">No profile photos available.</div>)}

              <div className="um-details-layout">
                <div className="um-detail-column">
                  <h3 className="um-column-title"><User size={16} /> Personal</h3>
                  <div className="um-data-table">
                    <DataRow label="Date of Birth" value={formatDate(user.dob)} />
                    <DataRow label="Marital Status" value={user.maritalStatus} />
                    <DataRow label="Height" value={user.height ? `${user.height} cm` : "-"} />
                    <DataRow label="Diet" value={user.diet} />
                    <div className="um-spacer"></div>
                    <DataRow label="Community" value={user.community} />
                    <DataRow label="Sub-Community" value={user.subCommunity || user.caste} />
                    <DataRow label="Gothra" value={user.gothra} />
                  </div>
                </div>
                
                <div className="um-detail-column">
                  <h3 className="um-column-title"><Briefcase size={16} /> Professional</h3>
                  <div className="um-data-table">
                    <DataRow label="Education" value={user.highestQualification} />
                    <DataRow label="College" value={user.collegeName} />
                    <DataRow label="Occupation" value={user.jobRole} />
                    <DataRow label="Company" value={user.companyName} />
                    <DataRow label="Income" value={user.annualIncome} />
                    <div className="um-spacer"></div>
                    <DataRow label="Location" value={`${user.city}, ${user.state}`} />
                    <DataRow label="Country" value={user.country} />
                    <DataRow label="Residing In" value={user.residentsIn} />
                  </div>
                </div>

                <div className="um-detail-column highlight">
                  <h3 className="um-column-title"><Phone size={16} /> Contact</h3>
                  <div className="um-contact-box">
                    <div className="um-contact-item">
                        <span className="label">Mobile</span>
                        <a href={`tel:${user.mobileNumber}`} className="value">{user.mobileNumber}</a>
                    </div>
                    <div className="um-contact-item">
                        <span className="label">Email</span>
                        <a href={`mailto:${user.email}`} className="value" style={{wordBreak: 'break-all'}}>{user.email}</a>
                    </div>
                  </div>
                </div>
              </div>

              {(user.hasAstrologyAndFamilyDetails || user.astrologyDetails || user.familyDetails) && (
                <div className="um-details-layout" style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
                  <div className="um-detail-column">
                    <h3 className="um-column-title"><Moon size={16} /> Astrology Details</h3>
                    <div className="um-data-table">
                      <DataRow label="Star" value={user.astrologyDetails?.star} />
                      <DataRow label="Moonsign" value={user.astrologyDetails?.moonsign} />
                      <DataRow label="Pada" value={user.astrologyDetails?.pada} />
                      <DataRow label="Mother Tongue" value={user.astrologyDetails?.motherTongue} />
                      <div className="um-spacer"></div>
                      <DataRow label="Birth Time" value={user.astrologyDetails?.timeOfBirth} />
                      <DataRow label="Birth Place" value={user.astrologyDetails?.placeOfBirth} />
                      <DataRow label="Native Place" value={user.astrologyDetails?.nativeLocation} />
                      <DataRow label="Complexion" value={user.astrologyDetails?.complexion} />
                    </div>
                  </div>

                  <div className="um-detail-column">
                    <h3 className="um-column-title"><Users size={16} /> Family Details</h3>
                    <div className="um-data-table">
                      <DataRow label="Family Type" value={user.familyDetails?.familyType} />
                      <DataRow label="Father's Name" value={user.familyDetails?.fatherName} />
                      <DataRow label="Father's Occ." value={user.familyDetails?.fatherOccupation} />
                      <DataRow label="Mother's Name" value={user.familyDetails?.motherName} />
                      <DataRow label="Mother's Occ." value={user.familyDetails?.motherOccupation} />
                      <div className="um-spacer"></div>
                      <DataRow label="Brothers" value={`${user.familyDetails?.noOfBrothers || 0} (Married: ${user.familyDetails?.noOfBrothersMarried || 0})`} />
                      <DataRow label="Sisters" value={`${user.familyDetails?.noOfSisters || 0} (Married: ${user.familyDetails?.noOfSistersMarried || 0})`} />
                      <DataRow label="NRI Status" value={user.nri} /> 
                    </div>
                  </div>
                  
                  <div className="um-detail-column" style={{opacity: 0}}></div>
                </div>
              )}
            </>
          ) : (
            
          <div className="um-edit-form">
            <h3 className="um-column-title" style={{marginBottom: '15px'}}><User size={16} /> Basic Details</h3>
            <div className="um-form-grid" style={{marginBottom: '20px'}}>
              <FormGroup label="First Name"><input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="um-input" /></FormGroup>
              <FormGroup label="Last Name"><input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="um-input" /></FormGroup>
              <FormGroup label="Gender">
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="um-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </FormGroup>
              <FormGroup label="Date of Birth"><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="um-input" /></FormGroup>
              <FormGroup label="Marital Status">
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="um-input">
                    {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Height (cm)"><input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="Height (cm)" className="um-input" /></FormGroup>
            </div>

            <h3 className="um-column-title" style={{marginBottom: '15px'}}><Users size={16} /> Religion & Community</h3>
            <div className="um-form-grid" style={{marginBottom: '20px'}}>
              <FormGroup label="Community">
                <select name="community" value={formData.community} onChange={handleInputChange} className="um-input">
                  <option value="">Select Community</option>
                  {masterData?.communities.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </FormGroup>
              
              <FormGroup label="Sub-Community / Caste">
                <select name="subCommunity" value={formData.subCommunity} onChange={handleInputChange} className="um-input" disabled={!formData.community}>
                  <option value="">Select Sub-Community</option>
                  {editModeSubCommunities.map((sub, idx) => {
                    const val = typeof sub === 'string' ? sub : sub.name;
                    return <option key={idx} value={val}>{val}</option>;
                  })}
                </select>
              </FormGroup>

              <FormGroup label="Gothra"><input name="gothra" value={formData.gothra} onChange={handleInputChange} placeholder="Gothra" className="um-input" /></FormGroup>
              
              <FormGroup label="Diet">
                <select name="diet" value={formData.diet} onChange={handleInputChange} className="um-input">
                  <option value="">Select Diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </FormGroup>
            </div>

            <h3 className="um-column-title" style={{marginBottom: '15px'}}><Briefcase size={16} /> Professional & Location</h3>
            <div className="um-form-grid" style={{marginBottom: '20px'}}>
              <FormGroup label="Education">
                <select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} className="um-input">
                  <option value="">Select Education</option>
                  {masterData?.educations.map((e, idx) => <option key={idx} value={e.name}>{e.name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="Occupation">
                <select name="jobRole" value={formData.jobRole} onChange={handleInputChange} className="um-input">
                  <option value="">Select Occupation</option>
                  {masterData?.occupations.map((o, idx) => <option key={idx} value={o.name}>{o.name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="College Name"><input name="collegeName" value={formData.collegeName} onChange={handleInputChange} placeholder="College Name" className="um-input" /></FormGroup>
              <FormGroup label="Company Name"><input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Company Name" className="um-input" /></FormGroup>
              <FormGroup label="Annual Income"><input name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} placeholder="Annual Income" className="um-input" /></FormGroup>
              
              <FormGroup label="Country">
                <select name="country" value={formData.country} onChange={handleInputChange} className="um-input">
                  <option value="">Select Country</option>
                  {masterData?.countries.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="State">
                <select name="state" value={formData.state} onChange={handleInputChange} className="um-input" disabled={!formData.country}>
                  <option value="">Select State</option>
                  {editStates.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="City">
                <select name="city" value={formData.city} onChange={handleInputChange} className="um-input" disabled={!formData.state}>
                  <option value="">Select City</option>
                  {editCities.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="Residing In">
                 <select name="residentsIn" value={formData.residentsIn} onChange={handleInputChange} className="um-input">
                    <option value="">Select Residing Status</option>
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Alone">Alone</option>
                    <option value="Rent">Rent</option>
                </select>
              </FormGroup>
            </div>

            <h3 className="um-column-title" style={{marginBottom: '15px'}}><Moon size={16} /> Astrology Details</h3>
            <div className="um-form-grid" style={{marginBottom: '20px'}}>
               <FormGroup label="Star">
                 <select name="star" value={formData.star} onChange={handleInputChange} className="um-input">
                   <option value="">Select Star</option>
                   {masterData?.stars?.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                 </select>
               </FormGroup>
               <FormGroup label="Moonsign">
                 <select name="moonsign" value={formData.moonsign} onChange={handleInputChange} className="um-input">
                   <option value="">Select Moonsign</option>
                   {masterData?.moonsigns?.map((m, idx) => <option key={idx} value={m.name}>{m.name}</option>)}
                 </select>
               </FormGroup>
               <FormGroup label="Pada">
                  <select name="pada" value={formData.pada} onChange={handleInputChange} className="um-input">
                    <option value="">Select Pada</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
               </FormGroup>
               <FormGroup label="Mother Tongue">
                 <select name="motherTongue" value={formData.motherTongue} onChange={handleInputChange} className="um-input">
                   <option value="">Select Mother Tongue</option>
                   {masterData?.motherTongues?.map((m, idx) => <option key={idx} value={m.name}>{m.name}</option>)}
                 </select>
               </FormGroup>

               <FormGroup label="Time of Birth">
                 <div style={{ position: 'relative' }}>
                   <input 
                     type="text" 
                     name="timeOfBirth" 
                     value={formData.timeOfBirth} 
                     readOnly
                     onClick={() => setShowTimePicker(true)}
                     className="um-input" 
                     style={{ cursor: 'pointer' }}
                     placeholder="e.g. 02:30 PM"
                   />
                 </div>
               </FormGroup>

               <FormGroup label="Place of Birth"><input name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} placeholder="Place of Birth" className="um-input" /></FormGroup>
               <FormGroup label="Native Place"><input name="nativeLocation" value={formData.nativeLocation} onChange={handleInputChange} placeholder="Native Place" className="um-input" /></FormGroup>
               <FormGroup label="Complexion">
                  <select name="complexion" value={formData.complexion} onChange={handleInputChange} className="um-input">
                    <option value="">Select Complexion</option>
                    <option value="Very Fair">Very Fair</option>
                    <option value="Fair">Fair</option>
                    <option value="Wheatish">Wheatish</option>
                    <option value="Dark">Dark</option>
                  </select>
               </FormGroup>
            </div>

            <h3 className="um-column-title" style={{marginBottom: '15px'}}><Users size={16} /> Family Details</h3>
            <div className="um-form-grid" style={{marginBottom: '20px'}}>

                <FormGroup label="Family Type">
                  <select name="familyType" value={formData.familyType} onChange={handleInputChange} className="um-input">
                    <option value="">Select Family Type</option>
                    <option value="Nuclear">Nuclear</option>
                    <option value="Joint">Joint</option>
                    <option value="Extended">Extended</option>
                  </select>
                </FormGroup>

                <FormGroup label="Father's Name"><input name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father's Name" className="um-input" /></FormGroup>
                
                <FormGroup label="Father's Occupation">
                  <input name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} placeholder="Father's Occupation" className="um-input" />
                </FormGroup>

                <FormGroup label="Mother's Name"><input name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Mother's Name" className="um-input" /></FormGroup>
                
                <FormGroup label="Mother's Occupation">
                  <input name="motherOccupation" value={formData.motherOccupation} onChange={handleInputChange} placeholder="Mother's Occupation" className="um-input" />
                </FormGroup>

                <FormGroup label="No. of Brothers">
                  <select name="noOfBrothers" value={formData.noOfBrothers} onChange={handleInputChange} className="um-input">
                    {[...Array(11).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </FormGroup>
                
                <FormGroup label="Brothers Married">
                  <select name="noOfBrothersMarried" value={formData.noOfBrothersMarried} onChange={handleInputChange} className="um-input">
                    {[...Array(11).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </FormGroup>
                
                <FormGroup label="No. of Sisters">
                  <select name="noOfSisters" value={formData.noOfSisters} onChange={handleInputChange} className="um-input">
                    {[...Array(11).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </FormGroup>
                
                <FormGroup label="Sisters Married">
                  <select name="noOfSistersMarried" value={formData.noOfSistersMarried} onChange={handleInputChange} className="um-input">
                    {[...Array(11).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </FormGroup>

                <FormGroup label="NRI Status">
                   <select name="nri" value={formData.nri} onChange={handleInputChange} className="um-input">
                     <option value="No">No</option>
                     <option value="Yes">Yes</option>
                   </select>
                </FormGroup>
            </div>

            <h3 className="um-column-title" style={{marginBottom: '15px'}}>Manage Photos (Max 2)</h3>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px'}}>
              
              {existingPhotos.map((url, i) => (
                <div key={`exist-${i}`} style={{position: 'relative', width: '100px', height: '100px'}}>
                  <img src={url} alt="existing" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
                  <button type="button" onClick={() => handleRemoveExistingPhoto(url)} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '2px'}}><X size={14}/></button>
                </div>
              ))}

              {newPhotos.map((file, i) => (
                <div key={`new-${i}`} style={{position: 'relative', width: '100px', height: '100px'}}>
                  <img src={URL.createObjectURL(file)} alt="new" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid green'}} />
                  <button type="button" onClick={() => handleRemoveNewPhoto(i)} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '2px'}}><X size={14}/></button>
                </div>
              ))}
            </div>

            {(existingPhotos.length + newPhotos.length) < 2 ? (
              <div style={{
                  border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', 
                  textAlign: 'center', cursor: 'pointer', position: 'relative',
                  backgroundColor: '#f8fafc', marginBottom: '20px', transition: 'all 0.2s ease'
              }}>
                <input 
                  type="file" multiple accept="image/*" onChange={handleNewPhotoChange} 
                  style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                   <Upload size={24} />
                   <span style={{ fontSize: '14px', fontWeight: '500' }}>Click or drag to upload photos</span>
                   <span style={{ fontSize: '12px' }}>Remaining slots: {2 - (existingPhotos.length + newPhotos.length)} (JPEG, PNG accepted)</span>
                </div>
              </div>
            ) : (
              <p style={{fontSize: '13px', color: '#059669', fontWeight: '500', backgroundColor: '#d1fae5', padding: '10px 14px', borderRadius: '6px', display: 'inline-block'}}>
                <CheckCircle size={14} style={{verticalAlign: 'middle', marginRight: '6px'}}/> You have reached the maximum of 2 photos.
              </p>
            )}

            <div className="um-form-actions" style={{justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
              <button type="button" onClick={() => setIsEditing(false)} className="um-text-btn" disabled={loading}>Cancel</button>
              <button type="button" onClick={handleSave} className="um-primary-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
          )}
        </div>
        
        {/* NEW SCROLL INDICATOR UI */}
        {showScrollIndicator && (
          <div className="um-scroll-indicator">
            <ChevronDown size={18} />
            <span>Scroll for more</span>
          </div>
        )}

      </div>
    </div>
  );
};

const DataRow = ({ label, value }) => (
  <div className="um-row">
    <span className="um-lbl">{label}</span>
    <span className="um-val" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{value || "-"}</span>
  </div>
);

export default AdminUserManagement;

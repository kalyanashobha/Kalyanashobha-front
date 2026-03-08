import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { 
  Search, Filter, Trash2, Ban, CheckCircle, 
  User, X, ChevronLeft, ChevronRight,
  Briefcase, MapPin, Shield, 
  Crown, Sparkles, Phone, Calendar, Hash,
  Moon, Users
} from 'lucide-react';
import './UserManagement.css'; 

const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api";

// --- STATIC DATA ARRAYS (Reduced) ---
const MARITAL_STATUSES = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

// Initial Filter State with Defaults (Religion Removed)
const INITIAL_FILTERS = {
  memberId: '', gender: '', maritalStatus: '',
  minAge: '', maxAge: '', community: '', 
  subCommunity: '', education: '', occupation: '',
  country: '', state: '', city: '', motherTongue: ''
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
  const [masterStates, setMasterStates] = useState([]);
  const [masterCities, setMasterCities] = useState([]);
  const [masterEducations, setMasterEducations] = useState([]);
  const [masterOccupations, setMasterOccupations] = useState([]);
  // NEW: State for Mother Tongue
  const [masterMotherTongues, setMasterMotherTongues] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [referralFilter, setReferralFilter] = useState("all");
  const [advFilters, setAdvFilters] = useState(INITIAL_FILTERS);

  // Fetch All Master Data on Mount
  useEffect(() => {
    const fetchAllMasterData = async () => {
      try {
        const [
          commRes, countryRes, stateRes, cityRes, eduRes, occRes, mtRes
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/public/get-all-communities`),
          axios.get(`${API_BASE_URL}/public/master-data/Country`),
          axios.get(`${API_BASE_URL}/public/master-data/State`),
          axios.get(`${API_BASE_URL}/public/master-data/City`),
          axios.get(`${API_BASE_URL}/public/master-data/Education`),
          axios.get(`${API_BASE_URL}/public/master-data/Designation`), // 'Designation' maps to occupation/jobRole
          axios.get(`${API_BASE_URL}/public/master-data/MotherTongue`) // NEW: Fetching Mother Tongue
        ]);

        if (commRes.data.success) setMasterCommunities(commRes.data.data);
        if (countryRes.data.success) setMasterCountries(countryRes.data.data);
        if (stateRes.data.success) setMasterStates(stateRes.data.data);
        if (cityRes.data.success) setMasterCities(cityRes.data.data);
        if (eduRes.data.success) setMasterEducations(eduRes.data.data);
        if (occRes.data.success) setMasterOccupations(occRes.data.data);
        if (mtRes.data.success) setMasterMotherTongues(mtRes.data.data); // Setting Mother Tongue data

      } catch (err) {
        console.error("Failed to load master data", err);
      }
    };
    
    fetchAllMasterData();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, referralFilter, page, showAdvanced]);

  const handleAdvChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'community') {
      setAdvFilters({ ...advFilters, community: value, subCommunity: '' });
      const found = masterCommunities.find(c => c.name === value);
      if (found) {
        setAvailableSubCommunities(found.subCommunities || []);
      } else {
        setAvailableSubCommunities([]);
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

                {/* NEW: Updated Mother Tongue from input to select */}
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

                <select name="state" value={advFilters.state} onChange={handleAdvChange} className="um-input">
                    <option value="">State (Any)</option>
                    {masterStates.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                </select>

                <select name="city" value={advFilters.city} onChange={handleAdvChange} className="um-input">
                    <option value="">City (Any)</option>
                    {masterCities.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
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

        {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </div>
    </>
  );
};

// --- SKELETON COMPONENT ---
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

// --- USER BLOCK ---
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

// --- DETAIL MODAL ---
const UserDetailModal = ({ user, onClose }) => {
  const [activeImg, setActiveImg] = useState(user.photos && user.photos.length > 0 ? user.photos[0] : null);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : "-";

  const hasAgent = user.referredByAgentId && typeof user.referredByAgentId === 'object';
  const agentName = hasAgent ? user.referredByAgentId.name : user.referredByAgentName;
  const agentCode = hasAgent ? user.referredByAgentId.agentCode : "Manual";

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal-container" onClick={e => e.stopPropagation()} style={{maxWidth: '900px'}}>
        <div className="um-modal-header">
          <div className="um-modal-title-group">
            <h2 className="um-modal-name">
              {user.firstName} {user.lastName} 
              {user.isPaidMember && <Crown size={18} className="icon-gold"/>}
            </h2>
            <span className="um-modal-id-badge">{user.uniqueId}</span>
          </div>
          <button onClick={onClose} className="um-close-btn"><X size={24} /></button>
        </div>

        <div className="um-modal-body">
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

          {/* Premium Gallery Layout */}
          {user.photos && user.photos.length > 0 ? (
            <div className="um-gallery-section">
              <div className="um-gallery-main">
                 <img src={activeImg} alt="Main View" />
              </div>
              <div className="um-gallery-thumbs">
                {user.photos.map((src, i) => (
                  <div 
                    key={i} 
                    className={`um-thumb ${activeImg === src ? 'active' : ''}`}
                    onClick={() => setActiveImg(src)}
                  >
                    <img src={src} alt={`Thumb ${i}`} />
                  </div>
                ))}
              </div>
            </div>
          ) : (<div className="um-no-photos">No profile photos available.</div>)}

          {/* ROW 1: Personal, Professional, Contact */}
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

          {/* ROW 2: Astrology & Family Details */}
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
                  <DataRow label="Father's Name" value={user.familyDetails?.fatherName} />
                  <DataRow label="Father's Occ." value={user.familyDetails?.fatherOccupation} />
                  <DataRow label="Mother's Name" value={user.familyDetails?.motherName} />
                  <DataRow label="Mother's Occ." value={user.familyDetails?.motherOccupation} />
                  <div className="um-spacer"></div>
                  <DataRow label="Brothers" value={`${user.familyDetails?.noOfBrothers || 0} (Married: ${user.familyDetails?.noOfBrothersMarried || 0})`} />
                  <DataRow label="Sisters" value={`${user.familyDetails?.noOfSisters || 0} (Married: ${user.familyDetails?.noOfSistersMarried || 0})`} />
                  <DataRow label="NRI Status" value={user.familyDetails?.nri} />
                </div>
              </div>
              
              <div className="um-detail-column" style={{opacity: 0}}>{/* Empty Spacer Column */}</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const DataRow = ({ label, value }) => (
  <div className="um-row"><span className="um-lbl">{label}</span><span className="um-val">{value || "-"}</span></div>
);

export default AdminUserManagement;

import React, { useState, useEffect, useRef } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import toast, { Toaster } from 'react-hot-toast'; 
import imageCompression from 'browser-image-compression'; 
import { Edit, Camera, BadgeCheck, MapPin, Briefcase } from 'lucide-react'; 
import './MyProfile.css';

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

  const handleHourChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 12) val = '12';
    setHour(val);
  };

  const handleMinuteChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 59) val = '59';
    setMinute(val);
  };

  const handleSet = () => {
    if (hour && minute) {
      onSet(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')} ${period}`);
    } else {
      onSet(''); 
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mp-modal-overlay mp-fade-in">
      <div className="mp-modal">
        <div className="mp-modal-header">
          <h3>Select Time of Birth</h3>
        </div>
        <div className="mp-time-inputs">
          <div className="mp-time-col">
            <input type="number" placeholder="12" value={hour} onChange={handleHourChange} />
            <span>Hour</span>
          </div>
          <span className="mp-time-colon">:</span>
          <div className="mp-time-col">
            <input type="number" placeholder="00" value={minute} onChange={handleMinuteChange} />
            <span>Minute</span>
          </div>
          <div className="mp-time-col">
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <span>AM/PM</span>
          </div>
        </div>
        <div className="mp-modal-actions">
          <button type="button" className="mp-btn mp-btn-ghost" onClick={() => { setHour(''); setMinute(''); setPeriod('AM'); }}>Clear</button>
          <button type="button" className="mp-btn mp-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="mp-btn mp-btn-primary" onClick={handleSet}>Set Time</button>
        </div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const ProfileSkeleton = () => (
  <div className="mp-container mp-fade-in">
    <div className="mp-card mp-hero">
      <div className="mp-skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
      <div style={{ flex: 1, paddingBottom: '16px' }}>
        <div className="mp-skeleton" style={{ width: '40%', height: '32px', marginBottom: '12px' }}></div>
        <div className="mp-skeleton" style={{ width: '25%', height: '16px' }}></div>
      </div>
    </div>
    <div className="mp-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="mp-card">
          <div className="mp-skeleton" style={{ width: '40%', height: '20px', marginBottom: '1.5rem' }}></div>
          <div className="mp-info-grid">
            {[1, 2, 3, 4].map(j => (
              <div key={j}>
                <div className="mp-skeleton" style={{ width: '50%', height: '10px', marginBottom: '8px' }}></div>
                <div className="mp-skeleton" style={{ width: '80%', height: '16px' }}></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- REUSABLE COMPONENTS ---
const DataField = ({ label, value, sub }) => (
  <div>
    <span className="mp-info-label">{label}</span>
    <p className="mp-info-value">{value || <span className="mp-empty">Not Specified</span>}</p>
    {sub && <small className="mp-info-sub">{sub}</small>}
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div className="mp-input-group">
    <input type={type} name={name} className="mp-input" value={value || ''} onChange={onChange} placeholder=" " />
    <label>{label}</label>
  </div>
);

// STRICT NATIVE DROPDOWN (Updated to prevent blank boxes when data is missing/loading)
const SelectField = ({ label, name, value, options, onChange, disabled }) => {
  // Check if current DB value exists in the options array
  const valueExists = value && options && options.some(opt => {
    const val = typeof opt === 'string' ? opt : (opt?.name || opt?.subCommunityName || opt?.value);
    return val === value;
  });

  return (
    <div className="mp-input-group">
      <select className="mp-input" name={name} value={value || ''} onChange={onChange} disabled={disabled}>
        <option value="" disabled hidden></option>
        
        {/* Fallback: Show the current value even if it's not in the dropdown list yet */}
        {value && !valueExists && (
          <option value={value}>{value}</option>
        )}

        {options && options.length > 0 ? (
          options.map((opt, i) => {
            const val = typeof opt === 'string' ? opt : (opt?.name || opt?.subCommunityName || opt?.value);
            return val ? <option key={i} value={val}>{val}</option> : null;
          })
        ) : (
          <option value="" disabled>No options available</option>
        )}
      </select>
      <label className={value ? 'mp-label-active' : ''}>{label}</label>
    </div>
  );
};

// TYPABLE + SELECTABLE COMBOBOX (Used for Country/State/City)
const ComboField = ({ label, name, value, options, onChange, disabled }) => {
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
    
    // If input is cleared, show all options. Otherwise, filter.
    if (!val.trim()) {
      setFiltered(options || []);
    } else {
      setFiltered((options || []).filter(opt => {
        const text = typeof opt === 'string' ? opt : opt.name;
        return text.toLowerCase().includes(val);
      }));
    }
  };

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setFiltered(options || []); // Reset filter for next time
  };

  return (
    <div className="mp-input-group" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        className="mp-input"
        value={value || ''}
        onChange={handleInputChange}
        onFocus={() => { if(!disabled) { setIsOpen(true); setFiltered(options || []); } }}
        disabled={disabled}
        placeholder=" "
        autoComplete="off"
        style={{ paddingRight: '40px', opacity: disabled ? 0.6 : 1 }}
      />
      <label className={value || isOpen ? 'mp-label-active' : ''}>{label}</label>

      <div
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: disabled ? 'not-allowed' : 'pointer', zIndex: 2, padding: '4px' }}
        onClick={(e) => {
            e.stopPropagation();
            if(!disabled) {
                setIsOpen(!isOpen);
                setFiltered(options || []); // Always reset filter when arrow is clicked
            }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>

      {isOpen && !disabled && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px',
          maxHeight: '200px', overflowY: 'auto', zIndex: 1000, padding: '4px', margin: 0,
          listStyle: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          {filtered.length > 0 ? filtered.map((opt, idx) => {
            const text = typeof opt === 'string' ? opt : opt.name;
            return (
              <li key={idx}
                  onClick={() => handleSelect(text)}
                  style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', color: '#1e293b', fontSize: '0.9rem', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {text}
              </li>
            )
          }) : (
            <li style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
};

// --- MAIN PROFILE COMPONENT ---
const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [referredBy, setReferredBy] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]); 
  const [newPhotos, setNewPhotos] = useState([]); 

  const [masterData, setMasterData] = useState({
    communities: [], countries: [], educations: [],
    occupations: [], motherTongues: [], stars: [], moonsigns: []
  });
  const [dependentStates, setDependentStates] = useState([]);
  const [dependentCities, setDependentCities] = useState([]);

  const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api";

  const countOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  // FIX: Synchronized loading to resolve race conditions
  useEffect(() => { 
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchInitialMasterData(), fetchProfile()]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  const fetchInitialMasterData = async () => {
    try {
      const endpoints = [
        '/public/get-all-communities',
        '/public/master-data/Country',
        '/public/master-data/Education',
        '/public/master-data/Designation',
        '/public/master-data/MotherTongue',
        '/public/master-data/Star',
        '/public/master-data/Moonsign'
      ];

      const responses = await Promise.all(
        endpoints.map(ep => fetch(`${API_BASE_URL}${ep}`).then(res => res.json()))
      );

      setMasterData({
        communities: responses[0]?.success ? (responses[0].data || []) : [],
        countries: responses[1]?.success ? (responses[1].data || []) : [],
        educations: responses[2]?.success ? (responses[2].data || []) : [],
        occupations: responses[3]?.success ? (responses[3].data || []) : [],
        motherTongues: responses[4]?.success ? (responses[4].data || []) : [],
        stars: responses[5]?.success ? (responses[5].data || []) : [],
        moonsigns: responses[6]?.success ? (responses[6].data || []) : []
      });
    } catch (err) {
      console.error("Failed to load master data", err);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; 
    
    try {
      const res = await fetch(`${API_BASE_URL}/user/my-profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': token }
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setReferredBy(data.referredBy || null); 

        const subComm = data.user.subCommunity || data.user.caste || '';

        setFormData({
            ...data.user,
            subCommunity: subComm,
            astrologyDetails: data.user.astrologyDetails || {},
            familyDetails: data.user.familyDetails || {}
        });
        setExistingPhotos(data.user.photos || []);

        if (data.user.country) {
          fetch(`${API_BASE_URL}/public/master-data/State?parent=${data.user.country}`)
            .then(r => r.json())
            .then(res => setDependentStates(res?.success ? (res.data || []) : []))
            .catch(() => setDependentStates([]));
        }
        if (data.user.state) {
          fetch(`${API_BASE_URL}/public/master-data/City?parent=${data.user.state}`)
            .then(r => r.json())
            .then(res => setDependentCities(res?.success ? (res.data || []) : []))
            .catch(() => setDependentCities([]));
        }
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } 
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Updating profile...");

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photos' || key === 'astrologyDetails' || key === 'familyDetails') return;
        submitData.append(key, formData[key] || '');
      });
      Object.keys(formData.astrologyDetails || {}).forEach(key => submitData.append(`astrologyDetails[${key}]`, formData.astrologyDetails[key]));
      Object.keys(formData.familyDetails || {}).forEach(key => submitData.append(`familyDetails[${key}]`, formData.familyDetails[key]));
      existingPhotos.forEach(url => submitData.append('existingPhotos', url));
      newPhotos.forEach(file => submitData.append('photos', file));

      const res = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: 'PUT', headers: { 'Authorization': token }, body: submitData
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setExistingPhotos(data.user.photos || []);
        setNewPhotos([]); 
        setIsEditing(false);
        toast.success("Profile updated successfully!", { id: toastId });
      } else {
        toast.error(data.message || "Update failed", { id: toastId });
      }
    } catch (err) { toast.error("Network error occurred", { id: toastId }); }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'country') {
        setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
        setDependentCities([]);
        if (value) {
          try {
            const res = await fetch(`${API_BASE_URL}/public/master-data/State?parent=${value}`).then(r => r.json());
            setDependentStates(res?.success ? (res.data || []) : []);
          } catch(e) { setDependentStates([]); }
        } else {
          setDependentStates([]);
        }
      } 
      else if (name === 'state') {
        setFormData(prev => ({ ...prev, state: value, city: '' }));
        if (value) {
          try {
            const res = await fetch(`${API_BASE_URL}/public/master-data/City?parent=${value}`).then(r => r.json());
            setDependentCities(res?.success ? (res.data || []) : []);
          } catch(e) { setDependentCities([]); }
        } else {
          setDependentCities([]);
        }
      }
      else if (name === 'community') {
        setFormData(prev => ({ ...prev, community: value, subCommunity: '' }));
      }
    }
  };

  const handlePhotoSelect = async (e) => {
    const inputTarget = e.target; 
    const files = Array.from(inputTarget.files);
    if (existingPhotos.length + newPhotos.length + files.length > 2) {
      toast.error("Maximum 2 photos allowed.");
      inputTarget.value = null; return;
    }

    const loadingToast = toast.loading("Processing photos...");
    const compressedFiles = [];
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      for (let i = 0; i < files.length; i++) {
        const compressedFile = await imageCompression(files[i], options);
        if (compressedFile.size > 2.5 * 1024 * 1024) { toast.error(`Image too large.`); continue; }
        compressedFiles.push(compressedFile);
      }
      setNewPhotos([...newPhotos, ...compressedFiles]);
      toast.success("Photos ready", { id: loadingToast });
    } catch (error) { toast.error("Failed to process images.", { id: loadingToast }); } 
    finally { inputTarget.value = null; }
  };

  const removeExistingPhoto = (urlToRemove) => setExistingPhotos(existingPhotos.filter(url => url !== urlToRemove));
  const removeNewPhoto = (indexToRemove) => setNewPhotos(newPhotos.filter((_, index) => index !== indexToRemove));
  const calculateAge = (dob) => dob ? Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970) : "N/A";

  // EXACT MATCH logic from your AdminUserManagement file
  const selectedCommObj = masterData.communities.find(c => c.name === formData.community);
  const editModeSubCommunities = selectedCommObj ? (selectedCommObj.subCommunities || []) : [];

  return (
    <div className="mp-page-wrapper">
      <Navbar/>
      <Toaster position="top-center" containerStyle={{ zIndex: 999999, top: 80 }} />

      {showTimePicker && (
        <CustomTimePicker 
          isOpen={showTimePicker} 
          onClose={() => setShowTimePicker(false)} 
          initialTime={formData.astrologyDetails?.timeOfBirth} 
          onSet={(time) => setFormData(prev => ({ ...prev, astrologyDetails: { ...prev.astrologyDetails, timeOfBirth: time } }))} 
        />
      )}

      {loading ? <ProfileSkeleton /> : (
        <div className="mp-container mp-fade-in">

          <div className="mp-hero">
            <div className="mp-avatar-wrapper">
              <img src={user?.photos?.[0] || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} alt="Profile" className="mp-avatar" />
              {user?.isPaidMember && (
                <div className="mp-badge" title="Verified Member"><BadgeCheck size={24} fill="#10B981" color="#fff" /></div>
              )}
            </div>

            <div className="mp-hero-info">
              <h1 className="mp-name">{user?.firstName} {user?.lastName}</h1>
              <div className="mp-meta">
                 <span className="mp-meta-item"><Briefcase size={16}/> {user?.jobRole || 'Profession Not Added'}</span>
                 <span className="mp-meta-item"><MapPin size={16}/> {user?.city ? `${user.city}, ${user.state}` : 'Location Not Added'}</span>
              </div>
              <div className="mp-tags">
                <span className="mp-tag">ID: {user?.uniqueId || 'N/A'}</span>
                {referredBy && (
                  <span className="mp-tag">
                    ✨ Ref: {referredBy.name} (ID: {referredBy.agentCode})
                  </span>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="mp-hero-actions">
                <button onClick={() => setIsEditing(true)} className="mp-btn mp-btn-primary">
                  <Edit size={16} /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="mp-grid">
              <div className="mp-card">
                <h3 className="mp-card-title">Basic Information</h3>
                <div className="mp-info-grid">
                  <DataField label="Age / DOB" value={`${calculateAge(user?.dob)} Years`} sub={user?.dob ? `(${new Date(user?.dob).toLocaleDateString()})` : ''} />
                  <DataField label="Gender" value={user?.gender} />
                  <DataField label="Height" value={user?.height ? `${user.height} cm` : null} />
                  <DataField label="Marital Status" value={user?.maritalStatus} />
                  <DataField label="Religion" value={user?.religion} />
                  <DataField label="Community" value={user?.community} />
                  <DataField label="Sub-Community" value={user?.subCommunity || user?.caste} />
                  <DataField label="Gothra" value={user?.gothra} />
                  <DataField label="Diet" value={user?.diet} />
                </div>
              </div>

              <div className="mp-card">
                <h3 className="mp-card-title">Professional & Contact</h3>
                <div className="mp-info-grid">
                  <DataField label="Qualification" value={user?.highestQualification} />
                  <DataField label="College" value={user?.collegeName} />
                  <DataField label="Job Role" value={user?.jobRole} />
                  <DataField label="Company" value={user?.companyName} />
                  <DataField label="Annual Income" value={user?.annualIncome} />
                  <DataField label="Email" value={user?.email} />
                  <DataField label="Phone" value={user?.mobileNumber} />
                  <DataField label="Country" value={user?.country} />
                  <DataField label="Location" value={user?.city ? `${user.city}, ${user.state}` : null} />
                </div>
              </div>

              <div className="mp-card">
                <h3 className="mp-card-title">Astrology Details</h3>
                <div className="mp-info-grid">
                  <DataField label="Moonsign / Rasi" value={user?.astrologyDetails?.moonsign} />
                  <DataField label="Star / Nakshatra" value={user?.astrologyDetails?.star} />
                  <DataField label="Pada" value={user?.astrologyDetails?.pada} />
                  <DataField label="Mother Tongue" value={user?.astrologyDetails?.motherTongue} />
                  <DataField label="Time of Birth" value={user?.astrologyDetails?.timeOfBirth} />
                  <DataField label="Place of Birth" value={user?.astrologyDetails?.placeOfBirth} />
                </div>
              </div>

              <div className="mp-card">
                <h3 className="mp-card-title">Family Details</h3>
                <div className="mp-info-grid">
                  <DataField label="Father's Name" value={user?.familyDetails?.fatherName} />
                  <DataField label="Father's Occupation" value={user?.familyDetails?.fatherOccupation} />
                  <DataField label="Mother's Name" value={user?.familyDetails?.motherName} />
                  <DataField label="Mother's Occupation" value={user?.familyDetails?.motherOccupation} />
                  <DataField label="Brothers" value={`${user?.familyDetails?.noOfBrothers || "0"} Total`} sub={`(${user?.familyDetails?.noOfBrothersMarried || "0"} Married)`} />
                  <DataField label="Sisters" value={`${user?.familyDetails?.noOfSisters || "0"} Total`} sub={`(${user?.familyDetails?.noOfSistersMarried || "0"} Married)`} />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="mp-fade-in">
              <div className="mp-grid">

                {/* PHOTOS - Full Width */}
                <div className="mp-card mp-card-full">
                  <h3 className="mp-card-title">Manage Photos (Max 2)</h3>
                  <div className="mp-photo-grid">
                    {existingPhotos.map((url, i) => (
                      <div key={`existing-${i}`} className="mp-photo-item">
                        <img src={url} alt="Existing" />
                        <button type="button" className="mp-photo-remove" onClick={() => removeExistingPhoto(url)}>×</button>
                      </div>
                    ))}
                    {newPhotos.map((file, i) => (
                      <div key={`new-${i}`} className="mp-photo-item">
                        <img src={URL.createObjectURL(file)} alt="New Preview" />
                        <button type="button" className="mp-photo-remove" onClick={() => removeNewPhoto(i)}>×</button>
                      </div>
                    ))}
                    {existingPhotos.length + newPhotos.length < 2 && (
                      <label className="mp-photo-upload">
                        <Camera size={24} style={{marginBottom: '8px'}} />
                        <span style={{fontSize: '0.8rem'}}>Upload</span>
                        <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} hidden />
                      </label>
                    )}
                  </div>
                </div>

                <div className="mp-card">
                  <h3 className="mp-card-title">Personal Details</h3>
                  <div className="mp-form-grid">
                    <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} options={["Never Married", "Divorced", "Widowed"]} onChange={handleChange} />
                    <InputField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                    <SelectField label="Diet" name="diet" value={formData.diet} options={["Veg", "Non-Veg", "Eggetarian"]} onChange={handleChange} />
                    <InputField label="Gothra" name="gothra" value={formData.gothra} onChange={handleChange} />

                    {/* STRICT NATIVE SELECT FIELDS FOR COMMUNITY */}
                    <SelectField label="Community" name="community" value={formData.community} options={masterData.communities} onChange={handleChange} />
                    <SelectField label="Sub-Community / Caste" name="subCommunity" value={formData.subCommunity} options={editModeSubCommunities} onChange={handleChange} disabled={!formData.community} />
                  </div>
                </div>

                <div className="mp-card">
                  <h3 className="mp-card-title">Professional & Contact</h3>
                  <div className="mp-form-grid">
                    <SelectField label="Qualification" name="highestQualification" value={formData.highestQualification} options={masterData.educations} onChange={handleChange} />
                    <InputField label="College" name="collegeName" value={formData.collegeName} onChange={handleChange} />
                    <SelectField label="Job Role" name="jobRole" value={formData.jobRole} options={masterData.occupations} onChange={handleChange} />
                    <InputField label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} />

                    {/* COMBO (TYPABLE) FIELDS FOR LOCATION */}
                    <ComboField label="Country" name="country" value={formData.country} options={masterData.countries} onChange={handleChange} />
                    <ComboField label="State" name="state" value={formData.state} options={dependentStates} onChange={handleChange} disabled={!formData.country} />
                    <ComboField label="City" name="city" value={formData.city} options={dependentCities} onChange={handleChange} disabled={!formData.state} />
                  </div>
                </div>

                <div className="mp-card">
                  <h3 className="mp-card-title">Astrology Details</h3>
                  <div className="mp-form-grid">
                    <SelectField label="Moonsign / Rasi" name="astrologyDetails.moonsign" value={formData.astrologyDetails?.moonsign} options={masterData.moonsigns} onChange={handleChange} />
                    <SelectField label="Star / Nakshatra" name="astrologyDetails.star" value={formData.astrologyDetails?.star} options={masterData.stars} onChange={handleChange} />
                    <InputField label="Pada" name="astrologyDetails.pada" value={formData.astrologyDetails?.pada} onChange={handleChange} />
                    <SelectField label="Mother Tongue" name="astrologyDetails.motherTongue" value={formData.astrologyDetails?.motherTongue} options={masterData.motherTongues} onChange={handleChange} />

                    <div className="mp-input-group">
                      <input type="text" className="mp-input" name="astrologyDetails.timeOfBirth" value={formData.astrologyDetails?.timeOfBirth || ''} onClick={() => setShowTimePicker(true)} readOnly placeholder=" " style={{ cursor: 'pointer' }} />
                      <label className={formData.astrologyDetails?.timeOfBirth ? 'mp-label-active' : ''}>Time of Birth</label>
                    </div>
                    <InputField label="Place of Birth" name="astrologyDetails.placeOfBirth" value={formData.astrologyDetails?.placeOfBirth} onChange={handleChange} />
                  </div>
                </div>

                <div className="mp-card">
                  <h3 className="mp-card-title">Family Details</h3>
                  <div className="mp-form-grid">
                    <InputField label="Father's Name" name="familyDetails.fatherName" value={formData.familyDetails?.fatherName} onChange={handleChange} />
                    <SelectField label="Father's Occ." name="familyDetails.fatherOccupation" value={formData.familyDetails?.fatherOccupation} options={masterData.occupations} onChange={handleChange} />
                    <InputField label="Mother's Name" name="familyDetails.motherName" value={formData.familyDetails?.motherName} onChange={handleChange} />
                    <SelectField label="Mother's Occ." name="familyDetails.motherOccupation" value={formData.familyDetails?.motherOccupation} options={masterData.occupations} onChange={handleChange} />

                    <SelectField label="Total Brothers" name="familyDetails.noOfBrothers" value={formData.familyDetails?.noOfBrothers} options={countOptions} onChange={handleChange} />
                    <SelectField label="Brothers Married" name="familyDetails.noOfBrothersMarried" value={formData.familyDetails?.noOfBrothersMarried} options={countOptions} onChange={handleChange} />
                    <SelectField label="Total Sisters" name="familyDetails.noOfSisters" value={formData.familyDetails?.noOfSisters} options={countOptions} onChange={handleChange} />
                    <SelectField label="Sisters Married" name="familyDetails.noOfSistersMarried" value={formData.familyDetails?.noOfSistersMarried} options={countOptions} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="mp-form-actions">
                  <button type="button" className="mp-btn mp-btn-ghost" onClick={() => {
                    setIsEditing(false); setNewPhotos([]); setExistingPhotos(user.photos || []); 
                  }}>Cancel</button>
                  <button type="submit" className="mp-btn mp-btn-primary">Save Changes</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MyProfile;

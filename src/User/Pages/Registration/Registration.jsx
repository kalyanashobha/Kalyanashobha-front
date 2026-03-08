import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import toast, { Toaster } from 'react-hot-toast'; 
import SignatureCanvas from 'react-signature-canvas'; 
import PhoneInput from 'react-phone-input-2'; 
import 'react-phone-input-2/lib/style.css'; 
import './Registration.css';
import Navbar from "../../Components/Navbar.jsx";

// --- FALLBACK STATIC DATA ---
const FALLBACK_COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "UAE"];
const FALLBACK_STATES = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi NCR"];
const FALLBACK_CITIES = ["Hyderabad", "Visakhapatnam", "Vijayawada", "Bangalore", "Chennai", "Warangal", "Pune"];
const FALLBACK_HEIGHTS = ["5ft 0in (152cm)", "5ft 1in (154cm)", "5ft 2in (157cm)", "5ft 3in (160cm)", "5ft 4in (162cm)", "5ft 5in (165cm)", "5ft 6in (167cm)"];
const FALLBACK_INCOMES = ["INR 0 - 1 Lakh", "INR 1 Lakh - 2 Lakh", "INR 2 Lakh - 4 Lakh", "INR 4 Lakh - 7 Lakh", "INR 7 Lakh - 10 Lakh", "INR 10 Lakh - 15 Lakh"];
const FALLBACK_PROFESSIONS = ["Software Engineer", "Business / Entrepreneur", "Doctor", "Civil Engineer", "Govt Employee", "Not Working"];
const FALLBACK_EDUCATIONS = ["B.Tech / B.E.", "M.Tech / M.E.", "BCA", "MCA", "B.Sc", "B.Com", "MBA", "MBBS"];
const FALLBACK_MARITAL = ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"];
const FALLBACK_DIET = ["Veg", "Non-Veg", "Eggetarian"];
const FALLBACK_SECTOR = ["Private", "Govt", "Business", "Self-Employed"];

// --- UTILITY FUNCTIONS ---
const formatHeight = (val) => {
  if (!val) return val;
  const strVal = val.toString();
  
  // If the string already contains "ft", assume it's correctly formatted and return as is
  if (strVal.toLowerCase().includes('ft')) return strVal;
  
  // Extract the numeric value (cm)
  const cm = parseInt(strVal.replace(/\D/g, ''), 10);
  if (isNaN(cm) || cm <= 0) return strVal;
  
  // Convert to inches
  const totalInches = Math.round(cm / 2.54);
  let feet = Math.floor(totalInches / 12);
  let inches = totalInches % 12;
  
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  
  return `${feet}ft ${inches}in (${cm}cm)`;
};

// --- UI ICONS ---
const UI_Icons = {
  ChevronDown: () => <svg className="reg-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
};

// --- STEP HEADER ICONS ---
const HeaderIcons = {
    User: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    IdCard: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><circle cx="8" cy="10" r="3"></circle><line x1="14" y1="9" x2="20" y2="9"></line><line x1="14" y1="13" x2="20" y2="13"></line><line x1="5" y1="17" x2="11" y2="17"></line></svg>,
    Users: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Shield: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>,
    MapPin: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Heart: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Book: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    Briefcase: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
    Pen: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
};

// Standard Dropdown (Only for Strict DB Enum Fields)
const KsSelect = ({ label, name, value, onChange, options, error, placeholder = "Select" }) => (
  <div className={`reg-input-block reg-stagger ${error ? 'reg-error-state' : ''}`}>
    <label className="reg-label">{label}</label>
    <div className="reg-select-box">
      <select name={name} value={value} onChange={onChange} className="reg-control">
        <option value="">{placeholder}</option>
        {options?.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.name}>
            {typeof opt === 'string' ? opt : opt.name}
          </option>
        ))}
      </select>
      <UI_Icons.ChevronDown />
    </div>
    {error && <span className="reg-error-text">{error}</span>}
  </div>
);

// Searchable & Typable Combobox
const KsComboInput = ({ label, name, value, onChange, options, error, placeholder = "Type or select..." }) => {
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
    onChange({ target: { name, type: 'text', value: val } });
    setIsOpen(false);
  };

  return (
    <div 
      className={`reg-input-block reg-stagger ${error ? 'reg-error-state' : ''}`} 
      ref={wrapperRef}
      style={{ position: 'relative', zIndex: isOpen ? 1000 : 1 }} 
    >
      <label className="reg-label">{label}</label>
      <div className="reg-select-box" style={{ position: 'relative' }}>
        <input 
          type="text" 
          name={name} 
          value={value} 
          onChange={handleInputChange} 
          onFocus={() => { setIsOpen(true); setFiltered(options || []); }}
          placeholder={placeholder} 
          className="reg-control" 
          autoComplete="off"
        />
        {/* Adjusted icon styling for perfect vertical centering */}
        <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center' }} onClick={() => setIsOpen(!isOpen)}>
          <UI_Icons.ChevronDown />
        </div>
        
        {isOpen && filtered && filtered.length > 0 && (
          <ul style={{
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            left: 0, 
            right: 0, 
            backgroundColor: '#ffffff', 
            border: '1px solid #E2E8F0', 
            borderRadius: '12px',
            maxHeight: '220px', 
            overflowY: 'auto', 
            zIndex: 1000, 
            padding: '6px', 
            margin: 0,
            listStyle: 'none', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          }}>
            {filtered.map((opt, idx) => {
              const text = typeof opt === 'string' ? opt : opt.name;
              return (
                <li key={idx} 
                    onClick={() => handleSelect(text)}
                    style={{ 
                      padding: '12px 16px', 
                      cursor: 'pointer', 
                      borderRadius: '8px',
                      color: '#1F2937', 
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.backgroundColor = '#F1F5F9'; 
                      e.target.style.color = '#D32F2F'; 
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.backgroundColor = 'transparent'; 
                      e.target.style.color = '#1F2937'; 
                    }}
                >
                  {text}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {error && <span className="reg-error-text">{error}</span>}
    </div>
  );
};

const KsInput = ({ label, name, type="text", placeholder, value, onChange, error, autoComplete }) => (
  <div className={`reg-input-block reg-stagger ${error ? 'reg-error-state' : ''}`}>
    <label className="reg-label">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="reg-control" />
    {error && <span className="reg-error-text">{error}</span>}
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [animDirection, setAnimDirection] = useState('reg-slide-fwd');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('refId');
  const refName = searchParams.get('refName');

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]); 
  
  const [dynamicOptions, setDynamicOptions] = useState({
    Country: FALLBACK_COUNTRIES,
    State: FALLBACK_STATES,
    City: FALLBACK_CITIES,
    MaritalStatus: FALLBACK_MARITAL,
    Height: FALLBACK_HEIGHTS,
    Diet: FALLBACK_DIET,
    Education: FALLBACK_EDUCATIONS,
    Income: FALLBACK_INCOMES,
    Sector: FALLBACK_SECTOR,
    Designation: FALLBACK_PROFESSIONS
  });

  const sigRef = useRef(null); 
  const dobMonthRef = useRef(null);
  const dobYearRef = useRef(null);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    profileFor: 'Myself', gender: 'Male', firstName: '', lastName: '',
    dobDay: '', dobMonth: '', dobYear: '', community: '', country: '',
    email: '', password: '', mobileNumber: '', state: '', city: '', subCommunity: '',
    maritalStatus: '', height: '', diet: '', gothra: '', residentsIn: 'Own',
    highestQualification: '', college: '', annualIncome: '', workWith: '', workAs: '', companyName: '', nri: 'No'
  });

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch('https://kalyanashobha-back.vercel.app/api/public/get-all-communities');
        const data = await response.json();
        if (data.success) setMasterCommunities(data.data);
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };

    const fetchIndependentData = async () => {
      const categories = [
        'Country', 'State', 'City', 'MaritalStatus', 'Height', 
        'Diet', 'Education', 'Income', 'Sector', 'Designation'
      ];
      
      const newOptions = { ...dynamicOptions };
      
      await Promise.all(categories.map(async (category) => {
        try {
          const res = await fetch(`https://kalyanashobha-back.vercel.app/api/public/master-data/${category}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            // Specifically format the Height category
            if (category === 'Height') {
               newOptions[category] = json.data.map(item => formatHeight(item.name));
            } else {
               newOptions[category] = json.data.map(item => item.name);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch master data for ${category}`);
        }
      }));
      
      setDynamicOptions(newOptions);
    };

    fetchCommunities();
    fetchIndependentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommunityChange = (e) => {
    const selectedComm = e.target.value;
    setFormData({ ...formData, community: selectedComm, subCommunity: '' }); 
    
    const found = masterCommunities.find(c => c.name.toLowerCase() === selectedComm.toLowerCase());
    if (found) {
      setAvailableSubCommunities(found.subCommunities || []);
    } else {
      setAvailableSubCommunities([]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'community') {
      handleCommunityChange(e);
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });

    if (name === 'dobDay' && value.length === 2) dobMonthRef.current?.focus();
    if (name === 'dobMonth' && value.length === 2) dobYearRef.current?.focus();
  };

  const selectOption = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const clearSignature = () => sigRef.current.clear();

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  }

  const validateStep = (currentStep) => {
    let newErrors = {};
    let isValid = true;
    const require = (field, msg = "This field is required") => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = msg;
        isValid = false;
      }
    };

    switch (currentStep) {
      case 1: require("profileFor"); require("gender"); break;
      case 2: require("firstName"); require("lastName"); require("dobDay"); require("dobMonth"); require("dobYear"); break;
      case 3: require("community"); require("subCommunity"); require("country"); break;
      case 4: 
        require("email");
        if (formData.email) {
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Please enter a valid email";
                isValid = false;
            } else {
                const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
                const emailDomain = formData.email.split('@')[1].toLowerCase();
                if (!allowedDomains.includes(emailDomain)) {
                    newErrors.email = "Please use a standard provider (@gmail, @yahoo, @outlook)";
                    isValid = false;
                }
            }
        }
        require("password");
        if(formData.password && formData.password.length < 6) { newErrors.password = "Minimum 6 characters required"; isValid = false; }
        
        require("mobileNumber");
        if(formData.mobileNumber && formData.mobileNumber.length < 10) { 
            newErrors.mobileNumber = "Please enter a valid mobile number"; 
            isValid = false; 
        }
        break;
      case 5: require("state"); require("city"); break;
      case 6: require("maritalStatus"); require("height"); require("diet"); require("gothra"); require("residentsIn"); break;
      case 7: require("highestQualification"); require("college"); break;
      case 8: require("annualIncome"); require("workWith"); require("workAs"); require("companyName"); require("nri"); break;
      case 9:
        if (sigRef.current.isEmpty()) { toast.error("Please provide your signature."); isValid = false; }
        if (!termsAccepted) { toast.error("Please accept the Terms & Conditions."); isValid = false; }
        break;
      default: break;
    }
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setAnimDirection('reg-slide-fwd');
      setStep(step + 1);
    }
  };
  const prevStep = () => {
    setAnimDirection('reg-slide-bck');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateStep(9)) return;

    setLoading(true);
    const toastId = toast.loading("Processing profile setup..."); 

    try {
      const dobDate = new Date(`${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`);
      const signatureDataURL = sigRef.current.toDataURL("image/png");
      const signatureFile = dataURLtoFile(signatureDataURL, "signature.png");

      const data = new FormData();
      
      // 1. Basic Fields
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobileNumber', formData.mobileNumber);
      data.append('profileFor', formData.profileFor);
      data.append('gender', formData.gender);
      data.append('dob', dobDate.toISOString());
      data.append('religion', 'Hindu'); 
      data.append('maritalStatus', formData.maritalStatus);
      if(formData.diet) data.append('diet', formData.diet);
      if(formData.residentsIn) data.append('residentsIn', formData.residentsIn);
      
      // Extracts the raw CM value safely because we know it ends in "cm)"
      const heightVal = parseInt(formData.height ? formData.height.toString().match(/\d+/g)?.pop() || 0 : 0);
      data.append('height', heightVal);
      
      if(formData.college) data.append('collegeName', formData.college);

      let backendWorkType = formData.workWith;
      if (backendWorkType.includes('Private')) backendWorkType = 'Private';
      else if (backendWorkType.includes('Govt') || backendWorkType.includes('Government')) backendWorkType = 'Govt';
      else if (backendWorkType.includes('Business')) backendWorkType = 'Business';
      else if (backendWorkType.includes('Self')) backendWorkType = 'Self-Employed';

      if (backendWorkType) data.append('workType', backendWorkType);
      if(formData.companyName) data.append('companyName', formData.companyName);
      if(formData.annualIncome) data.append('annualIncome', formData.annualIncome);
      if(formData.nri) data.append('nri', formData.nri);

      // 2. The 8 specific fields requested for Master Data checks
      data.append('community', formData.community);
      if(formData.subCommunity) {
          data.append('subCommunity', formData.subCommunity);
          data.append('caste', formData.subCommunity);
      }
      data.append('country', formData.country);
      data.append('state', formData.state);
      data.append('city', formData.city);
      if(formData.gothra) data.append('gothra', formData.gothra);
      if(formData.highestQualification) data.append('highestQualification', formData.highestQualification); 
      if(formData.workAs) data.append('jobRole', formData.workAs); 

      if (refId) { 
          data.append('referredByAgentId', refId); 
          data.append('referralType', "link"); 
      }
      if (refName) data.append('referredByAgentName', refName);
      data.append('digitalSignature', signatureFile);

      const response = await fetch('https://kalyanashobha-back.vercel.app/api/auth/register', {
        method: 'POST', body: data, 
      });

      const resText = await response.text();
      let resData;
      try { resData = JSON.parse(resText); } catch (jsonError) { throw new Error(`Server Error (${response.status})`); }

      if (!response.ok) throw new Error(resData.message || "Request failed");

      if (resData.success) {
        toast.success("Welcome to KalyanaShobha!", { id: toastId });
        setTimeout(() => { navigate('/login', { state: { savedEmail: formData.email } }); }, 1500);
      } else {
        throw new Error(resData.message || "Registration Failed");
      }
    } catch (error) {
      let displayMessage = error.message || "Connection Failed";

      if (displayMessage.includes('E11000') || displayMessage.includes('duplicate key')) {
        if (displayMessage.includes('mobileNumber')) {
          displayMessage = "This mobile number is already registered. Please use another number.";
        } else if (displayMessage.includes('email')) {
          displayMessage = "This email is already registered. Please use another email.";
        } else {
          displayMessage = "An account with these details already exists. Please try logging in.";
        }
      }

      toast.error(displayMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (currentStep) => {
    const iconMap = {
        1: { Component: HeaderIcons.User, color: 'reg-icon-blue' },
        2: { Component: HeaderIcons.IdCard, color: 'reg-icon-purple' },
        3: { Component: HeaderIcons.Users, color: 'reg-icon-green' },
        4: { Component: HeaderIcons.Shield, color: 'reg-icon-gold' },
        5: { Component: HeaderIcons.MapPin, color: 'reg-icon-red' },
        6: { Component: HeaderIcons.Heart, color: 'reg-icon-pink' },
        7: { Component: HeaderIcons.Book, color: 'reg-icon-indigo' },
        8: { Component: HeaderIcons.Briefcase, color: 'reg-icon-teal' },
        9: { Component: HeaderIcons.Pen, color: 'reg-icon-dark' }
    };
    const { Component, color } = iconMap[currentStep] || iconMap[1];
    
    return (
        <div className={`reg-header-icon reg-stagger ${color}`}>
            <Component />
        </div>
    );
  };

  const renderStep = () => {
    return (
        <div key={step} className={`reg-form-body ${animDirection}`}>
            
            <div className="reg-title-area">
                {renderStepIcon(step)}
                <h2 className="reg-step-heading reg-stagger">
                    {step === 1 && "Create Account"}
                    {step === 2 && "Basic Details"}
                    {step === 3 && "Community Details"}
                    {step === 4 && "Contact & Security"}
                    {step === 5 && "Current Location"}
                    {step === 6 && "Personal Details"}
                    {step === 7 && "Education"}
                    {step === 8 && "Career & Lifestyle"}
                    {step === 9 && "Identity Verification"}
                </h2>
                {step === 1 && <p className="reg-step-sub reg-stagger">Let's start your journey to finding happiness.</p>}
                {step === 4 && <p className="reg-step-sub reg-stagger">An active email and phone number are required.</p>}
            </div>

            {step === 1 && (
                <>
                <h3 className="reg-group-title reg-stagger">This profile is for</h3>
                <div className="reg-grid-options reg-stagger">
                    {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Friend'].map((opt) => (
                    <button key={opt} type="button" className={`reg-opt-btn ${formData.profileFor === opt ? 'active' : ''}`} onClick={() => selectOption('profileFor', opt)}>{opt}</button>
                    ))}
                </div>
                <h3 className="reg-group-title reg-stagger">Gender</h3>
                <div className="reg-grid-options reg-stagger">
                    {['Male', 'Female'].map((gen) => (
                    <button key={gen} type="button" className={`reg-opt-btn ${formData.gender === gen ? 'active' : ''}`} onClick={() => selectOption('gender', gen)}>{gen}</button>
                    ))}
                </div>
                </>
            )}

            {step === 2 && (
                <>
                <KsInput label="Full Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Enter your full name" />
                <KsInput label="Surname" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Enter your Surname" />
                <div className={`reg-input-block reg-stagger ${errors.dobDay ? 'reg-error-state' : ''}`}>
                   <label className="reg-label">Date of Birth</label>
                   <div className="reg-dob-group">
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobDay" placeholder="DD" value={formData.dobDay} onChange={handleChange} className="reg-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobMonth" placeholder="MM" value={formData.dobMonth} onChange={handleChange} ref={dobMonthRef} className="reg-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="4" name="dobYear" placeholder="YYYY" value={formData.dobYear} onChange={handleChange} ref={dobYearRef} className="reg-dob-input" />
                   </div>
                   {(errors.dobDay || errors.dobMonth || errors.dobYear) && <span className="reg-error-text">Please enter a valid Date of Birth</span>}
                </div>
                </>
            )}

            {step === 3 && (
                <>
                <KsComboInput label="Community" name="community" value={formData.community} onChange={handleChange} error={errors.community} options={masterCommunities} />
                <KsComboInput label="Sub-Community / Caste" name="subCommunity" value={formData.subCommunity} onChange={handleChange} error={errors.subCommunity} options={availableSubCommunities} />
                <KsComboInput label="Country" name="country" value={formData.country} onChange={handleChange} error={errors.country} options={dynamicOptions.Country} />
                </>
            )}

            {step === 4 && (
                <>
                <KsInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="name@example.com" />
                
                <div className={`reg-input-block reg-stagger ${errors.password ? 'reg-error-state' : ''}`}>
                    <label className="reg-label">Secure Password</label>
                    <div className="reg-password-wrap">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="reg-control" />
                        <button type="button" className="reg-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <UI_Icons.EyeOff /> : <UI_Icons.Eye />}
                        </button>
                    </div>
                    {errors.password && <span className="reg-error-text">{errors.password}</span>}
                </div>

                <div className={`reg-input-block reg-stagger ${errors.mobileNumber ? 'reg-error-state' : ''}`}>
                    <label className="reg-label">Mobile Number</label>
                    <PhoneInput
                        country={'in'} 
                        value={formData.mobileNumber}
                        onChange={(phone) => {
                            setFormData({ ...formData, mobileNumber: phone });
                            if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
                        }}
                        inputProps={{
                            name: 'mobileNumber',
                            required: true,
                        }}
                        inputStyle={{ 
                            width: '100%', 
                            height: '46px', 
                            fontSize: '1rem', 
                            paddingLeft: '48px', 
                            borderRadius: '8px', 
                            border: '1px solid #E2E8F0',
                            color: '#1F2937',
                            backgroundColor: '#F8FAFC'
                        }}
                        buttonStyle={{ 
                            borderRadius: '8px 0 0 8px', 
                            border: '1px solid #E2E8F0', 
                            backgroundColor: '#F8FAFC',
                            padding: '2px'
                        }}
                    />
                    {errors.mobileNumber && <span className="reg-error-text">{errors.mobileNumber}</span>}
                </div>
                </>
            )}

            {step === 5 && (
                <>
                <KsComboInput label="State / Province" name="state" value={formData.state} onChange={handleChange} error={errors.state} options={dynamicOptions.State} />
                <KsComboInput label="City / District" name="city" value={formData.city} onChange={handleChange} error={errors.city} options={dynamicOptions.City} />
                </>
            )}

            {step === 6 && (
                <>
                <KsComboInput label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} error={errors.maritalStatus} options={dynamicOptions.MaritalStatus} />
                <KsComboInput label="Height" name="height" value={formData.height} onChange={handleChange} error={errors.height} options={dynamicOptions.Height} />
                <KsSelect label="Dietary Preference" name="diet" value={formData.diet} onChange={handleChange} error={errors.diet} options={dynamicOptions.Diet} />
                <KsInput label="Gothra" name="gothra" value={formData.gothra} onChange={handleChange} error={errors.gothra} placeholder="Enter your Gothra" />
                <KsSelect label="Residents In" name="residentsIn" value={formData.residentsIn} onChange={handleChange} error={errors.residentsIn} options={['Own', 'Rent']} />
                </>
            )}

            {step === 7 && (
                <>
                <KsComboInput label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} error={errors.highestQualification} options={dynamicOptions.Education} />
                <KsInput label="College / University" name="college" value={formData.college} onChange={handleChange} error={errors.college} placeholder="e.g. IIT Bombay" />
                </>
            )}

            {step === 8 && (
                <>
                <KsComboInput label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} error={errors.annualIncome} options={dynamicOptions.Income} />
                <KsSelect label="Employment Sector" name="workWith" value={formData.workWith} onChange={handleChange} error={errors.workWith} options={dynamicOptions.Sector} />
                <KsComboInput label="Current Designation" name="workAs" value={formData.workAs} onChange={handleChange} error={errors.workAs} options={dynamicOptions.Designation} />
                <KsInput label="Organization Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} placeholder="e.g. Google, TCS" />
                <KsSelect label="NRI Status" name="nri" value={formData.nri} onChange={handleChange} error={errors.nri} options={['Yes', 'No']} />
                </>
            )}

            {step === 9 && (
                <>
                <p className="reg-stagger reg-sig-instruct">Please provide your digital signature below to accept the Terms & Conditions.</p>
                <div className="reg-sig-wrapper reg-stagger">
                    <SignatureCanvas 
                        ref={sigRef}
                        penColor="#1A1A1A"
                        canvasProps={{ width: 340, height: 160, className: 'reg-sig-canvas' }}
                        backgroundColor="#FFFFFF"
                    />
                </div>
                <button className="reg-clear-sig reg-stagger" type="button" onClick={clearSignature}>
                    Clear Signature
                </button>
                <div className="reg-divider reg-stagger"></div>
                <div className="reg-terms-wrap reg-stagger">
                    <input type="checkbox" id="reg-terms" className="reg-checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                   <label htmlFor="reg-terms" className="reg-terms-label">
                      <span>I declare that the information provided is accurate and I accept the <span className="reg-highlight-red">Terms & Conditions</span> of KalyanaShobha.</span>
                   </label>
                </div>
                </>
            )}
        </div>
    );
  };

  return (
    <>
      <Navbar/>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1F2937', color: '#fff', borderRadius: '10px' } }} />
      
      <div className="reg-main-wrapper">
          <div className="reg-auth-card">
            
            <div className="reg-progress-header">
               <div className="reg-progress-text">Step {step} of 9</div>
               <div className="reg-progress-bar-container">
                  <div className="reg-progress-fill" style={{ width: `${(step / 9) * 100}%` }}></div>
               </div>
            </div>

            <div className="reg-form-content">
              <form onSubmit={step === 9 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                
                {renderStep()}
                
                <div className="reg-action-footer">
                  {step > 1 ? (
                    <button type="button" className="reg-btn reg-btn-secondary" onClick={prevStep} disabled={loading}>Back</button>
                  ) : (
                    <div></div> 
                  )}

                  {step === 9 ? (
                     <button type="submit" className="reg-btn reg-btn-primary" disabled={loading}>
                       {loading ? 'Submitting...' : 'Complete Profile'} <UI_Icons.ArrowRight />
                     </button>
                  ) : (
                     <button type="button" className="reg-btn reg-btn-primary" onClick={nextStep}>
                       Continue <UI_Icons.ArrowRight />
                     </button>
                  )}
                </div>
              </form>
            </div>

          </div>
      </div>
    </>
  );
};

export default Register;

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

  if (strVal.toLowerCase().includes('ft')) return strVal;

  const cm = parseInt(strVal.replace(/\D/g, ''), 10);
  if (isNaN(cm) || cm <= 0) return strVal;

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
  ChevronDown: () => <svg className="ks-reg-new-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Info: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
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
    Pen: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>,
    Home: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
};

// Standard Dropdown (Only for Strict DB Enum Fields)
const KsSelect = ({ label, name, value, onChange, options, error, placeholder = "Select" }) => (
  <div className={`ks-reg-new-input-block ks-reg-new-stagger ${error ? 'ks-reg-new-error-state' : ''}`}>
    <label className="ks-reg-new-label">{label}</label>
    <div className="ks-reg-new-select-box">
      <select name={name} value={value} onChange={onChange} className="ks-reg-new-control">
        <option value="">{placeholder}</option>
        {options?.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.name}>
            {typeof opt === 'string' ? opt : opt.name}
          </option>
        ))}
      </select>
      <UI_Icons.ChevronDown />
    </div>
    {error && <span className="ks-reg-new-error-text">{error}</span>}
  </div>
);

// Searchable & Typable Combobox
const KsComboInput = ({ label, name, value, onChange, options, error, placeholder = "Type or select...", disabled, onClickWrapper }) => {
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
      className={`ks-reg-new-input-block ks-reg-new-stagger ${error ? 'ks-reg-new-error-state' : ''}`} 
      ref={wrapperRef}
      style={{ position: 'relative', zIndex: isOpen ? 1000 : 1 }} 
      onClick={onClickWrapper}
    >
      <label className="ks-reg-new-label" style={{ opacity: disabled ? 0.6 : 1 }}>{label}</label>
      <div className="ks-reg-new-select-box" style={{ position: 'relative', opacity: disabled ? 0.6 : 1 }}>
        <input 
          type="text" 
          name={name} 
          value={value} 
          onChange={handleInputChange} 
          onFocus={() => { if(!disabled) { setIsOpen(true); setFiltered(options || []); } }}
          placeholder={placeholder} 
          className="ks-reg-new-control" 
          autoComplete="off"
          disabled={disabled}
          style={{ cursor: disabled ? 'not-allowed' : 'text' }}
        />
        <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: disabled ? 'not-allowed' : 'pointer', zIndex: 2, display: 'flex', alignItems: 'center' }} onClick={() => { if(!disabled) setIsOpen(!isOpen); }}>
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
      {error && <span className="ks-reg-new-error-text">{error}</span>}
    </div>
  );
};

const KsInput = ({ label, name, type="text", placeholder, value, onChange, error, autoComplete }) => (
  <div className={`ks-reg-new-input-block ks-reg-new-stagger ${error ? 'ks-reg-new-error-state' : ''}`}>
    <label className="ks-reg-new-label">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="ks-reg-new-control" />
    {error && <span className="ks-reg-new-error-text">{error}</span>}
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const stepRef = useRef(step); 

  const [animDirection, setAnimDirection] = useState('ks-reg-new-slide-fwd');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('refId');
  const refName = searchParams.get('refName');

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]); 

  const [filterStates, setFilterStates] = useState([]);
  const [filterCities, setFilterCities] = useState([]);

  const [dynamicOptions, setDynamicOptions] = useState({
    Country: FALLBACK_COUNTRIES,
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
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const handlePopState = () => {
      if (stepRef.current > 1) {
        setAnimDirection('ks-reg-new-slide-bck');
        setStep((prev) => prev - 1);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => { window.removeEventListener('popstate', handlePopState); };
  }, []);

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
        'Country', 'MaritalStatus', 'Height', 
        'Diet', 'Education', 'Income', 'Sector', 'Designation'
      ];

      const newOptions = { ...dynamicOptions };

      await Promise.all(categories.map(async (category) => {
        try {
          const res = await fetch(`https://kalyanashobha-back.vercel.app/api/public/master-data/${category}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
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
    setFormData(prev => ({ ...prev, community: selectedComm, subCommunity: '' })); 

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

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (name === 'community') {
      handleCommunityChange(e);
    } else if (name === 'country') {
      setFormData(prev => ({ ...prev, country: val, state: '', city: '' }));
      setFilterStates([]);
      setFilterCities([]);

      if (val) {
         try {
           const res = await fetch(`https://kalyanashobha-back.vercel.app/api/public/master-data/State?parent=${val}`);
           const json = await res.json();
           if (json.success) setFilterStates(json.data.map(d => d.name));
         } catch(e) { setFilterStates([]); }
      }
    } else if (name === 'state') {
      setFormData(prev => ({ ...prev, state: val, city: '' }));
      setFilterCities([]);

      if (val) {
         try {
           const res = await fetch(`https://kalyanashobha-back.vercel.app/api/public/master-data/City?parent=${val}`);
           const json = await res.json();
           if (json.success) setFilterCities(json.data.map(d => d.name));
         } catch(e) { setFilterCities([]); }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'dobDay' && val.length === 2) dobMonthRef.current?.focus();
    if (name === 'dobMonth' && val.length === 2) dobYearRef.current?.focus();
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
      case 1: 
        require("profileFor"); require("gender"); 
        break;
      case 2: 
        require("firstName"); require("lastName"); require("dobDay"); require("dobMonth"); require("dobYear"); 
        if (formData.dobDay && formData.dobMonth && formData.dobYear) {
            const dobDate = new Date(`${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }

            if (formData.gender === 'Male' && age < 21) {
                newErrors.dobYear = "Men must be at least 21 years old.";
                isValid = false;
            } else if (formData.gender === 'Female' && age < 18) {
                newErrors.dobYear = "Women must be at least 18 years old.";
                isValid = false;
            }
        }
        break;
      case 3: 
        require("community"); require("subCommunity"); require("country"); 
        break;
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
      case 5: 
        require("state"); require("city"); 
        break;
      case 6: 
        require("maritalStatus"); require("height"); require("diet"); 
        break;
      case 7: 
        require("gothra"); require("residentsIn"); 
        break;
      case 8: 
        require("highestQualification"); require("college"); 
        break;
      case 9: 
        require("workWith"); require("workAs"); require("companyName"); 
        break;
      case 10: 
        require("annualIncome"); require("nri"); 
        break;
      case 11:
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
      window.history.pushState(null, '', window.location.href);
      setAnimDirection('ks-reg-new-slide-fwd');
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    window.history.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateStep(11)) return;

    setLoading(true);
    const toastId = toast.loading("Processing profile setup..."); 

    try {
      const dobDate = new Date(`${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`);

      const today = new Date();
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) calculatedAge--;

      const signatureDataURL = sigRef.current.toDataURL("image/png");
      const signatureFile = dataURLtoFile(signatureDataURL, "signature.png");

      const data = new FormData();

      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobileNumber', formData.mobileNumber);
      data.append('profileFor', formData.profileFor);
      data.append('gender', formData.gender);
      data.append('dob', dobDate.toISOString());
      data.append('age', calculatedAge); 
      data.append('religion', 'Hindu'); 
      data.append('maritalStatus', formData.maritalStatus);

      if(formData.diet) data.append('diet', formData.diet);
      if(formData.residentsIn) data.append('residentsIn', formData.residentsIn);

      const heightVal = parseInt(formData.height ? formData.height.toString().match(/\d+/g)?.pop() || 0 : 0);
      data.append('height', heightVal);

      if(formData.college) data.append('collegeName', formData.college);
      if (formData.workWith) data.append('workType', formData.workWith);
      if(formData.companyName) data.append('companyName', formData.companyName);
      if(formData.annualIncome) data.append('annualIncome', formData.annualIncome);

      data.append('nri', formData.nri);

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
        1: { Component: HeaderIcons.User, color: 'ks-reg-new-icon-blue' },
        2: { Component: HeaderIcons.IdCard, color: 'ks-reg-new-icon-purple' },
        3: { Component: HeaderIcons.Users, color: 'ks-reg-new-icon-green' },
        4: { Component: HeaderIcons.Shield, color: 'ks-reg-new-icon-gold' },
        5: { Component: HeaderIcons.MapPin, color: 'ks-reg-new-icon-red' },
        6: { Component: HeaderIcons.Heart, color: 'ks-reg-new-icon-pink' },
        7: { Component: HeaderIcons.Home, color: 'ks-reg-new-icon-teal' },
        8: { Component: HeaderIcons.Book, color: 'ks-reg-new-icon-indigo' },
        9: { Component: HeaderIcons.Briefcase, color: 'ks-reg-new-icon-teal' },
        10: { Component: HeaderIcons.Briefcase, color: 'ks-reg-new-icon-gold' },
        11: { Component: HeaderIcons.Pen, color: 'ks-reg-new-icon-dark' }
    };
    const { Component, color } = iconMap[currentStep] || iconMap[1];

    return (
        <div className={`ks-reg-new-header-icon ks-reg-new-stagger ${color}`}>
            <Component />
        </div>
    );
  };

  const renderStep = () => {
    return (
        <div key={step} className={`ks-reg-new-form-body ${animDirection}`}>

            <div className="ks-reg-new-title-area">
                {renderStepIcon(step)}
                <h2 className="ks-reg-new-step-heading ks-reg-new-stagger">
                    {step === 1 && "Create Account"}
                    {step === 2 && "Basic Details"}
                    {step === 3 && "Community Details"}
                    {step === 4 && "Contact & Security"}
                    {step === 5 && "Current Location"}
                    {step === 6 && "Personal Details"}
                    {step === 7 && "Background & Living"}
                    {step === 8 && "Education"}
                    {step === 9 && "Career Details"}
                    {step === 10 && "Income & Status"}
                    {step === 11 && "Identity Verification"}
                </h2>
                {step === 1 && <p className="ks-reg-new-step-sub ks-reg-new-stagger">Let's start your journey to finding happiness.</p>}
                {step === 4 && <p className="ks-reg-new-step-sub ks-reg-new-stagger">An active email and phone number are required.</p>}
            </div>

            {step === 1 && (
                <>
                <h3 className="ks-reg-new-group-title ks-reg-new-stagger">This profile is for</h3>
                <div className="ks-reg-new-grid-options ks-reg-new-stagger">
                    {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Friend'].map((opt) => (
                    <button key={opt} type="button" className={`ks-reg-new-opt-btn ${formData.profileFor === opt ? 'active' : ''}`} onClick={() => selectOption('profileFor', opt)}>{opt}</button>
                    ))}
                </div>
                <h3 className="ks-reg-new-group-title ks-reg-new-stagger">Gender</h3>
                <div className="ks-reg-new-grid-options ks-reg-new-stagger">
                    {['Male', 'Female'].map((gen) => (
                    <button key={gen} type="button" className={`ks-reg-new-opt-btn ${formData.gender === gen ? 'active' : ''}`} onClick={() => selectOption('gender', gen)}>{gen}</button>
                    ))}
                </div>
                </>
            )}

            {step === 2 && (
                <>
                <KsInput label="Full Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Enter your full name" />
                <KsInput label="Surname" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Enter your Surname" />
                <div className={`ks-reg-new-input-block ks-reg-new-stagger ${errors.dobYear ? 'ks-reg-new-error-state' : ''}`}>
                   <label className="ks-reg-new-label">Date of Birth</label>
                   <div className="ks-reg-new-dob-group">
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobDay" placeholder="DD" value={formData.dobDay} onChange={handleChange} className="ks-reg-new-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobMonth" placeholder="MM" value={formData.dobMonth} onChange={handleChange} ref={dobMonthRef} className="ks-reg-new-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="4" name="dobYear" placeholder="YYYY" value={formData.dobYear} onChange={handleChange} ref={dobYearRef} className="ks-reg-new-dob-input" />
                   </div>
                   {errors.dobYear && <span className="ks-reg-new-error-text">{errors.dobYear}</span>}
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

                <div className={`ks-reg-new-input-block ks-reg-new-stagger ${errors.password ? 'ks-reg-new-error-state' : ''}`}>
                    <label className="ks-reg-new-label">Secure Password</label>
                    <div className="ks-reg-new-password-wrap">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="ks-reg-new-control" />
                        <button type="button" className="ks-reg-new-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <UI_Icons.EyeOff /> : <UI_Icons.Eye />}
                        </button>
                    </div>
                    {errors.password && <span className="ks-reg-new-error-text">{errors.password}</span>}
                </div>

                <div className={`ks-reg-new-input-block ks-reg-new-stagger ${errors.mobileNumber ? 'ks-reg-new-error-state' : ''}`}>
                    <label className="ks-reg-new-label">Mobile Number</label>
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
                    {errors.mobileNumber && <span className="ks-reg-new-error-text">{errors.mobileNumber}</span>}
                </div>
                </>
            )}

            {step === 5 && (
                <>
                <KsComboInput 
                  label="State / Province" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  error={errors.state} 
                  options={filterStates} 
                  disabled={!formData.country}
                  onClickWrapper={() => {
                    if (!formData.country) toast("Please select a Country first", { icon: <UI_Icons.Info /> });
                  }}
                />
                <KsComboInput 
                  label="City / District" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  error={errors.city} 
                  options={filterCities} 
                  disabled={!formData.state}
                  onClickWrapper={() => {
                    if (formData.country && !formData.state) toast("Please select a State first", { icon: <UI_Icons.Info /> });
                  }}
                />
                </>
            )}

            {step === 6 && (
                <>
                <KsSelect label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} error={errors.maritalStatus} options={dynamicOptions.MaritalStatus} />
                <KsSelect label="Height" name="height" value={formData.height} onChange={handleChange} error={errors.height} options={dynamicOptions.Height} />
                <KsSelect label="Dietary Preference" name="diet" value={formData.diet} onChange={handleChange} error={errors.diet} options={dynamicOptions.Diet} />
                </>
            )}

            {step === 7 && (
                <>
                <KsInput label="Gothra" name="gothra" value={formData.gothra} onChange={handleChange} error={errors.gothra} placeholder="Enter your Gothra" />
                <KsSelect label="Residents In" name="residentsIn" value={formData.residentsIn} onChange={handleChange} error={errors.residentsIn} options={['Own', 'Rent']} />
                </>
            )}

            {step === 8 && (
                <>
                <KsComboInput label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} error={errors.highestQualification} options={dynamicOptions.Education} />
                <KsInput label="College / University" name="college" value={formData.college} onChange={handleChange} error={errors.college} placeholder="e.g. IIT Bombay" />
                </>
            )}

            {step === 9 && (
                <>
                <KsSelect label="Employment Sector" name="workWith" value={formData.workWith} onChange={handleChange} error={errors.workWith} options={dynamicOptions.Sector} />
                <KsComboInput label="Current Designation" name="workAs" value={formData.workAs} onChange={handleChange} error={errors.workAs} options={dynamicOptions.Designation} />
                <KsInput label="Organization Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} placeholder="e.g. Google, TCS" />
                </>
            )}

            {step === 10 && (
                <>
                <KsSelect label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} error={errors.annualIncome} options={dynamicOptions.Income} />
                <KsSelect label="NRI Status" name="nri" value={formData.nri} onChange={handleChange} error={errors.nri} options={['Yes', 'No']} />
                </>
            )}

            {step === 11 && (
                <>
                <p className="ks-reg-new-stagger ks-reg-new-sig-instruct">Please provide your digital signature below to accept the Terms & Conditions.</p>
                <div className="ks-reg-new-sig-wrapper ks-reg-new-stagger">
                    <SignatureCanvas 
                        ref={sigRef}
                        penColor="#1A1A1A"
                        canvasProps={{ width: 340, height: 160, className: 'ks-reg-new-sig-canvas' }}
                        backgroundColor="#FFFFFF"
                    />
                </div>
                <button className="ks-reg-new-clear-sig ks-reg-new-stagger" type="button" onClick={clearSignature}>
                    Clear Signature
                </button>
                <div className="ks-reg-new-divider ks-reg-new-stagger"></div>
                <div className="ks-reg-new-terms-wrap ks-reg-new-stagger">
                    <input type="checkbox" id="ks-reg-new-terms" className="ks-reg-new-checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                   <label htmlFor="ks-reg-new-terms" className="ks-reg-new-terms-label">
                      <span>
                        I declare that the information provided is accurate and I accept the{' '}
                        <a 
                          href="/terms" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()} 
                          className="ks-reg-new-highlight-red"
                          style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Terms & Conditions
                        </a>{' '}
                        of KalyanaShobha.
                      </span>
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
      <Toaster 
        position="top-center" 
        containerStyle={{ zIndex: 9999999 }} 
        toastOptions={{ style: { background: '#1F2937', color: '#fff', borderRadius: '10px' } }} 
      />

      <div className="ks-reg-new-main-wrapper">
          <div className="ks-reg-new-auth-card">

            <div className="ks-reg-new-progress-header">
               <div className="ks-reg-new-progress-text">Step {step} of 11</div>
               <div className="ks-reg-new-progress-bar-container">
                  <div className="ks-reg-new-progress-fill" style={{ width: `${(step / 11) * 100}%` }}></div>
               </div>
            </div>

            <div className="ks-reg-new-form-content">
              <form onSubmit={step === 11 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

                {renderStep()}

                <div className="ks-reg-new-action-footer">
                  {step > 1 ? (
                    <button type="button" className="ks-reg-new-btn ks-reg-new-btn-secondary" onClick={prevStep} disabled={loading}>Back</button>
                  ) : (
                    <div></div> 
                  )}

                  {step === 11 ? (
                     <button type="submit" className="ks-reg-new-btn ks-reg-new-btn-primary" disabled={loading}>
                       {loading ? 'Submitting...' : 'Complete Profile'} <UI_Icons.ArrowRight />
                     </button>
                  ) : (
                     <button type="button" className="ks-reg-new-btn ks-reg-new-btn-primary" onClick={nextStep}>
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

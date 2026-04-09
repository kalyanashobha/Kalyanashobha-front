import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tag, Image as ImageIcon, X, Loader, ArrowRight, ChevronDown } from "lucide-react"; 
import imageCompression from 'browser-image-compression';
import "./VendorList.css";
import Navbar from "../../Components/Navbar";

// Custom Diamond Icon 
const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <path d="M6 3h12l4 6-10 13L2 9Z"></path>
    <path d="M11 3 8 9l4 13 4-13-3-6"></path>
    <path d="M2 9h20"></path>
  </svg>
);

// --- CUSTOM COMBO FIELD FOR CATEGORY (TYPABLE + DROPDOWN) ---
const ComboField = ({ name, value, options, onChange, placeholder, required }) => {
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
    
    if (!val.trim()) {
      setFiltered(options || []);
    } else {
      setFiltered((options || []).filter(opt => opt.toLowerCase().includes(val)));
    }
  };

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setFiltered(options || []); 
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={() => { setIsOpen(true); setFiltered(options || []); }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        style={{ paddingRight: '35px', width: '100%' }}
      />
      <div
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setFiltered(options || []);
        }}
      >
        <ChevronDown size={16} />
      </div>

      {isOpen && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
          maxHeight: '180px', overflowY: 'auto', zIndex: 1000, padding: '4px', margin: 0,
          listStyle: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          {filtered.length > 0 ? filtered.map((opt, idx) => (
              <li key={idx}
                  onClick={() => handleSelect(opt)}
                  style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '6px', color: '#374151', fontSize: '0.85rem', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {opt}
              </li>
            )) : (
              <li style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
                Type to add custom category
              </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modal & Form State for User Contacting Vendor ---
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  // --- Modal & Form State for "Join as Vendor" ---
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinFormData, setJoinFormData] = useState({
    businessName: "",
    email: "",
    category: "",
    contactNumber: "",
    priceRange: "",
    description: "",
  });
  const [joinFiles, setJoinFiles] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [joinSubmitStatus, setJoinSubmitStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  // Expanded Categories List
  const categories = [
    'Bridal Wear', 'Catering', 'Choreographer', 'Decoration', 
    'Event management', 'Florist', 'Groom Wear', 'Invitation Cards', 
    'Jewellery', 'Makeup', 'Mehendi artists', 'Pandit', 
    'Photography', 'Travel', 'Wedding halls'
  ];

  // Fetch Approved Vendors
  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const config = {};
      if (token) {
        config.headers = { Authorization: token };
      }

      const res = await axios.get("https://kalyanashobha-back.vercel.app/api/user/vendors", config);

      if (res.data.success) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      console.error("Error fetching vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // --- Handlers: User Contacting Vendor ---
  const handleOpenModal = (vendor) => {
    setSelectedVendor(vendor);
    setSubmitStatus({ loading: false, success: false, error: "" });
  };

  const handleCloseModal = () => {
    setSelectedVendor(null);
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: "" });

    try {
      const res = await axios.post("https://kalyanashobha-back.vercel.app/api/user/vendor-lead", {
        vendorId: selectedVendor._id,
        ...formData
      });

      if (res.data.success) {
        setSubmitStatus({ loading: false, success: true, error: "" });
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      }
    } catch (err) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || "Failed to send request. Please try again."
      });
    }
  };

  // --- Handlers: Join as Vendor ---
  const handleOpenJoinModal = () => {
    setShowJoinModal(true);
    setJoinSubmitStatus({ loading: false, success: false, error: "" });
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setJoinFormData({
      businessName: "", email: "", category: "", contactNumber: "", priceRange: "", description: ""
    });
    setJoinFiles([]);
    setIsCompressing(false);
  };

  const handleJoinInputChange = (e) => {
    setJoinFormData({ ...joinFormData, [e.target.name]: e.target.value });
  };

  // FIXED LOGIC: Appends files instead of overwriting
  const handleJoinFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files); 
    if (selectedFiles.length === 0) return;

    // Prevent adding more if already at 2
    if (joinFiles.length >= 2) {
      e.target.value = null; // Reset input
      return;
    }

    // Only take enough files to reach the maximum of 2
    const availableSlots = 2 - joinFiles.length;
    const filesToProcess = selectedFiles.slice(0, availableSlots);

    setIsCompressing(true);
    const compressedImages = [];

    for (let file of filesToProcess) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          alwaysKeepResolution: true
        };
        const compressedFile = await imageCompression(file, options);
        compressedImages.push(compressedFile);
      } catch (error) {
        console.error("Image Compression Error:", error);
        compressedImages.push(file); 
      }
    }

    // Append the new images to the existing ones
    setJoinFiles(prev => [...prev, ...compressedImages]);
    setIsCompressing(false);

    // Reset the input value so the same file can be selected again if needed
    e.target.value = null;
  };

  // Function to clear files if the user makes a mistake
  const handleClearFiles = () => {
    setJoinFiles([]);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinSubmitStatus({ loading: true, success: false, error: "" });

    const data = new FormData();
    data.append("businessName", joinFormData.businessName);
    data.append("email", joinFormData.email);
    data.append("category", joinFormData.category);
    data.append("contactNumber", joinFormData.contactNumber);
    data.append("priceRange", joinFormData.priceRange);
    data.append("description", joinFormData.description);

    for (let i = 0; i < joinFiles.length; i++) {
      data.append("images", joinFiles[i]);
    }

    try {
      const res = await axios.post("https://kalyanashobha-back.vercel.app/api/vendor/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setJoinSubmitStatus({ loading: false, success: true, error: "" });
        setTimeout(() => {
          handleCloseJoinModal();
        }, 3000);
      }
    } catch (err) {
      setJoinSubmitStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || "Registration failed. Please try again."
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="v-premium-container">

        {/* --- DARK PREMIUM BANNER --- */}
        <div className="v-dark-banner">
          <div className="v-banner-left">
            <div className="v-banner-icon-box">
              <DiamondIcon />
            </div>
            <div className="v-banner-text-col">
              <h3>Join as a Vendor</h3>
              <p>Grow your business & connect with thousands of couples.</p>
            </div>
          </div>
          <button className="v-banner-action-btn" onClick={handleOpenJoinModal}>
            Register Now <ArrowRight className="v-btn-icon" />
          </button>
        </div>

        <div className="v-premium-header">
          <h1>Premium Wedding Vendors</h1>
          <p>Curated services to make your special day perfect.</p>
        </div>

        <div className="v-premium-grid">
          {loading ? (
             [1, 2, 3, 4].map(n => (
               <div key={n} className="v-premium-card v-skeleton-wrapper">
                 <div className="v-skeleton-img shimmer"></div>
                 <div className="v-card-content">
                   <div className="v-skeleton-title shimmer"></div>
                   <div className="v-skeleton-text shimmer"></div>
                   <div className="v-skeleton-text short shimmer"></div>
                   <div className="v-skeleton-btn shimmer"></div>
                 </div>
               </div>
             ))
          ) : vendors.length === 0 ? (
            <div className="v-no-data">
              <h3>No Vendors Found</h3>
              <p>Check back later for new listings.</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor._id} className="v-premium-card">
                <div className="v-card-image">
                  {vendor.images && vendor.images.length > 0 ? (
                    <img src={vendor.images[0]} alt={vendor.businessName} />
                  ) : (
                    <div className="v-placeholder"><ImageIcon size={32} /></div>
                  )}
                  <span className="v-badge-category">{vendor.category}</span>
                </div>

                <div className="v-card-content">
                  <h3 className="v-card-title">{vendor.businessName}</h3>
                  <p className="v-card-desc">
                    {vendor.description ? vendor.description.substring(0, 80) + "..." : "No description available."}
                  </p>
                  <button className="v-contact-btn" onClick={() => handleOpenModal(vendor)}>
                    Contact Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- Contact Vendor Modal --- */}
        {selectedVendor && (
          <div className="v-modal-overlay">
            <div className="v-modal-content">
              <button className="v-modal-close" onClick={handleCloseModal}>
                <X size={16} />
              </button>

              <h2>Contact {selectedVendor.businessName}</h2>
              <p>Our concierge team will connect you.</p>

              {submitStatus.success ? (
                <div className="v-success-message">
                  Request sent successfully! We will be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="v-lead-form">
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                  <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                  <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                  <textarea name="message" placeholder="What are your requirements? (e.g., Dates, Venue)" value={formData.message} onChange={handleInputChange} required rows="3"></textarea>

                  {submitStatus.error && <div className="v-error-message">{submitStatus.error}</div>}

                  <button type="submit" className="v-submit-btn" disabled={submitStatus.loading}>
                    {submitStatus.loading ? "Sending..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- Join as Vendor Modal --- */}
        {showJoinModal && (
          <div className="v-modal-overlay">
            <div className="v-modal-content v-modal-large">
              <button className="v-modal-close" onClick={handleCloseJoinModal}>
                <X size={16} />
              </button>

              <h2>Register Your Business</h2>
              <p>Join KalyanaShobha and connect with thousands of couples.</p>

              {joinSubmitStatus.success ? (
                <div className="v-success-message">
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Registration Submitted!</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem' }}>Our admin team will review your application. You will receive an email once your profile is approved and live.</p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="v-lead-form">

                  <div className="v-form-grid">
                    <input type="text" name="businessName" placeholder="Business Name *" value={joinFormData.businessName} onChange={handleJoinInputChange} required />
                    <input type="email" name="email" placeholder="Business Email *" value={joinFormData.email} onChange={handleJoinInputChange} required />

                    {/* REPLACED DATALIST WITH CUSTOM COMBO FIELD */}
                    <ComboField 
                      name="category"
                      value={joinFormData.category}
                      onChange={handleJoinInputChange}
                      options={categories}
                      placeholder="Select or Type Category *"
                      required={true}
                    />

                    <input type="tel" name="contactNumber" placeholder="Contact Number *" value={joinFormData.contactNumber} onChange={handleJoinInputChange} required />
                  </div>

                  <input type="text" name="priceRange" placeholder="Price Range (e.g. ₹50,000 - ₹1 Lakh)" value={joinFormData.priceRange} onChange={handleJoinInputChange} />

                  <textarea name="description" placeholder="Describe your services..." value={joinFormData.description} onChange={handleJoinInputChange} rows="2"></textarea>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Upload Portfolio Images (Max 2)
                      {isCompressing && <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader size={10} className="v-spin" /> Compressing...</span>}
                    </label>
                    <input 
                      type="file" multiple accept="image/*" 
                      onChange={handleJoinFileChange} 
                      className="v-file-upload"
                      disabled={isCompressing || joinSubmitStatus.loading || joinFiles.length >= 2}
                    />

                    {/* Added UI to show current files and a button to clear them */}
                    {joinFiles.length > 0 && !isCompressing && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <small style={{ color: '#10b981', fontWeight: '500', fontSize: '0.7rem' }}>
                          ✓ {joinFiles.length} file(s) ready
                        </small>
                        <button 
                          type="button" 
                          onClick={handleClearFiles} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', padding: 0, fontWeight: '500' }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {joinSubmitStatus.error && <div className="v-error-message">{joinSubmitStatus.error}</div>}

                  <button type="submit" className="v-submit-btn" disabled={joinSubmitStatus.loading || isCompressing || joinFiles.length === 0}>
                    {joinSubmitStatus.loading ? "Submitting..." : isCompressing ? "Processing Images..." : "Submit Registration"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

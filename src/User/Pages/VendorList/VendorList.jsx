import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tag, Phone, Mail, Trash2, X, Loader, Plus, ChevronLeft, ChevronRight } from "lucide-react"; 
import imageCompression from 'browser-image-compression';
import "./VendorList.css";
import Navbar from "../../Components/Navbar";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [
    'Catering', 'Wedding halls', 'Photography', 'Decoration', 
    'Mehendi artists', 'Makeup', 'Event management', 'Travel', 'Pandit'
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

  const handleJoinFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files); 
    if (selectedFiles.length === 0) return;

    if (joinFiles.length >= 2) {
      e.target.value = null; 
      return;
    }

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

    setJoinFiles(prev => [...prev, ...compressedImages]);
    setIsCompressing(false);
    e.target.value = null;
  };

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

  // Helper to get initials if image is missing
  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "VN";
  };

  return (
    <>
      <Navbar />
      <div className="v-admin-container">
        
        {/* Top Actions matching the layout */}
        <button className="v-add-vendor-btn" onClick={handleOpenJoinModal}>
          <Plus size={18} /> Add New Vendor
        </button>

        <div className="v-tabs-container">
          <div className="v-tab active">
            Active Vendors <span className="v-badge-count">{vendors.length}</span>
          </div>
          <div className="v-tab">
            Pending Requests
          </div>
        </div>

        <div className="v-list-wrapper">
          {loading ? (
             [1, 2].map(n => (
               <div key={n} className="v-vendor-card v-skeleton-wrapper">
                 <div className="v-skeleton-img shimmer"></div>
                 <div className="v-card-details">
                   <div className="v-skeleton-text shimmer" style={{ width: '30%', height: '24px', marginBottom: '12px' }}></div>
                   <div className="v-skeleton-text shimmer"></div>
                   <div className="v-skeleton-text shimmer"></div>
                   <div className="v-skeleton-btn shimmer" style={{ marginTop: '16px' }}></div>
                 </div>
               </div>
             ))
          ) : vendors.length === 0 ? (
            <div className="v-no-data">
              <h3>No Vendors Found</h3>
            </div>
          ) : (
            vendors.map((vendor, index) => (
              <div key={vendor._id} className="v-vendor-card">
                <div className="v-card-img-wrapper">
                  {vendor.images && vendor.images.length > 0 ? (
                    <img src={vendor.images[0]} alt={vendor.businessName} />
                  ) : (
                    <div className="v-placeholder-img">{getInitials(vendor.businessName)}</div>
                  )}
                  <span className="v-cat-badge">{vendor.category}</span>
                </div>

                <div className="v-card-details">
                  <div className="v-vendor-id">VND-{String(index + 1).padStart(4, '0')}</div>
                  <h3 className="v-vendor-name">{vendor.businessName}</h3>
                  
                  <div className="v-vendor-info">
                    <div className="v-info-row">
                      <Phone size={16} className="v-info-icon" />
                      <span>{vendor.contactNumber || 'No contact provided'}</span>
                    </div>
                    <div className="v-info-row">
                      <Mail size={16} className="v-info-icon" />
                      <span>{vendor.email || 'No email provided'}</span>
                    </div>
                    <div className="v-info-row">
                      <Tag size={16} className="v-info-icon" />
                      <span>{vendor.priceRange || 'N/A'}</span>
                    </div>
                  </div>

                  <p className="v-vendor-desc">
                    {vendor.description ? vendor.description.substring(0, 50) + "..." : "No description provided..."}
                  </p>

                  <div className="v-card-actions">
                    <button className="v-remove-btn">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination placeholder matching image */}
        {!loading && vendors.length > 0 && (
          <div className="v-pagination">
            <button className="v-page-btn"><ChevronLeft size={16} /></button>
            <span className="v-page-text">Page 1 of 1</span>
            <button className="v-page-btn"><ChevronRight size={16} /></button>
          </div>
        )}

        {/* --- Join as Vendor Modal --- */}
        {showJoinModal && (
          <div className="v-modal-overlay">
            <div className="v-modal-content v-modal-large">
              <button className="v-modal-close" onClick={handleCloseJoinModal}>
                <X size={16} />
              </button>

              <h2>Add New Vendor</h2>
              <p>Register a new business manually.</p>

              {joinSubmitStatus.success ? (
                <div className="v-success-message">
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Vendor Added!</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem' }}>The vendor profile has been created successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="v-lead-form">
                  <div className="v-form-grid">
                    <input type="text" name="businessName" placeholder="Business Name *" value={joinFormData.businessName} onChange={handleJoinInputChange} required />
                    <input type="email" name="email" placeholder="Business Email *" value={joinFormData.email} onChange={handleJoinInputChange} required />

                    <input type="text" name="category" list="vendor-categories" placeholder="Select Category *" value={joinFormData.category} onChange={handleJoinInputChange} required />
                    <datalist id="vendor-categories">
                      {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>

                    <input type="tel" name="contactNumber" placeholder="Contact Number *" value={joinFormData.contactNumber} onChange={handleJoinInputChange} required />
                  </div>

                  <input type="text" name="priceRange" placeholder="Price Range (e.g. 500)" value={joinFormData.priceRange} onChange={handleJoinInputChange} />

                  <textarea name="description" placeholder="Describe the services..." value={joinFormData.description} onChange={handleJoinInputChange} rows="2"></textarea>

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

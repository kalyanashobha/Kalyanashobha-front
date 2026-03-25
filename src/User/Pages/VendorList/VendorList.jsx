import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tag, Image as ImageIcon, X, Plus } from "lucide-react"; 
import "./VendorList.css";
import Navbar from "../../Components/Navbar";

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
  };

  const handleJoinInputChange = (e) => {
    setJoinFormData({ ...joinFormData, [e.target.name]: e.target.value });
  };

  const handleJoinFileChange = (e) => {
    setJoinFiles(Array.from(e.target.files));
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
      <div className="vendor-page-wrapper">
        
        {/* HEADER SECTION */}
        <div className="vendor-header-section">
          <h1 className="vendor-main-title">Premium Wedding Vendors</h1>
          <p className="vendor-subtitle">Curated services to make your special day perfect.</p>
          
          <button className="vendor-action-btn header-join-btn" onClick={handleOpenJoinModal}>
            <Plus size={20} /> Join as Vendor
          </button>
        </div>

        {/* VENDOR GRID */}
        <div className="vendor-card-grid">
          {loading ? (
             [1,2,3,4].map(n => <div key={n} className="vendor-skeleton-card"></div>)
          ) : vendors.length === 0 ? (
            <div className="vendor-empty-state">
              <h3>No Vendors Found</h3>
              <p>Check back later for new listings.</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor._id} className="vendor-profile-card">
                
                {/* Image Section */}
                <div className="vendor-img-wrapper">
                  {vendor.images && vendor.images.length > 0 ? (
                    <img src={vendor.images[0]} alt={vendor.businessName} />
                  ) : (
                    <div className="vendor-img-placeholder"><ImageIcon size={40} /></div>
                  )}
                  <span className="vendor-category-badge">{vendor.category}</span>
                </div>

                {/* Content Section */}
                <div className="vendor-card-body">
                  <h3 className="vendor-card-title">{vendor.businessName}</h3>
                  <p className="vendor-card-desc">
                    {vendor.description ? vendor.description.substring(0, 80) + "..." : "No description available."}
                  </p>
                  
                  <button 
                    className="vendor-action-btn" 
                    onClick={() => handleOpenModal(vendor)}
                  >
                    Contact Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- EXISTING: Contact Vendor Modal --- */}
        {selectedVendor && (
          <div className="vendor-modal-backdrop">
            <div className="vendor-modal-box">
              <button className="vendor-modal-close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
              
              <h2 className="vendor-modal-title">Contact {selectedVendor.businessName}</h2>
              <p className="vendor-modal-subtitle">Our concierge team will connect you.</p>

              {submitStatus.success ? (
                <div className="vendor-feedback-success">
                  Request sent successfully! We will be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="vendor-form-container">
                  <input 
                    className="vendor-input-field"
                    type="text" name="name" placeholder="Full Name" 
                    value={formData.name} onChange={handleInputChange} required 
                  />
                  <input 
                    className="vendor-input-field"
                    type="tel" name="phone" placeholder="Phone Number" 
                    value={formData.phone} onChange={handleInputChange} required 
                  />
                  <input 
                    className="vendor-input-field"
                    type="email" name="email" placeholder="Email Address" 
                    value={formData.email} onChange={handleInputChange} 
                  />
                  <textarea 
                    className="vendor-input-field"
                    name="message" placeholder="What are your requirements? (e.g., Dates, Venue)" 
                    value={formData.message} onChange={handleInputChange} required rows="3"
                  ></textarea>

                  {submitStatus.error && <div className="vendor-feedback-error">{submitStatus.error}</div>}

                  <button type="submit" className="vendor-action-btn" disabled={submitStatus.loading}>
                    {submitStatus.loading ? "Sending..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- NEW: Join as Vendor Modal --- */}
        {showJoinModal && (
          <div className="vendor-modal-backdrop">
            <div className="vendor-modal-box">
              <button className="vendor-modal-close-btn" onClick={handleCloseJoinModal}>
                <X size={24} />
              </button>
              
              <h2 className="vendor-modal-title">Register Your Business</h2>
              <p className="vendor-modal-subtitle">Join KalyanaShobha and connect with thousands of couples.</p>

              {joinSubmitStatus.success ? (
                <div className="vendor-feedback-success">
                  <h3>Registration Submitted!</h3>
                  <p>Our admin team will review your application. You will receive an email once your profile is approved and live.</p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="vendor-form-container">
                  
                  {/* Row 1: Name & Email */}
                  <div className="vendor-form-row">
                    <input 
                      className="vendor-input-field"
                      type="text" name="businessName" placeholder="Business Name" 
                      value={joinFormData.businessName} onChange={handleJoinInputChange} required 
                    />
                    <input 
                      className="vendor-input-field"
                      type="email" name="email" placeholder="Business Email" 
                      value={joinFormData.email} onChange={handleJoinInputChange} required 
                    />
                  </div>
                  
                  {/* Row 2: Category & Contact */}
                  <div className="vendor-form-row">
                    <input 
                      className="vendor-input-field"
                      type="text" name="category" list="vendor-categories" placeholder="Select Category" 
                      value={joinFormData.category} onChange={handleJoinInputChange} required 
                    />
                    <datalist id="vendor-categories">
                      {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>

                    <input 
                      className="vendor-input-field"
                      type="tel" name="contactNumber" placeholder="Contact Number" 
                      value={joinFormData.contactNumber} onChange={handleJoinInputChange} required 
                    />
                  </div>

                  {/* Single column inputs */}
                  <input 
                    className="vendor-input-field"
                    type="text" name="priceRange" placeholder="Price Range (e.g. ₹50,000 - ₹1 Lakh)" 
                    value={joinFormData.priceRange} onChange={handleJoinInputChange} 
                  />
                  
                  <textarea 
                    className="vendor-input-field"
                    name="description" placeholder="Describe your services..." 
                    value={joinFormData.description} onChange={handleJoinInputChange} rows="3"
                  ></textarea>

                  {/* File Upload Section */}
                  <div className="vendor-file-upload-wrapper">
                    <label className="vendor-file-label">Upload Portfolio Images (Max 5)</label>
                    <input 
                      className="vendor-file-input"
                      type="file" multiple accept="image/*" 
                      onChange={handleJoinFileChange} 
                    />
                  </div>

                  {joinSubmitStatus.error && <div className="vendor-feedback-error">{joinSubmitStatus.error}</div>}

                  <button type="submit" className="vendor-action-btn" disabled={joinSubmitStatus.loading}>
                    {joinSubmitStatus.loading ? "Submitting Application..." : "Submit Registration"}
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

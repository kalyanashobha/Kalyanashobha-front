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
      <div className="v-premium-container">
        
        {/* HEADER SECTION */}
        <div className="v-premium-header">
          <h1>Premium Wedding Vendors</h1>
          <p>Curated services to make your special day perfect.</p>
        </div>

        {/* VENDOR GRID */}
        <div className="v-premium-grid">
          {loading ? (
             [1,2,3,4].map(n => <div key={n} className="v-premium-card v-skeleton"></div>)
          ) : vendors.length === 0 ? (
            <div className="v-no-data">
              <h3>No Vendors Found</h3>
              <p>Check back later for new listings.</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor._id} className="v-premium-card">
                
                {/* Image Section */}
                <div className="v-card-image">
                  {vendor.images && vendor.images.length > 0 ? (
                    <img src={vendor.images[0]} alt={vendor.businessName} />
                  ) : (
                    <div className="v-placeholder"><ImageIcon size={32} /></div>
                  )}
                  <span className="v-badge-category">{vendor.category}</span>
                </div>

                {/* Content Section */}
                <div className="v-card-content">
                  <h3 className="v-card-title">{vendor.businessName}</h3>
                  <p className="v-card-desc">
                    {vendor.description ? vendor.description.substring(0, 80) + "..." : "No description available."}
                  </p>
                  
                  {/* Contact Button */}
                  <button 
                    className="v-contact-btn" 
                    onClick={() => handleOpenModal(vendor)}
                  >
                    Contact Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- FIXED FLOATING BUTTON --- */}
        <button 
          className="v-fixed-join-btn" 
          onClick={handleOpenJoinModal}
        >
          <Plus size={20} /> Join as Vendor
        </button>

        {/* --- EXISTING: Contact Vendor Modal --- */}
        {selectedVendor && (
          <div className="v-modal-overlay">
            <div className="v-modal-content">
              <button className="v-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
              
              <h2>Contact {selectedVendor.businessName}</h2>
              <p>Our concierge team will connect you.</p>

              {submitStatus.success ? (
                <div className="v-success-message">
                  Request sent successfully! We will be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="v-lead-form">
                  <input 
                    type="text" name="name" placeholder="Full Name" 
                    value={formData.name} onChange={handleInputChange} required 
                  />
                  <input 
                    type="tel" name="phone" placeholder="Phone Number" 
                    value={formData.phone} onChange={handleInputChange} required 
                  />
                  <input 
                    type="email" name="email" placeholder="Email Address" 
                    value={formData.email} onChange={handleInputChange} 
                  />
                  <textarea 
                    name="message" placeholder="What are your requirements? (e.g., Dates, Venue)" 
                    value={formData.message} onChange={handleInputChange} required rows="3"
                  ></textarea>

                  {submitStatus.error && <div className="v-error-message">{submitStatus.error}</div>}

                  <button type="submit" className="v-submit-btn" disabled={submitStatus.loading}>
                    {submitStatus.loading ? "Sending..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- NEW: Join as Vendor Modal --- */}
        {showJoinModal && (
          <div className="v-modal-overlay">
            <div className="v-modal-content" style={{ maxWidth: '600px' }}>
              <button className="v-modal-close" onClick={handleCloseJoinModal}>
                <X size={20} />
              </button>
              
              <h2>Register Your Business</h2>
              <p>Join KalyanaShobha and connect with thousands of couples.</p>

              {joinSubmitStatus.success ? (
                <div className="v-success-message">
                  <h3 style={{ margin: '0 0 10px 0' }}>Registration Submitted!</h3>
                  <p style={{ margin: 0 }}>Our admin team will review your application. You will receive an email once your profile is approved and live.</p>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit} className="v-lead-form">
                  
                  {/* Clean Grid Layout replacing inline styles */}
                  <div className="v-form-grid">
                    <input 
                      type="text" name="businessName" placeholder="Business Name *" 
                      value={joinFormData.businessName} onChange={handleJoinInputChange} required 
                    />
                    <input 
                      type="email" name="email" placeholder="Business Email *" 
                      value={joinFormData.email} onChange={handleJoinInputChange} required 
                    />
                    
                    <input 
                      type="text" name="category" list="vendor-categories" placeholder="Select Category *" 
                      value={joinFormData.category} onChange={handleJoinInputChange} required 
                    />
                    <datalist id="vendor-categories">
                      {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>

                    <input 
                      type="tel" name="contactNumber" placeholder="Contact Number *" 
                      value={joinFormData.contactNumber} onChange={handleJoinInputChange} required 
                    />
                  </div>

                  <input 
                    type="text" name="priceRange" placeholder="Price Range (e.g. ₹50,000 - ₹1 Lakh)" 
                    value={joinFormData.priceRange} onChange={handleJoinInputChange} 
                  />
                  
                  <textarea 
                    name="description" placeholder="Describe your services..." 
                    value={joinFormData.description} onChange={handleJoinInputChange} rows="3"
                  ></textarea>

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px', display: 'block' }}>
                      Upload Portfolio Images (Max 5)
                    </label>
                    <input 
                      type="file" multiple accept="image/*" 
                      onChange={handleJoinFileChange} 
                      className="v-file-upload"
                    />
                    {joinFiles.length > 0 && (
                      <small style={{ color: '#10b981', display: 'block', marginTop: '6px', fontWeight: '500' }}>
                        ✓ {joinFiles.length} file(s) selected
                      </small>
                    )}
                  </div>

                  {joinSubmitStatus.error && <div className="v-error-message">{joinSubmitStatus.error}</div>}

                  <button type="submit" className="v-submit-btn" disabled={joinSubmitStatus.loading}>
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

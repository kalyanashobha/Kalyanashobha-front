import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tag, Image as ImageIcon, X } from "lucide-react"; // Removed Phone, added X for modal
import "./VendorList.css";
import Navbar from "../../Components/Navbar";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Modal & Form State ---
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

  // Fetch Vendors
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

  // --- NEW: Form Handlers ---
  const handleOpenModal = (vendor) => {
    setSelectedVendor(vendor);
    setSubmitStatus({ loading: false, success: false, error: "" });
    // Optional: If you have user data in localStorage, you can pre-fill formData here
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
        // Auto-close modal after 2 seconds on success
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
                  
                  <div className="v-card-details">

                  </div>

                  {/* --- NEW: Contact Button --- */}
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

        {/* --- NEW: Minimal Contact Modal --- */}
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
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone Number" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                  />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email Address" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                  <textarea 
                    name="message" 
                    placeholder="What are your requirements? (e.g., Dates, Venue)" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    rows="3"
                  ></textarea>

                  {submitStatus.error && <div className="v-error-message">{submitStatus.error}</div>}

                  <button 
                    type="submit" 
                    className="v-submit-btn" 
                    disabled={submitStatus.loading}
                  >
                    {submitStatus.loading ? "Sending..." : "Send Request"}
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

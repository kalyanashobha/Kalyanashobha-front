import React, { useState, useEffect } from "react";
import axios from "axios";
// --- NEW: Imported Search icon ---
import { Plus, Trash2, Phone, Tag, X, Image as ImageIcon, Search } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./VendorManagement.css";

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // --- NEW: Search State ---
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    category: "Catering", // Default
    contactNumber: "",
    priceRange: "",
    description: "",
  });
  const [files, setFiles] = useState([]);

  // Categories based on your Schema Enum
  const categories = [
    'Catering', 'Wedding halls', 'Photography', 'Decoration', 
    'Mehendi artists', 'Makeup', 'Event management', 'Travel', 'Pandit'
  ];

  // 1. Fetch Vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("https://kalyanashobha-back.vercel.app/api/admin/vendors", {
        headers: { Authorization: token },
      });
      if (res.data.success) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 2. Handle Inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files); // Stores FileList
  };

  // 3. Submit Vendor (Multipart Form Data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding vendor...");

    const data = new FormData();
    data.append("businessName", formData.businessName);
    data.append("category", formData.category);
    data.append("contactNumber", formData.contactNumber);
    data.append("priceRange", formData.priceRange);
    data.append("description", formData.description);

    // Append images
    for (let i = 0; i < files.length; i++) {
      data.append("images", files[i]);
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("https://kalyanashobha-back.vercel.app/api/admin/vendors", data, {
        headers: { 
          Authorization: token,
          "Content-Type": "multipart/form-data" 
        },
      });

      toast.update(toastId, { render: "Vendor Added Successfully", type: "success", isLoading: false, autoClose: 3000 });
      setShowModal(false);
      setFormData({
        businessName: "", category: "Catering", contactNumber: "", priceRange: "", description: ""
      });
      setFiles([]);
      fetchVendors(); 

    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Failed to add vendor", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // 4. Delete Vendor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/vendors/${id}`, {
        headers: { Authorization: token },
      });
      toast.update(toastId, { render: "Vendor deleted", type: "success", isLoading: false, autoClose: 2000 });
      fetchVendors();
    } catch (err) {
      toast.update(toastId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  // --- NEW: Filter Logic ---
  // This filters the vendors array based on Vendor ID OR Business Name
  const filteredVendors = vendors.filter((vendor) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesId = vendor.vendorId?.toLowerCase().includes(searchLower);
    const matchesName = vendor.businessName?.toLowerCase().includes(searchLower);
    return matchesId || matchesName;
  });

  return (
    <div className="vm-container">
      <ToastContainer position="top-right" theme="colored" />

      <div className="vm-header">
        <div className="vm-title-section">
          <h2>Vendor Management</h2>
          <p>Manage wedding service providers and listings.</p>
        </div>
        
        {/* --- NEW: Search Bar and Add Button Wrapper --- */}
        <div className="vm-actions-section">
          <div className="vm-search-box">
            <Search size={16} className="vm-search-icon" />
            <input 
              type="text" 
              placeholder="Search ID (e.g., VND-0001) or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="vm-add-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add New Vendor
          </button>
        </div>
      </div>

      {/* VENDOR GRID */}
      <div className="vm-grid">
        {loading ? (
          <div className="vm-loading">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="vm-no-data">
            {searchTerm ? "No vendors match your search." : "No vendors found. Add one to get started."}
          </div>
        ) : (
          // --- NEW: Render filteredVendors instead of vendors ---
          filteredVendors.map((vendor) => (
            <div key={vendor._id} className="vm-card">
              {/* Image Section */}
              <div className="vm-card-image">
                {vendor.images && vendor.images.length > 0 ? (
                  <img src={vendor.images[0]} alt={vendor.businessName} />
                ) : (
                  <div className="placeholder-img"><ImageIcon size={32} /></div>
                )}
                <span className="vm-category-badge">{vendor.category}</span>
              </div>

              {/* Content Section */}
              <div className="vm-card-content">
                <div className="vm-id-badge">{vendor.vendorId || "No ID"}</div>

                <h3>{vendor.businessName}</h3>

                <div className="vm-detail-row">
                  <Phone size={14} className="icon-gold" />
                  <span>{vendor.contactNumber}</span>
                </div>

                <div className="vm-detail-row">
                  <Tag size={14} className="icon-gold" />
                  <span>{vendor.priceRange || "Price on Request"}</span>
                </div>

                <p className="vm-desc">
                  {vendor.description ? vendor.description.substring(0, 60) + "..." : "No description available."}
                </p>
              </div>

              {/* Actions */}
              <div className="vm-card-actions">
                <button className="vm-btn-delete" onClick={() => handleDelete(vendor._id)}>
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD VENDOR */}
      {showModal && (
        <div className="vm-modal-overlay">
          <div className="vm-modal-content">
            <div className="vm-modal-header">
              <h3>Register New Vendor</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="vm-form">
              <div className="vm-form-group">
                <label>Business Name</label>
                <input type="text" name="businessName" required value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Royal Catering Services" />
              </div>

              <div className="vm-form-row">
                <div className="vm-form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="vm-form-group">
                    <label>Contact Number</label>
                    <input type="text" name="contactNumber" required value={formData.contactNumber} onChange={handleInputChange} placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="vm-form-group">
                <label>Price Range</label>
                <input type="text" name="priceRange" value={formData.priceRange} onChange={handleInputChange} placeholder="e.g. ₹50,000 - ₹1 Lakh" />
              </div>

              <div className="vm-form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Brief details about services..."></textarea>
              </div>

              <div className="vm-form-group">
                <label>Upload Image</label>
                <div className="file-input-wrapper">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                  <div className="file-dummy">
                    <ImageIcon size={18} />
                    <span>{files.length > 0 ? `${files.length} files selected` : "Choose files..."}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="vm-submit-btn">Add Vendor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Phone, Tag, X, Image as ImageIcon, Search, Mail, CheckCircle, XCircle, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import "./VendorManagement.css";

export default function VendorManagement() {
  const [activeVendors, setActiveVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Fixed to 3 items per page

  // Mobile Scroll Indicator State
  const [showMainScroll, setShowMainScroll] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    category: "",
    contactNumber: "",
    priceRange: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const categories = [
    'Catering', 'Wedding halls', 'Photography', 'Decoration', 
    'Mehendi artists', 'Makeup', 'Event management', 'Travel', 'Pandit'
  ];

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("https://kalyanashobha-back.vercel.app/api/admin/vendors", {
        headers: { Authorization: token },
      });
      if (res.data.success) {
        const allVendors = res.data.vendors || [];
        setActiveVendors(allVendors.filter(v => v.isApproved));
        setPendingVendors(allVendors.filter(v => !v.isApproved));
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

  // Reset to page 1 whenever tab or search changes
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // --- FILTERING & PAGINATION LOGIC ---
  const currentList = activeTab === "active" ? activeVendors : pendingVendors;

  const filteredVendors = currentList.filter((vendor) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesId = vendor.vendorId?.toLowerCase().includes(searchLower);
    const matchesName = vendor.businessName?.toLowerCase().includes(searchLower);
    return matchesId || matchesName;
  });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  // --- MOBILE ONLY SCROLL INDICATOR LOGIC ---
  useEffect(() => {
    const checkMainScroll = () => {
        // 1. Hide on desktop entirely
        if (window.innerWidth > 768) {
            setShowMainScroll(false);
            return;
        }

        // 2. Hide if modal is open, or if 1 or fewer items
        if (showModal || currentVendors.length <= 1) {
            setShowMainScroll(false);
            return;
        }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 3. Check if the document is taller than the viewport. 
        const isScrollable = documentHeight > windowHeight + 80;

        // 4. Check if we haven't scrolled to the very bottom yet
        const isNotAtBottom = scrollY + windowHeight < documentHeight - 30;

        // 5. Only show the indicator if it's scrollable AND we aren't at the bottom
        setShowMainScroll(isScrollable && isNotAtBottom);
    };

    const timer = setTimeout(checkMainScroll, 50); 
    window.addEventListener('scroll', checkMainScroll);
    window.addEventListener('resize', checkMainScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', checkMainScroll);
        window.removeEventListener('resize', checkMainScroll);
    };
  }, [currentVendors, currentPage, showModal]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsCompressing(true);
    const toastId = toast.loading("Compressing images...");

    try {
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920,
        useWebWorker: true, 
        alwaysKeepResolution: true
      };

      const compressedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          try {
            if (file.type.startsWith('image/')) {
               return await imageCompression(file, options);
            }
            return file;
          } catch (err) {
            console.error(`Failed to compress ${file.name}`, err);
            return file; 
          }
        })
      );

      setFiles(compressedFiles);
      toast.update(toastId, { render: "Images compressed and ready!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (error) {
      console.error("Overall Compression Error:", error);
      toast.update(toastId, { render: "Failed to process some images.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding vendor...");

    const data = new FormData();
    data.append("businessName", formData.businessName);
    data.append("email", formData.email); 
    data.append("category", formData.category);
    data.append("contactNumber", formData.contactNumber);
    data.append("priceRange", formData.priceRange);
    data.append("description", formData.description);

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
        businessName: "", email: "", category: "", contactNumber: "", priceRange: "", description: ""
      });
      setFiles([]);
      fetchVendors(); 

    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Failed to add vendor", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/vendors/${id}`, {
        headers: { Authorization: token },
      });
      toast.update(toastId, { render: "Vendor deleted", type: "success", isLoading: false, autoClose: 2000 });
      
      // Adjust pagination if deleting the last item on a page
      const newTotalPages = Math.ceil((filteredVendors.length - 1) / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
      }
      
      fetchVendors();
    } catch (err) {
      toast.update(toastId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  const handleAction = async (vendorId, actionType) => {
    let rejectionReason = "";

    if (actionType === 'reject') {
      rejectionReason = window.prompt("Optional: Enter reason for rejection (this will be sent to the vendor via email):");
      if (rejectionReason === null) return; 
    }

    const toastId = toast.loading(`${actionType === 'approve' ? 'Approving' : 'Rejecting'} vendor...`);

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("https://kalyanashobha-back.vercel.app/api/admin/vendors/action", {
        vendorObjectId: vendorId,
        action: actionType,
        rejectionReason: rejectionReason
      }, {
        headers: { Authorization: token },
      });

      toast.update(toastId, { render: `Vendor ${actionType}d successfully!`, type: "success", isLoading: false, autoClose: 2000 });
      
      // Adjust pagination if acting on the last item on a page
      const newTotalPages = Math.ceil((filteredVendors.length - 1) / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
      }

      fetchVendors(); 
    } catch (err) {
      toast.update(toastId, { render: `Failed to ${actionType} vendor`, type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  return (
    <div className="vm-container">
      <ToastContainer position="top-right" theme="colored" />

      {/* Embedded CSS specifically for Pagination & Scroll Indicator */}
      <style>{`
        /* --- NEW CIRCULAR PAGINATION UI --- */
        .vm-pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px 16px;
            gap: 24px;
            background: transparent;
            border-top: none;
            width: 100%;
            margin-top: 16px;
        }

        .vm-page-btn-circle {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .vm-page-btn-circle:hover:not(:disabled) {
            background: #f8fafc;
            color: #0f172a;
            border-color: #cbd5e1;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transform: translateY(-1px);
        }

        .vm-page-btn-circle:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: #f8fafc;
        }

        .vm-page-text {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            letter-spacing: 0.3px;
        }

        /* --- SCROLL INDICATOR UI --- */
        .vm-scroll-indicator {
            display: none; 
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 30px;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: none; 
            z-index: 50;
            animation: bounceSubtle 2s infinite ease-in-out;
            backdrop-filter: blur(4px);
        }

        @keyframes bounceSubtle {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, 6px); }
        }

        @media (max-width: 768px) {
            .vm-scroll-indicator {
                display: flex;
            }
            .vm-pagination-container {
                padding: 16px 0;
                gap: 16px;
            }
            .vm-page-btn-circle {
                width: 40px;
                height: 40px;
            }
            .vm-page-text {
                font-size: 14px;
            }
        }
      `}</style>

      {/* HEADER */}
      <div className="vm-header">
        <div className="vm-title-section">
          <h2>Vendor Management</h2>
          <p>Manage wedding service providers and review join requests.</p>
        </div>

        <div className="vm-actions-section">
          <div className="vm-search-box">
            <Search size={16} className="vm-search-icon" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="vm-add-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add New Vendor
          </button>
        </div>
      </div>

      {/* PREMIUM TABS */}
      <div className="vm-tabs-wrapper">
          <button 
              className={`vm-tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
          >
              Active Vendors
              <span className="vm-tab-count">{activeVendors.length}</span>
          </button>
          <button 
              className={`vm-tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
          >
              Pending Requests
              {pendingVendors.length > 0 && (
                  <span className="vm-tab-count vm-pulse-badge">
                      {pendingVendors.length}
                  </span>
              )}
          </button>
      </div>

      {/* VENDOR GRID */}
      <div className="vm-grid">
        {loading ? (
          <div className="vm-state-view">
              <span className="vm-spinner"></span>
              Loading vendors...
          </div>
        ) : currentVendors.length === 0 ? (
          <div className="vm-state-view empty" style={{ gridColumn: "1 / -1" }}>
            <ImageIcon size={48} />
            <h3>No vendors found</h3>
            <p>{searchTerm ? "No vendors match your search." : activeTab === 'active' ? "No active vendors found." : "No pending registration requests."}</p>
          </div>
        ) : (
          currentVendors.map((vendor) => (
            <div key={vendor._id} className="vm-card">
              <div className="vm-card-image">
                {vendor.images && vendor.images.length > 0 ? (
                  <img src={vendor.images[0]} alt={vendor.businessName} />
                ) : (
                  <div className="placeholder-img"><ImageIcon size={32} /></div>
                )}
                <span className="vm-category-badge">{vendor.category}</span>
              </div>

              <div className="vm-card-content">
                <div className="vm-id-badge">{vendor.vendorId || "No ID"}</div>
                <h3>{vendor.businessName}</h3>

                <div className="vm-contact-info">
                  <div className="vm-detail-row">
                    <Phone size={14} className="icon-gold" />
                    <span>{vendor.contactNumber}</span>
                  </div>
                  <div className="vm-detail-row">
                    <Mail size={14} className="icon-gold" />
                    <span>{vendor.email || "No email provided"}</span>
                  </div>
                </div>

                <div className="vm-detail-row">
                  <Tag size={14} className="icon-gold" />
                  <span className="vm-price-tag">{vendor.priceRange || "Price on Request"}</span>
                </div>

                <p className="vm-desc">
                  {vendor.description ? vendor.description.substring(0, 60) + "..." : "No description available."}
                </p>
              </div>

              <div className="vm-card-actions">
                {activeTab === 'active' ? (
                  <button className="vm-btn-delete" onClick={() => handleDelete(vendor._id)}>
                    <Trash2 size={16} /> Remove
                  </button>
                ) : (
                  <div className="vm-action-split">
                    <button className="vm-btn-approve" onClick={() => handleAction(vendor._id, 'approve')}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button className="vm-btn-reject" onClick={() => handleAction(vendor._id, 'reject')}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ALWAYS VISIBLE CIRCULAR PAGINATION DESIGN */}
      {!loading && totalPages >= 1 && (
          <div className="vm-pagination-container">
              <button 
                  className="vm-page-btn-circle" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
              >
                  <ChevronLeft size={20} />
              </button>

              <span className="vm-page-text">
                  Page {currentPage} of {totalPages}
              </span>

              <button 
                  className="vm-page-btn-circle" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      )}

      {/* MOBILE SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="vm-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}

      {/* MODAL: ADD VENDOR */}
      {showModal && (
        <div className="vm-modal-overlay">
          <div className="vm-modal-content">
            <div className="vm-modal-header">
              <h3>Register New Vendor</h3>
              <button onClick={() => setShowModal(false)} className="vm-close-btn"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="vm-form">
              <div className="vm-form-row">
                <div className="vm-form-group">
                  <label>Business Name</label>
                  <input type="text" name="businessName" required value={formData.businessName} onChange={handleInputChange} placeholder="e.g. Royal Catering" />
                </div>
                <div className="vm-form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="vendor@example.com" />
                </div>
              </div>

              <div className="vm-form-row">
                <div className="vm-form-group">
                  <label>Category</label>
                  <input type="text" name="category" required list="category-options" value={formData.category} onChange={handleInputChange} placeholder="Select or type category" />
                  <datalist id="category-options">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
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
                <div className="vm-file-input-wrapper">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={isCompressing} />
                  <div className="vm-file-dummy" style={{ opacity: isCompressing ? 0.6 : 1 }}>
                    <ImageIcon size={18} />
                    <span>
                       {isCompressing ? "Compressing images..." : files.length > 0 ? `${files.length} files compressed & selected` : "Click or drag to choose files..."}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="vm-submit-btn" disabled={isCompressing}>
                {isCompressing ? "Please wait..." : "Add Vendor"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

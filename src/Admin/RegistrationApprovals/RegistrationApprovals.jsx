import React, { useState, useEffect } from "react";
import { Check, X, Eye, Clock, Filter, ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./RegistrationApprovals.css"; 

export default function RegistrationApprovals() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PendingVerification"); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // --- SEARCH & PAGINATION STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Mobile Scroll Indicator State
  const [showMainScroll, setShowMainScroll] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `https://kalyanashobha-back.vercel.app/api/admin/payment/registrations?status=${activeTab}`,
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
        setPayments(response.data.payments);
        setCurrentPage(1); 
        setSearchQuery(""); // Clear search when switching tabs
      }
    } catch (error) {
      console.error("Error fetching payments", error);
      toast.error("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery]);

  // --- FILTERING LOGIC ---
  const filteredPayments = payments.filter((pay) => {
      const query = searchQuery.toLowerCase();
      const name = `${pay.userId?.firstName || ""} ${pay.userId?.lastName || ""}`.toLowerCase();
      const uniqueId = (pay.userId?.uniqueId || "").toLowerCase();
      const mobile = (pay.userId?.mobileNumber || "").toLowerCase();
      const utr = (pay.utrNumber || "").toLowerCase();

      return name.includes(query) || uniqueId.includes(query) || mobile.includes(query) || utr.includes(query);
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- UNIVERSAL SCROLL INDICATOR LOGIC ---
  useEffect(() => {
    const checkMainScroll = () => {
        // Hide if there are zero items to show, or if the image modal is open
        if (currentItems.length === 0 || selectedImage) {
            setShowMainScroll(false);
            return;
        }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight, 
            document.documentElement.scrollHeight
        );

        // 1. Check if the document is actually taller than the viewport. 
        // We use a 50px buffer to account for padding.
        const isScrollable = documentHeight > windowHeight + 50;
        
        // 2. Check if we haven't scrolled to the very bottom yet.
        const isNotAtBottom = scrollY + windowHeight < documentHeight - 40;

        // 3. Only show the indicator if it's scrollable AND we aren't at the bottom.
        setShowMainScroll(isScrollable && isNotAtBottom);
    };

    // Slightly longer timeout (100ms) to ensure the taller Registration rows finish painting
    const timer = setTimeout(checkMainScroll, 100); 
    
    window.addEventListener('scroll', checkMainScroll);
    window.addEventListener('resize', checkMainScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', checkMainScroll);
        window.removeEventListener('resize', checkMainScroll);
    };
  }, [currentItems, currentPage, selectedImage, activeTab]);

  const handleAction = async (paymentId, action) => {
    setProcessingId(paymentId);
    const toastId = toast.loading(`Processing ${action}...`);

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "https://kalyanashobha-back.vercel.app/api/admin/payment/registration/verify",
        { paymentId, action }, 
        { headers: { Authorization: token } }
      );

      toast.update(toastId, { render: `Payment ${action}ed successfully`, type: "success", isLoading: false, autoClose: 3000 });
      fetchPayments();
      window.dispatchEvent(new Event("paymentUpdated"));

    } catch (error) {
      toast.update(toastId, { render: "Action failed. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="ra-layout">
      <ToastContainer position="top-right" theme="colored" />

      {/* HEADER SECTION */}
      <div className="ra-header">
        <div className="ra-title-group">
            <h2>Registration Approvals</h2>
            <p>Verify membership payments and activate users.</p>
        </div>
        
        {/* Search Bar & Refresh Button Layout */}
        <div className="ra-header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
           <div className="ra-search-container" style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
               <Search size={16} color="#64748b" />
               <input 
                   type="text" 
                   placeholder="Search name, ID, mobile, or UTR..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', minWidth: '220px', color: '#0f172a' }}
               />
               {searchQuery && (
                   <X 
                     size={14} 
                     color="#94a3b8" 
                     style={{ cursor: 'pointer' }} 
                     onClick={() => setSearchQuery("")} 
                   />
               )}
           </div>
           <button className="ra-refresh-btn" onClick={fetchPayments}>Refresh List</button>
        </div>
      </div>

      {/* TABS */}
      <div className="ra-tabs-container">
        <div className="ra-tabs">
            <button 
              className={`ra-tab ${activeTab === "PendingVerification" ? "active" : ""}`} 
              onClick={() => setActiveTab("PendingVerification")}
            >
              Pending Review
              {activeTab === "PendingVerification" && <span className="ra-tab-dot"></span>}
            </button>
            <button 
              className={`ra-tab ${activeTab === "Success" ? "active" : ""}`} 
              onClick={() => setActiveTab("Success")}
            >
              Approved History
            </button>
            <button 
              className={`ra-tab ${activeTab === "Rejected" ? "active" : ""}`} 
              onClick={() => setActiveTab("Rejected")}
            >
              Rejected
            </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="ra-content">
        {loading ? (
           <div className="ra-skeleton-stack">
              {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="ra-skeleton-row">
                      <div className="sk-box sk-date"></div>
                      <div className="sk-box sk-user"></div>
                      <div className="sk-box sk-amount"></div>
                      <div className="sk-box sk-action"></div>
                  </div>
              ))}
           </div>
        ) : filteredPayments.length === 0 ? (
          <div className="ra-empty-state">
             <div className="ra-empty-icon"><Filter size={36}/></div>
             <h3>No records found</h3>
             <p>
                {searchQuery 
                    ? `No matching records found for "${searchQuery}".` 
                    : `There are no ${activeTab.toLowerCase()} requests at the moment.`}
             </p>
          </div>
        ) : (
          <>
            <div className="ra-table-container">
              <table className="ra-table">
                  <thead>
                  <tr>
                      <th>Date & Time</th>
                      <th>User Details</th>
                      <th>Payment Info</th>
                      <th>Proof Of Payment</th>
                      <th>Status</th>
                      {(activeTab === "PendingVerification" || activeTab === "Rejected") && <th className="ra-text-right">Actions</th>}
                  </tr>
                  </thead>
                  <tbody>
                  {currentItems.map((pay) => (
                      <tr key={pay._id} className={processingId === pay._id ? "ra-row-processing" : ""}>
                      <td data-label="Date">
                          <div className="ra-date-cell">
                              <Clock size={14} className="ra-icon-sub"/>
                              <div className="ra-date-text">
                                  <span>{new Date(pay.date).toLocaleDateString()}</span>
                                  <small>{new Date(pay.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                              </div>
                          </div>
                      </td>
                      <td data-label="User">
                          <div className="ra-user-cell">
                             <div className="ra-avatar-initial">
                                {pay.userId?.firstName?.[0] || "U"}
                             </div>
                             <div className="ra-user-info">
                                  <strong>{pay.userId?.firstName} {pay.userId?.lastName}</strong>
                                  <span className="ra-sub-id">{pay.userId?.uniqueId || "N/A"}</span>
                                  <span className="ra-sub-phone">{pay.userId?.mobileNumber}</span>
                             </div>
                          </div>
                      </td>
                      <td data-label="Amount">
                          <div className="ra-amount-badge">
                             ₹{pay.amount?.toLocaleString()}
                          </div>
                      </td>
                      <td data-label="Proof">
                          <div className="ra-proof-group">
                              <div className="ra-utr">
                                  <span className="label">UTR:</span>
                                  <span className="val">{pay.utrNumber}</span>
                              </div>
                              <button 
                                  className="ra-view-screenshot-btn" 
                                  onClick={() => setSelectedImage(pay.screenshotUrl)}
                              >
                                  <Eye size={14} /> View
                              </button>
                          </div>
                      </td>
                      <td data-label="Status">
                          <span className={`ra-status-badge ${pay.status.toLowerCase()}`}>
                             {pay.status === 'PendingVerification' ? 'Pending' : pay.status}
                          </span>
                      </td>

                      {(activeTab === "PendingVerification" || activeTab === "Rejected") && (
                          <td data-label="Actions" className="ra-text-right">
                          <div className="ra-actions">
                              <button 
                                  className="ra-btn-approve" 
                                  onClick={() => handleAction(pay._id, "approve")}
                                  disabled={processingId === pay._id}
                                  title="Approve Payment"
                              >
                                  {processingId === pay._id ? <div className="spinner-sm"></div> : <Check size={18} />}
                              </button>

                              {activeTab === "PendingVerification" && (
                                  <button 
                                      className="ra-btn-reject" 
                                      onClick={() => handleAction(pay._id, "reject")}
                                      disabled={processingId === pay._id}
                                      title="Reject Payment"
                                  >
                                      {processingId === pay._id ? <div className="spinner-sm"></div> : <X size={18} />}
                                  </button>
                              )}
                          </div>
                          </td>
                      )}
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>

            {/* NEW PAGINATION DESIGN */}
            {totalPages > 1 && (
                <div className="ra-pagination-container">
                    <button 
                        className="ra-page-btn-circle" 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="ra-page-text">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        className="ra-page-btn-circle" 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
          </>
        )}
      </div>

      {/* MOBILE SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="ra-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div className="ra-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="ra-modal-anim">
            <div className="ra-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ra-modal-header">
                    <h3>Payment Proof</h3>
                    <button className="ra-modal-close" onClick={() => setSelectedImage(null)}>
                        <X size={20}/>
                    </button>
                </div>
                <div className="ra-modal-body">
                    <img src={selectedImage} alt="Payment Proof" />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

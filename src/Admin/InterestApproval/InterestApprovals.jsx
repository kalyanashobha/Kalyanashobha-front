import React, { useState, useEffect } from "react";
import { Check, X, Clock, ArrowRight, Filter, RefreshCw, Phone, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./InterestApprovals.css"; 

export default function InterestApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'PendingAdminPhase1' (New), 'PendingAdminPhase2' (Accepted), 'Finalized' (Completed)
  const [activeTab, setActiveTab] = useState("PendingAdminPhase1"); 
  const [processingId, setProcessingId] = useState(null);
  const [tabCounts, setTabCounts] = useState({ phase1: 0, phase2: 0 });

  // --- PAGINATION & SCROLL STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Fixed 6 items for both Desktop and Mobile
  const [showMainScroll, setShowMainScroll] = useState(false);

  // Fetch Data for the active tab
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `https://kalyanashobha-back.vercel.app/api/admin/interest/workflow?status=${activeTab}`,
        { headers: { Authorization: token } }
      );
      if (response.data.success) {
        setRequests(response.data.data);
        setCurrentPage(1); // Reset page on data fetch
      }
    } catch (error) {
      console.error("Error fetching interests", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [res1, res2] = await Promise.all([
        axios.get(`https://kalyanashobha-back.vercel.app/api/admin/interest/workflow?status=PendingAdminPhase1`, { headers: { Authorization: token } }),
        axios.get(`https://kalyanashobha-back.vercel.app/api/admin/interest/workflow?status=PendingAdminPhase2`, { headers: { Authorization: token } })
      ]);

      setTabCounts({
        phase1: res1.data.success ? res1.data.data.length : 0,
        phase2: res2.data.success ? res2.data.data.length : 0,
      });
    } catch (error) {
      console.error("Error fetching counts for badges", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCounts();
  }, [activeTab]);

  // Universal Scroll Indicator Logic (Desktop & Mobile)
  useEffect(() => {
    const checkMainScroll = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 1. Check if the document is actually taller than the viewport
        // (Adding a 10px buffer prevents it from showing if it fits almost perfectly)
        const isScrollable = documentHeight > windowHeight + 10;
        
        // 2. Check if we haven't scrolled to the very bottom yet
        const isNotAtBottom = scrollY + windowHeight < documentHeight - 30;

        // 3. Only show the indicator if it's scrollable AND we aren't at the bottom
        setShowMainScroll(isScrollable && isNotAtBottom);
    };

    // We use a shorter 50ms timeout to give the browser just enough time 
    // to paint the new items to the screen before checking the heights.
    const timer = setTimeout(checkMainScroll, 50); 
    
    window.addEventListener('scroll', checkMainScroll);
    window.addEventListener('resize', checkMainScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', checkMainScroll);
        window.removeEventListener('resize', checkMainScroll);
    };
  }, [requests, currentPage]);

  // Handle Actions
  const handleAction = async (interestId, action, phase) => {
    setProcessingId(interestId);
    const toastId = toast.loading("Processing request...");

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "https://kalyanashobha-back.vercel.app/api/admin/interest/process",
        { interestId, action, phase },
        { headers: { Authorization: token } }
      );

      toast.update(toastId, { render: "Action completed successfully", type: "success", isLoading: false, autoClose: 3000 });
      fetchRequests(); 
      fetchCounts(); 
    } catch (error) {
      toast.update(toastId, { render: "Action failed. Please try again.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(requests.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="ksa-layout">
      <ToastContainer position="top-right" theme="colored" />

      {/* HEADER */}
      <div className="ksa-header">
        <div className="ksa-title-group">
            <h2>Connection Management</h2>
            <p>Review new requests and manage active match connections.</p>
        </div>
        <button className="ksa-refresh-btn" onClick={() => { fetchRequests(); fetchCounts(); }}>
            <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* TABS */}
      <div className="ksa-tabs-container">
        <div className="ksa-tabs">
            <button 
                className={`ksa-tab ${activeTab === "PendingAdminPhase1" ? "active" : ""}`} 
                onClick={() => setActiveTab("PendingAdminPhase1")}
            >
              New Requests
              {tabCounts.phase1 > 0 && <span className="ksa-tab-dot"></span>}
            </button>
            <button 
                className={`ksa-tab ${activeTab === "PendingAdminPhase2" ? "active" : ""}`} 
                onClick={() => setActiveTab("PendingAdminPhase2")}
            >
              Accepted Matches
              {tabCounts.phase2 > 0 && <span className="ksa-tab-dot ksa-dot-green"></span>}
            </button>
            <button 
                className={`ksa-tab ${activeTab === "Finalized" ? "active" : ""}`} 
                onClick={() => setActiveTab("Finalized")}
            >
              Completed Matches
            </button>
        </div>
      </div>

      {/* CONTENT TABLE */}
      <div className="ksa-content">
        {loading ? (
           <div className="ksa-skeleton-stack">
              {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="ksa-skeleton-row">
                      <div className="ksa-sk-box ksa-sk-date"></div>
                      <div className="ksa-sk-box ksa-sk-flow"></div>
                      <div className="ksa-sk-box ksa-sk-details"></div>
                      <div className="ksa-sk-box ksa-sk-action"></div>
                  </div>
              ))}
           </div>
        ) : requests.length === 0 ? (
          <div className="ksa-empty-state">
             <div className="ksa-empty-icon"><Filter size={36}/></div>
             <h3>No requests found</h3>
             <p>There are no requests in this stage right now.</p>
          </div>
        ) : (
          <>
            <div className="ksa-table-container">
              <table className="ksa-table">
                  <thead>
                  <tr>
                      <th>Date</th>
                      <th>Match Flow</th>
                      <th>Connection Details</th>
                      <th>Status</th>
                      {activeTab !== "Finalized" && <th className="ksa-text-right">Actions</th>}
                  </tr>
                  </thead>
                  <tbody>
                  {currentItems.map((req) => (
                      <tr key={req._id} className={processingId === req._id ? "ksa-row-processing" : ""}>

                      {/* DATE */}
                      <td data-label="Date">
                          <div className="ksa-date-cell">
                              <Clock size={14} className="ksa-icon-sub"/>
                              <div className="ksa-date-text">
                                  <span>{new Date(req.date).toLocaleDateString()}</span>
                                  <small>{new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                              </div>
                          </div>
                      </td>

                      {/* FLOW */}
                      <td data-label="Match Flow">
                          <div className="ksa-flow-cell">
                              <div className="ksa-user-mini">
                                  <div className="ksa-avatar-xs">{req.senderId?.firstName?.[0] || "S"}</div>
                                  <div className="ksa-user-text">
                                      <span className="name">{req.senderId?.firstName}</span>
                                  </div>
                              </div>
                              <div className="ksa-flow-arrow"><ArrowRight size={14}/></div>
                              <div className="ksa-user-mini">
                                  <div className="ksa-avatar-xs receiver">{req.receiverId?.firstName?.[0] || "R"}</div>
                                  <div className="ksa-user-text">
                                      <span className="name">{req.receiverId?.firstName}</span>
                                  </div>
                              </div>
                          </div>
                      </td>

                      {/* CONNECTION DETAILS */}
                      <td data-label="Connection Details">
                          <div className="ksa-contact-box">
                              {/* SENDER BLOCK */}
                              <div className="ksa-contact-person">
                                  <span className="ksa-contact-label">Sent By (Initiator)</span>
                                  <span className="ksa-contact-name">
                                      {req.senderId?.firstName} {req.senderId?.lastName} 
                                      <span className="ksa-contact-id">({req.senderId?.uniqueId})</span>
                                  </span>
                                  <span className="ksa-contact-number">
                                      <Phone size={12}/> {req.senderId?.mobileNumber || "N/A"}
                                  </span>
                              </div>

                              {/* RECEIVER BLOCK */}
                              <div className="ksa-contact-person receiver-block">
                                  <span className={`ksa-contact-label ${activeTab === 'PendingAdminPhase2' ? 'accepted' : 'pending'}`}>
                                      {activeTab === 'PendingAdminPhase2' ? "✓ Accepted By (Receiver)" : "To Receiver"}
                                  </span>
                                  <span className="ksa-contact-name">
                                      {req.receiverId?.firstName} {req.receiverId?.lastName} 
                                      <span className="ksa-contact-id">({req.receiverId?.uniqueId})</span>
                                  </span>
                                  <span className="ksa-contact-number">
                                      <Phone size={12}/> {req.receiverId?.mobileNumber || "N/A"}
                                  </span>
                              </div>
                          </div>
                      </td>

                      {/* STATUS */}
                      <td data-label="Status">
                          <span className={`ksa-status-badge ${req.status}`}>
                            {req.status === 'PendingAdminPhase1' ? 'Awaiting Review' : 
                              req.status === 'PendingAdminPhase2' ? 'Action Required' : 
                              req.status === 'Finalized' ? 'Completed' :
                              req.status}
                          </span>
                      </td>

                      {/* ACTIONS */}
                      {activeTab === "PendingAdminPhase1" && (
                          <td data-label="Actions" className="ksa-text-right">
                          <div className="ksa-actions">
                              <button 
                                  className="ksa-btn-outline-primary" 
                                  onClick={() => handleAction(req._id, 'approve', 1)} 
                                  disabled={processingId === req._id}
                              >
                                  Forward Request
                              </button>
                              <button className="ksa-btn-reject" onClick={() => handleAction(req._id, 'reject', 1)} disabled={processingId === req._id} title="Reject Request">
                                  {processingId === req._id ? <div className="spinner-sm"></div> : <X size={18} />}
                              </button>
                          </div>
                          </td>
                      )}

                      {activeTab === "PendingAdminPhase2" && (
                          <td data-label="Actions" className="ksa-text-right">
                          <div className="ksa-actions">
                              <button 
                                  className="ksa-btn-success"
                                  onClick={() => handleAction(req._id, 'finalize', 2)} 
                                  disabled={processingId === req._id}
                              >
                                  {processingId === req._id ? <div className="spinner-sm"></div> : <><Check size={16} strokeWidth={3}/> Finalize Match</>}
                              </button>
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
                <div className="ksa-pagination-container">
                    <button 
                        className="ksa-page-btn-circle" 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <span className="ksa-page-text">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        className="ksa-page-btn-circle" 
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

      {/* UNIVERSAL SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="ksa-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}
    </div>
  );
}
 
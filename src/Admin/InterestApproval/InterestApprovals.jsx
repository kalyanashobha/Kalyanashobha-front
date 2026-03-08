import React, { useState, useEffect } from "react";
import { Check, X, Clock, ArrowRight, Filter, RefreshCw, Phone } from "lucide-react";
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
  
  // NEW: State to track actual pending counts for the notification dots
  const [tabCounts, setTabCounts] = useState({ phase1: 0, phase2: 0 });

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
      }
    } catch (error) {
      console.error("Error fetching interests", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch counts for the notification dots in the background
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
    fetchCounts(); // Always update counts when swapping tabs
  }, [activeTab]);

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

      toast.update(toastId, { 
        render: "Action completed successfully", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });

      fetchRequests(); 
      fetchCounts(); // Update the notification dots after an action is taken
    } catch (error) {
      toast.update(toastId, { 
        render: "Action failed. Please try again.", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    } finally {
      setProcessingId(null);
    }
  };

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
            {/* Show red dot ONLY if phase1 count is greater than 0 */}
            {tabCounts.phase1 > 0 && <span className="ksa-tab-dot"></span>}
            </button>
            <button 
                className={`ksa-tab ${activeTab === "PendingAdminPhase2" ? "active" : ""}`} 
                onClick={() => setActiveTab("PendingAdminPhase2")}
            >
            Accepted Matches
            {/* Show green dot ONLY if phase2 count is greater than 0 */}
            {tabCounts.phase2 > 0 && <span className="ksa-tab-dot" style={{background: '#10B981'}}></span>}
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
              {[1, 2, 3, 4].map(i => (
                  <div key={i} className="ksa-skeleton-row">
                      <div className="ksa-sk-box ksa-sk-date"></div>
                      <div className="ksa-sk-box ksa-sk-flow"></div>
                      <div className="ksa-sk-box ksa-sk-action"></div>
                  </div>
              ))}
           </div>
        ) : requests.length === 0 ? (
          <div className="ksa-empty-state">
             <div className="ksa-empty-icon"><Filter size={32}/></div>
             <h3>No requests found</h3>
             <p>There are no requests in this stage right now.</p>
          </div>
        ) : (
          <div className="ksa-table-container">
            <table className="ksa-table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Match Flow</th>
                    <th>Connection Details</th>
                    <th>Status</th>
                    {activeTab !== "Finalized" && <th align="right">Actions</th>}
                </tr>
                </thead>
                <tbody>
                {requests.map((req) => (
                    <tr key={req._id} className={processingId === req._id ? "ksa-row-processing" : ""}>
                    
                    {/* DATE */}
                    <td data-label="Date">
                        <div className="ksa-date-cell">
                            <Clock size={14} className="ksa-icon-sub"/>
                            <span className="ksa-date-text">
                                {new Date(req.date).toLocaleDateString()}
                                <small style={{display: "block", color: "#64748b", marginTop: "2px"}}>
                                    {new Date(req.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </small>
                            </span>
                        </div>
                    </td>
                    
                    {/* FLOW */}
                    <td data-label="Flow">
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
                        <div className="ksa-contact-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* SENDER BLOCK */}
                            <div className="ksa-contact-person">
                                <span className="contact-label" style={{color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold'}}>
                                    Sent By (Initiator)
                                </span>
                                <span className="contact-name" style={{fontWeight: 600, fontSize: '13.5px', display: 'block', marginTop: '3px', color: '#0f172a'}}>
                                    {req.senderId?.firstName} {req.senderId?.lastName} <span style={{color: '#3b82f6'}}>({req.senderId?.uniqueId})</span>
                                </span>
                                <span className="contact-number" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginTop: '3px'}}>
                                    <Phone size={12}/> {req.senderId?.mobileNumber || "N/A"}
                                </span>
                            </div>

                            {/* RECEIVER BLOCK */}
                            <div className="ksa-contact-person" style={{paddingTop: "10px", borderTop: "1px dashed #cbd5e1"}}>
                                <span className="contact-label" style={{
                                    color: activeTab === 'PendingAdminPhase2' ? '#10b981' : '#f59e0b', 
                                    fontSize: '11px', 
                                    textTransform: 'uppercase', 
                                    fontWeight: 'bold'
                                }}>
                                    {activeTab === 'PendingAdminPhase2' ? "✓ Accepted By (Receiver)" : "To Receiver"}
                                </span>
                                <span className="contact-name" style={{fontWeight: 600, fontSize: '13.5px', display: 'block', marginTop: '3px', color: '#0f172a'}}>
                                    {req.receiverId?.firstName} {req.receiverId?.lastName} <span style={{color: '#3b82f6'}}>({req.receiverId?.uniqueId})</span>
                                </span>
                                <span className="contact-number" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginTop: '3px'}}>
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

                    {/* ACTIONS - NEW REQUESTS (Phase 1) */}
                    {activeTab === "PendingAdminPhase1" && (
                        <td data-label="Actions" align="right">
                        <div className="ksa-actions">
                            <button 
                                className="ksa-btn-outline-primary" 
                                onClick={() => handleAction(req._id, 'approve', 1)} 
                                disabled={processingId === req._id}
                                style={{ whiteSpace: 'nowrap' }} 
                            >
                                Forward Request
                            </button>
                            <button className="ksa-btn-reject" onClick={() => handleAction(req._id, 'reject', 1)} disabled={processingId === req._id} title="Reject Request">
                                <X size={18} />
                            </button>
                        </div>
                        </td>
                    )}

                    {/* ACTIONS - ACCEPTED MATCHES (Phase 2) */}
                    {activeTab === "PendingAdminPhase2" && (
                        <td data-label="Actions" align="right">
                        <div className="ksa-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => handleAction(req._id, 'finalize', 2)} 
                                disabled={processingId === req._id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#059669', 
                                    color: '#ffffff', 
                                    border: 'none',
                                    padding: '8px 14px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap', 
                                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                                    opacity: processingId === req._id ? 0.7 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Check size={16} strokeWidth={3} style={{marginRight: '6px'}}/> Finalize Match
                            </button>
                        </div>
                        </td>
                    )}
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

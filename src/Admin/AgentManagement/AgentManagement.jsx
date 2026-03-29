import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, UserPlus, Trash2, Eye, X, Phone, Search, 
  ChevronLeft, ChevronRight, Briefcase, Hash, Calendar, Mail, Lock, ChevronDown
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./AgentManagement.css";

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data States
  const [selectedAgent, setSelectedAgent] = useState(null); 
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [processingId, setProcessingId] = useState(null);

  // --- MAIN LIST PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 3 items per page for main list

  // --- MODAL PAGINATION STATES ---
  const [detailPage, setDetailPage] = useState(1);
  const USERS_PER_PAGE = 3; // Changed to 3 items per page to match

  // Mobile Scroll Indicator State
  const [showMainScroll, setShowMainScroll] = useState(false);

  // 1. Fetch All Agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("https://kalyanashobha-back.vercel.app/api/admin/agents", {
        headers: { Authorization: token },
      });
      if (res.data.success) {
        setAgents(res.data.agents);
        setFilteredAgents(res.data.agents);
      }
    } catch (err) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // 2. Search Logic & Reset Page
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on search
    if (!searchTerm) {
      setFilteredAgents(agents);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(lowerTerm) ||
        (agent.agentCode && agent.agentCode.toLowerCase().includes(lowerTerm)) ||
        agent.mobile.includes(lowerTerm) || 
        agent.email.toLowerCase().includes(lowerTerm)
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  // --- MAIN LIST PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);

  // --- MOBILE ONLY SCROLL INDICATOR LOGIC ---
  useEffect(() => {
    const checkMainScroll = () => {
        // 1. Hide on desktop entirely
        if (window.innerWidth > 768) {
            setShowMainScroll(false);
            return;
        }

        // 2. Hide if modal is open, or if 1 or fewer items
        if (showAddModal || showDetailModal || currentAgents.length <= 1) {
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
  }, [currentAgents, currentPage, showAddModal, showDetailModal]);

  // 3. Add Agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating agent...");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("https://kalyanashobha-back.vercel.app/api/admin/agents", formData, {
        headers: { Authorization: token },
      });
      toast.update(toastId, { render: "Agent Created Successfully", type: "success", isLoading: false, autoClose: 3000 });
      setShowAddModal(false);
      setFormData({ name: "", email: "", mobile: "", password: "" });
      fetchAgents();
    } catch (err) {
      toast.update(toastId, { render: "Error creating agent", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // 4. View Details
  const handleViewDetails = async (agentId) => {
    setProcessingId(agentId);
    const toastId = toast.loading("Fetching details...");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`https://kalyanashobha-back.vercel.app/api/admin/agents/${agentId}/details`, {
        headers: { Authorization: token },
      });
      if (res.data.success) {
        toast.dismiss(toastId);
        setSelectedAgent(res.data);
        setDetailPage(1); 
        setShowDetailModal(true);
      }
    } catch (err) {
      toast.update(toastId, { render: "Could not fetch details", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Delete Agent
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setProcessingId(id);
    const toastId = toast.loading("Deleting agent...");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/agents/${id}`, {
        headers: { Authorization: token },
      });
      toast.update(toastId, { render: "Agent deleted successfully", type: "success", isLoading: false, autoClose: 2000 });
      
      // Adjust pagination if deleting the last item on a page
      const newTotalPages = Math.ceil((filteredAgents.length - 1) / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
      }

      fetchAgents();
    } catch (err) {
      toast.update(toastId, { render: "Delete failed", type: "error", isLoading: false, autoClose: 2000 });
    } finally {
      setProcessingId(null);
    }
  };

  // Get Users for modal current page
  const getPaginatedUsers = () => {
    if (!selectedAgent || !selectedAgent.users) return [];
    const indexOfLast = detailPage * USERS_PER_PAGE;
    const indexOfFirst = indexOfLast - USERS_PER_PAGE;
    return selectedAgent.users.slice(indexOfFirst, indexOfLast);
  };

  const totalDetailPages = selectedAgent?.users 
    ? Math.ceil(selectedAgent.users.length / USERS_PER_PAGE) || 1
    : 1;

  return (
    <div className="am-layout">
      <ToastContainer position="top-right" theme="colored" />

      {/* Embedded CSS for Pagination and Scroll Indicator */}
      <style>{`
        /* --- NEW CIRCULAR PAGINATION UI --- */
        .am-pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px 16px 0 16px;
            margin-top: 16px;
            gap: 24px;
            background: transparent;
            border-top: none;
            width: 100%;
        }

        .am-page-btn-circle {
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

        .am-page-btn-circle:hover:not(:disabled) {
            background: #f8fafc;
            color: #0f172a;
            border-color: #cbd5e1;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transform: translateY(-1px);
        }

        .am-page-btn-circle:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: #f8fafc;
        }

        .am-page-text {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            letter-spacing: 0.3px;
        }

        /* --- SCROLL INDICATOR UI --- */
        .am-scroll-indicator {
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
            .am-scroll-indicator {
                display: flex;
            }
            .am-pagination-container {
                padding: 16px 0;
                gap: 16px;
            }
            .am-page-btn-circle {
                width: 40px;
                height: 40px;
            }
            .am-page-text {
                font-size: 14px;
            }
        }
      `}</style>

      {/* HEADER */}
      <div className="am-header">
        <div className="am-title-group">
          <h2>Agent Management</h2>
          <p>Manage affiliates and track referrals.</p>
        </div>
        <button className="am-primary-btn" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> <span>Add New Agent</span>
        </button>
      </div>

      {/* CONTROLS */}
      <div className="am-controls">
        <div className="am-search-wrapper">
            <Search className="am-search-icon" size={18} />
            <input 
            type="text" 
            placeholder="Search by Name, Email, ID, or Mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="am-search-input"
            />
        </div>
      </div>

      {/* GRID LIST */}
      <div className="am-grid">
        {loading ? (
            /* SKELETON LOADER mapped to itemsPerPage */
            Array(itemsPerPage).fill(0).map((_, i) => (
                <div key={i} className="am-card skeleton-card">
                    <div className="sk-blob sk-header"></div>
                    <div className="sk-blob sk-stat"></div>
                    <div className="sk-blob sk-action"></div>
                </div>
            ))
        ) : currentAgents.length === 0 ? (
          <div className="am-empty-state" style={{ gridColumn: "1 / -1" }}>
             <div className="am-empty-icon"><Search size={40}/></div>
             <h3>No agents found</h3>
             <p>Try adjusting your search criteria.</p>
          </div>
        ) : (
          currentAgents.map((agent) => (
            <div key={agent._id} className="am-card">
              <div className="am-card-header">
                <div className="am-avatar-box">
                    <div className="am-avatar-char">{agent.name.charAt(0).toUpperCase()}</div>
                </div>
                <div className="am-info">
                  <h3 className="am-name">{agent.name}</h3>
                  <span className="am-code-badge">
                    <Hash size={10} style={{marginRight:2}}/> {agent.agentCode || "PENDING"}
                  </span>
                </div>
              </div>

              {/* Contact Info Section */}
              <div style={{ padding: "0 15px 12px", borderBottom: "1px solid #f0f0f0", marginBottom: "10px" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                    <Mail size={14} style={{ color: "#888" }}/> {agent.email}
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555" }}>
                    <Phone size={14} style={{ color: "#888" }}/> {agent.mobile}
                 </div>
              </div>

              <div className="am-stats-grid" style={{ paddingTop: 0 }}>
                <div className="am-stat-item">
                    <span className="lbl"><Users size={12}/> Total Referrals</span>
                    <span className="val">{agent.referralCount || 0}</span>
                </div>
              </div>

              <div className="am-card-footer">
                <button 
                    className="am-btn-view" 
                    onClick={() => handleViewDetails(agent._id)}
                    disabled={processingId === agent._id}
                >
                  {processingId === agent._id ? "Loading..." : <><Eye size={16} /> View Details</>}
                </button>
                <button 
                    className="am-btn-del" 
                    onClick={() => handleDelete(agent._id)}
                    disabled={processingId === agent._id}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ALWAYS VISIBLE CIRCULAR PAGINATION FOR MAIN GRID */}
      {!loading && totalPages >= 1 && (
          <div className="am-pagination-container">
              <button 
                  className="am-page-btn-circle" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
              >
                  <ChevronLeft size={20} />
              </button>

              <span className="am-page-text">
                  Page {currentPage} of {totalPages}
              </span>

              <button 
                  className="am-page-btn-circle" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      )}

      {/* MOBILE SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="am-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}

      {/* MODAL: ADD AGENT */}
      {showAddModal && (
        <div className="am-modal-overlay">
          <div className="am-modal-content medium">
            <div className="am-modal-header">
              <h3>Register New Agent</h3>
              <button className="am-close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAgent} className="am-form">
              <div className="am-form-group">
                <label className="am-label"><Users size={14}/> Full Name</label>
                <input type="text" className="am-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter full name" />
              </div>
              <div className="am-form-group">
                <label className="am-label"><Phone size={14}/> Mobile Number</label>
                <input type="text" className="am-input" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="10-digit mobile" />
              </div>
              <div className="am-form-group">
                <label className="am-label"><Mail size={14}/> Email Address</label>
                <input type="email" className="am-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="agent@example.com" />
              </div>
              <div className="am-form-group">
                <label className="am-label"><Lock size={14}/> Password</label>
                <input type="text" className="am-input" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Create secure password" />
              </div>
              <div className="am-modal-actions">
                  <button type="button" className="am-btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="am-btn-submit">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAILS */}
      {showDetailModal && selectedAgent && (
        <div className="am-modal-overlay">
          <div className="am-modal-content large">
            <div className="am-modal-header">
              <div className="am-detail-title">
                <Briefcase size={20} className="am-title-icon"/>
                <div>
                    <h3>{selectedAgent.agent.name}</h3>
                    <span className="am-sub-id">ID: {selectedAgent.agent.agentCode}</span>
                </div>
              </div>
              <button className="am-close-btn" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>

            <div className="am-modal-body">
              <div className="am-list-toolbar">
                <h4>Referred Users</h4>
                <span className="am-count-pill">{selectedAgent.users.length} Total</span>
              </div>

              {selectedAgent.users.length === 0 ? (
                <div className="am-empty-inner">
                    <Users size={32} opacity={0.2}/>
                    <p>No users referred by this agent yet.</p>
                </div>
              ) : (
                <>
                  <div className="am-table-container">
                    <table className="am-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Contact</th>
                          <th>Status</th>
                          <th>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedUsers().map(u => (
                          <tr key={u._id}>
                            <td>
                                <div className="am-user-cell">
                                    <div className="am-cell-avatar">{u.firstName[0]}</div>
                                    <div className="am-cell-info">
                                        <span className="name">{u.firstName} {u.lastName}</span>
                                        <span className="id">{u.uniqueId}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{u.mobileNumber}</td>
                            <td>
                              {u.isPaidMember ? (
                                <span className="am-status paid">Paid Member</span>
                              ) : (
                                <span className="am-status free">Free</span>
                              )}
                            </td>
                            <td className="am-date-cell">
                                <Calendar size={12}/> {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION FOR MODAL (Always Visible) */}
                  {totalDetailPages >= 1 && (
                    <div className="am-pagination-container" style={{ marginTop: '0', paddingTop: '16px' }}>
                      <button 
                        className="am-page-btn-circle" 
                        disabled={detailPage === 1} 
                        onClick={() => setDetailPage(p => p - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="am-page-text">
                        Page {detailPage} of {totalDetailPages}
                      </span>
                      <button 
                        className="am-page-btn-circle" 
                        disabled={detailPage === totalDetailPages} 
                        onClick={() => setDetailPage(p => p + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, UserPlus, Trash2, Eye, X, Phone, Search, 
  ChevronLeft, ChevronRight, Briefcase, Hash, Calendar, Mail, Lock
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

  // Pagination State for Modal
  const [detailPage, setDetailPage] = useState(1);
  const USERS_PER_PAGE = 5; 

  // Data States
  const [selectedAgent, setSelectedAgent] = useState(null); 
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "" });
  const [processingId, setProcessingId] = useState(null);

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

  // 2. Search Logic
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAgents(agents);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = agents.filter(agent => 
        agent.name.toLowerCase().includes(lowerTerm) ||
        (agent.agentCode && agent.agentCode.toLowerCase().includes(lowerTerm)) ||
        agent.mobile.includes(lowerTerm)
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

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
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/agents/${id}`, {
        headers: { Authorization: token },
      });
      toast.success("Agent deleted successfully");
      fetchAgents();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  // Get Users for current page
  const getPaginatedUsers = () => {
    if (!selectedAgent || !selectedAgent.users) return [];
    const indexOfLast = detailPage * USERS_PER_PAGE;
    const indexOfFirst = indexOfLast - USERS_PER_PAGE;
    return selectedAgent.users.slice(indexOfFirst, indexOfLast);
  };

  const totalDetailPages = selectedAgent?.users 
    ? Math.ceil(selectedAgent.users.length / USERS_PER_PAGE) 
    : 0;

  return (
    <div className="am-layout">
      <ToastContainer position="top-right" theme="colored" />

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
            placeholder="Search by Name, Agent ID, or Mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="am-search-input"
            />
        </div>
      </div>

      {/* GRID LIST */}
      <div className="am-grid">
        {loading ? (
            /* SKELETON LOADER */
            Array(4).fill(0).map((_, i) => (
                <div key={i} className="am-card skeleton-card">
                    <div className="sk-blob sk-header"></div>
                    <div className="sk-blob sk-stat"></div>
                    <div className="sk-blob sk-action"></div>
                </div>
            ))
        ) : filteredAgents.length === 0 ? (
          <div className="am-empty-state">
             <div className="am-empty-icon"><Search size={40}/></div>
             <h3>No agents found</h3>
             <p>Try adjusting your search criteria.</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
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

              <div className="am-stats-grid">
                <div className="am-stat-item">
                    <span className="lbl"><Users size={12}/> Referrals</span>
                    <span className="val">{agent.referralCount || 0}</span>
                </div>
                <div className="am-stat-item">
                    <span className="lbl"><Phone size={12}/> Contact</span>
                    <span className="val">{agent.mobile}</span>
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

                  {/* PAGINATION */}
                  {selectedAgent.users.length > USERS_PER_PAGE && (
                    <div className="am-pagination">
                      <button 
                        className="am-page-arrow" 
                        disabled={detailPage === 1} 
                        onClick={() => setDetailPage(p => p - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="am-page-text">
                        Page {detailPage} of {totalDetailPages}
                      </span>
                      <button 
                        className="am-page-arrow" 
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

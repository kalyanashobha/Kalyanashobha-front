import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronLeft, ChevronRight, Filter, ChevronDown } from "lucide-react";
import "./AdminVendorLeads.css";

export default function AdminVendorLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; 

  const [showMainScroll, setShowMainScroll] = useState(false);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("adminToken"); 
      const config = { headers: { Authorization: token } };

      const timestamp = new Date().getTime();
      const res = await axios.get(`https://kalyanashobha-back.vercel.app/api/admin/vendor-leads?t=${timestamp}`, config);

      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching vendor leads", err);
      const backendError = err.response?.data?.message || "Failed to load leads. Please try again.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  let processedLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    const clientName = lead.name?.toLowerCase() || "";
    const clientPhone = lead.phone?.toLowerCase() || "";
    const vendorName = lead.vendorId?.businessName?.toLowerCase() || "";
    const vendorID = lead.vendorId?.vendorId?.toLowerCase() || "";

    const matchesSearch = clientName.includes(searchLower) ||
                          clientPhone.includes(searchLower) ||
                          vendorName.includes(searchLower) ||
                          vendorID.includes(searchLower);

    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  processedLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(processedLeads.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = processedLeads.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const checkMainScroll = () => {
        if (window.innerWidth > 768) {
            setShowMainScroll(false);
            return;
        }

        if (currentLeads.length <= 1) {
            setShowMainScroll(false);
            return;
        }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        const isScrollable = documentHeight > windowHeight + 80;
        const isNotAtBottom = scrollY + windowHeight < documentHeight - 30;

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
  }, [currentLeads, currentPage]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: token } };

      setLeads(prevLeads => prevLeads.map(lead => 
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      ));

      const res = await axios.put(
        `https://kalyanashobha-back.vercel.app/api/admin/vendor-leads/${leadId}/status`, 
        { status: newStatus }, 
        config
      );

      if (res.data.success) {
        window.dispatchEvent(new Event("vendorLeadUpdated"));
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update lead status.");
      fetchLeads(); 
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const SkeletonRow = () => (
    <tr className="avl-skeleton-row">
      <td data-label="Date">
        <div className="avl-skel-content">
          <div className="avl-skel-box avl-skel-date"></div>
        </div>
      </td>
      <td data-label="Client Details">
        <div className="avl-skel-content">
          <div className="avl-skel-box avl-skel-title"></div>
          <div className="avl-skel-box avl-skel-text"></div>
        </div>
      </td>
      <td data-label="Requested Vendor">
        <div className="avl-skel-content">
          <div className="avl-skel-box avl-skel-badge"></div>
          <div className="avl-skel-box avl-skel-title"></div>
          <div className="avl-skel-box avl-skel-text short"></div>
        </div>
      </td>
      <td data-label="Requirements">
        <div className="avl-skel-content">
          <div className="avl-skel-box avl-skel-desc"></div>
          <div className="avl-skel-box avl-skel-desc half"></div>
        </div>
      </td>
      <td data-label="Status Action">
        <div className="avl-skel-content">
          <div className="avl-skel-box avl-skel-status"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="avl-layout">
      {/* Header */}
      <div className="avl-header">
        <div className="avl-title-group">
          <h2>Vendor Inquiries</h2>
          <p>Manage and route user requests to premium vendors.</p>
        </div>
        <div className="avl-header-actions">
          <span className="avl-count-badge">
            {loading ? "..." : leads.length} Total Leads
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="avl-controls-group">
        <div className="avl-search-group">
          <Search size={18} />
          <input 
            type="text" 
            className="avl-search-input"
            placeholder="Search by client, phone, or vendor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="avl-filter-group">
          <Filter size={16} className="avl-filter-icon" />
          <select 
            className="avl-filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Forwarded">Forwarded</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="avl-error-banner">Error: {error}</div>}

      <div className="avl-data-card">
        <div className="avl-table-wrapper">
          <table className="avl-data-table">
            <thead>
              <tr>
                <th width="12%">Date</th>
                <th width="22%">Client Details</th>
                <th width="25%">Requested Vendor</th>
                <th width="31%">Requirements</th>
                <th width="10%" className="avl-text-right">Status Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, index) => <SkeletonRow key={index} />)
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="avl-empty-cell">
                    <div className="avl-state-view empty">
                        <Search size={48} />
                        <h3>No leads found</h3>
                        <p>{searchTerm || statusFilter !== "All" ? "No leads match your current filters." : "No vendor inquiries found yet."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td data-label="Date">
                        <span className="avl-date-text">{formatDate(lead.createdAt)}</span>
                    </td>

                    <td data-label="Client Details">
                        <div className="avl-info-stack">
                            <strong>{lead.name}</strong>
                            <span className="avl-text-muted">{lead.phone}</span>
                            {lead.email && <span className="avl-text-muted">{lead.email}</span>}
                        </div>
                    </td>

                    <td data-label="Requested Vendor">
                        <div className="avl-info-stack">
                            <span className="avl-vendor-id">{lead.vendorId?.vendorId || "N/A"}</span>
                            <strong>{lead.vendorId?.businessName || "Unknown Vendor"}</strong>
                            <span className="avl-vendor-category">{lead.vendorId?.category || "Service"}</span>
                            {lead.vendorId?.contactNumber && (
                                <span className="avl-vendor-contact">Ph: {lead.vendorId.contactNumber}</span>
                            )}
                        </div>
                    </td>

                    <td data-label="Requirements">
                        <div className="avl-message-box">
                            <p>{lead.message}</p>
                            <div className="avl-meta-tags">
                                {lead.weddingDate && <span>Event: {lead.weddingDate}</span>}
                                {lead.guestCount && <span>Guests: {lead.guestCount}</span>}
                            </div>
                        </div>
                    </td>

                    <td data-label="Status Action" className="avl-text-right">
                      <div className="avl-action-group">
                        <select 
                            value={lead.status} 
                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                            className={`avl-status-select status-${lead.status.toLowerCase()}`}
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Forwarded">Forwarded</option>
                            <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages >= 1 && (
            <div className="avl-pagination-container">
                <button 
                    className="avl-page-btn-circle" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={20} />
                </button>

                <span className="avl-page-text">
                    Page {currentPage} of {totalPages}
                </span>

                <button 
                    className="avl-page-btn-circle" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>

      {showMainScroll && (
          <div className="avl-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}
    </div>
  );
}

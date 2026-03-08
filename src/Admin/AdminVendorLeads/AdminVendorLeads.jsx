import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminVendorLeads.css";

export default function AdminVendorLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("adminToken"); 
      const config = { headers: { Authorization: token } };

      const res = await axios.get("https://kalyanashobha-back.vercel.app/api/admin/vendor-leads", config);

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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- Sub-component: Skeleton Row ---
  const SkeletonRow = () => (
    <tr className="v-skeleton-row">
      <td><div className="v-skel-box v-skel-date"></div></td>
      <td>
        <div className="v-skel-box v-skel-title"></div>
        <div className="v-skel-box v-skel-text"></div>
      </td>
      <td>
        <div className="v-skel-box v-skel-badge"></div>
        <div className="v-skel-box v-skel-title"></div>
        <div className="v-skel-box v-skel-text short"></div>
      </td>
      <td>
        <div className="v-skel-box v-skel-desc"></div>
        <div className="v-skel-box v-skel-desc half"></div>
      </td>
      <td><div className="v-skel-box v-skel-status"></div></td>
    </tr>
  );

  return (
    <div className="admin-leads-container">
      {/* Header */}
      <div className="admin-leads-header">
        <div>
          <h2>Vendor Inquiries</h2>
          <p>Manage and route user requests to premium vendors.</p>
        </div>
        <div className="admin-leads-actions">
          <span className="lead-count-badge">
            {loading ? "..." : leads.length} Total Leads
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && <div className="admin-error-banner">Error: {error}</div>}

      {/* Data Table */}
      <div className="admin-table-wrapper">
        <table className="admin-leads-table">
          <thead>
            <tr>
              <th width="12%">Date</th>
              <th width="22%">Client Details</th>
              <th width="25%">Requested Vendor</th>
              <th width="31%">Requirements</th>
              <th width="10%">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Show 5 skeleton rows while loading
              [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
            ) : leads.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="5" className="admin-empty-state">
                  No vendor inquiries found yet.
                </td>
              </tr>
            ) : (
              // Actual Data Rows
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td className="lead-date">{formatDate(lead.createdAt)}</td>
                  
                  <td className="lead-client">
                    <strong>{lead.name}</strong>
                    <span>{lead.phone}</span>
                    {lead.email && <span>{lead.email}</span>}
                  </td>
                  
                  <td className="lead-vendor">
                    <span className="vendor-custom-id">
                      {lead.vendorId?.vendorId || "N/A"}
                    </span>
                    <strong>{lead.vendorId?.businessName || "Unknown Vendor"}</strong>
                    <span className="vendor-category">{lead.vendorId?.category || "Service"}</span>
                    {lead.vendorId?.contactNumber && (
                       <span className="vendor-contact">Ph: {lead.vendorId.contactNumber}</span>
                    )}
                  </td>
                  
                  <td className="lead-message">
                    <p>{lead.message}</p>
                    <div className="lead-meta">
                      {lead.weddingDate && <span>Event Date: {lead.weddingDate}</span>}
                      {lead.guestCount && <span>Guests: {lead.guestCount}</span>}
                    </div>
                  </td>
                  
                  <td className="lead-status-cell">
                    <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

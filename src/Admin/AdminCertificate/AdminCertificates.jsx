import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js"; 
import './AdminCertificates.css'; 

const AdminCertificates = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; 

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "https://kalyanashobha-back.vercel.app/api/admin/users",
        { headers: { Authorization: token } }
      );
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (userId, userName) => {
    setProcessingId(userId);
    const loadToast = toast.loading("Downloading Certificate...");

    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        `https://kalyanashobha-back.vercel.app/api/admin/user-certificate/${userId}`,
        {
          headers: { Authorization: token },
          responseType: "text", 
        }
      );

      const element = document.createElement('div');
      element.innerHTML = response.data;
      element.style.width = '100%'; 
      
      const options = {
        margin:       [10, 10],
        filename:     `${userName.replace(/\s+/g, '_')}_Certificate.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(options).from(element).save();
      toast.success("Download started!");

    } catch (error) {
      console.error(error);
      toast.error("Error generating PDF");
    } finally {
      toast.dismiss(loadToast);
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const uniqueId = (user.uniqueId || "").toLowerCase();
    
    return fullName.includes(searchLower) || uniqueId.includes(searchLower);
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="admin-title">User Certificates</h2>
        
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Name or Profile ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div> Loading user data...
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Profile ID</th>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Legal Status</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user._id}>
                        <td style={{ fontWeight: "600" }}>{user.uniqueId || "N/A"}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td className="text-muted">{user.email}</td>
                        
                        <td>
                          {user.digitalSignature ? (
                            <span className="badge badge-signed">✓ Signed</span>
                          ) : (
                            <span className="badge badge-pending">Pending</span>
                          )}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          {user.digitalSignature ? (
                            <button
                              className="btn-download"
                              onClick={() => downloadCertificate(user._id, user.firstName)}
                              disabled={processingId === user._id}
                            >
                              {processingId === user._id ? (
                                <span>Generating...</span>
                              ) : (
                                <>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                  Download PDF
                                </>
                              )}
                            </button>
                          ) : (
                            <button className="btn-disabled" disabled>
                              Not Available
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px 20px", color: "#64748b" }}>
                        No users found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <span className="pagination-info">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                </span>
                
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-page">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button 
                    className="pagination-btn"
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;

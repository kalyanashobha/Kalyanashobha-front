import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Database, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DataApproval.css';

const DataApproval = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); 
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/pending-data";

    useEffect(() => {
        fetchPendingData();
    }, []);

    const fetchPendingData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(API_BASE, {
                headers: { Authorization: token } 
            });

            if (res.data.success) {
                setPendingItems(res.data.data);
                setCurrentPage(1); // Reset to page 1 on fresh fetch
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load pending data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (pendingId, action) => {
        setActionLoading(pendingId);
        const toastId = toast.loading(`Processing ${action}...`);

        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.post(`${API_BASE}/action`, 
                { pendingId, action },
                { headers: { Authorization: token } }
            );

            if (res.data.success) {
                toast.update(toastId, { render: `Successfully ${action}d!`, type: "success", isLoading: false, autoClose: 3000 });
                
                setPendingItems(prev => {
                    const updatedList = prev.filter(item => item._id !== pendingId);
                    
                    // Adjust pagination if we delete the last item on the current page
                    const newTotalPages = Math.ceil(updatedList.length / itemsPerPage);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    return updatedList;
                });
            }
        } catch (err) {
            toast.update(toastId, { render: err.response?.data?.message || `Failed to ${action} data.`, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setActionLoading(null);
        }
    };

    // Pagination Calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = pendingItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(pendingItems.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="kda-layout">
            <ToastContainer position="top-right" theme="colored" />
            
            <div className="kda-header">
                <div className="kda-title-group">
                    <h2>Master Data Approvals</h2>
                    <p>Review new dropdown entries submitted by users.</p>
                </div>
                <button className="kda-refresh-btn" onClick={fetchPendingData}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="kda-content">
                {isLoading ? (
                    <div className="kda-skeleton-stack">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="kda-skeleton-row">
                                <div className="kda-sk-box kda-sk-cat"></div>
                                <div className="kda-sk-box kda-sk-val"></div>
                                <div className="kda-sk-box kda-sk-user"></div>
                                <div className="kda-sk-box kda-sk-action"></div>
                            </div>
                        ))}
                    </div>
                ) : pendingItems.length === 0 ? (
                    <div className="kda-empty-state">
                        <div className="kda-empty-icon"><Database size={40} /></div>
                        <h3>No pending data</h3>
                        <p>There are no new dropdown entries to review right now.</p>
                    </div>
                ) : (
                    <>
                        <div className="kda-table-container">
                            <table className="kda-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>New Value</th>
                                        <th>Parent Category</th>
                                        <th>Submitted By</th>
                                        <th>Date</th>
                                        <th align="right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item) => (
                                        <tr key={item._id} className={actionLoading === item._id ? "kda-row-processing" : ""}>
                                            <td data-label="Category">
                                                <span className="kda-badge-category">{item.category}</span>
                                            </td>
                                            <td data-label="New Value" className="kda-fw-bold">
                                                {item.value}
                                            </td>
                                            <td data-label="Parent">
                                                {item.parentValue ? (
                                                    <span className="kda-text-muted">{item.parentValue}</span>
                                                ) : (
                                                    <span className="kda-text-muted">--</span>
                                                )}
                                            </td>
                                            <td data-label="Submitted By">
                                                <div className="kda-user-info">
                                                    <span className="kda-user-name">
                                                        {item.submittedBy ? `${item.submittedBy.firstName} ${item.submittedBy.lastName}` : "Unknown"}
                                                    </span>
                                                    {item.submittedBy?.uniqueId && (
                                                        <span className="kda-user-id">({item.submittedBy.uniqueId})</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td data-label="Date">
                                                <span className="kda-date-text">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td data-label="Actions" align="right">
                                                <div className="kda-actions">
                                                    <button 
                                                        className="kda-btn-approve"
                                                        onClick={() => handleAction(item._id, 'approve')}
                                                        disabled={actionLoading === item._id}
                                                        title="Approve"
                                                    >
                                                        {actionLoading === item._id ? <RefreshCw size={16} className="kda-spin" /> : <><Check size={16} /> Approve</>}
                                                    </button>
                                                    <button 
                                                        className="kda-btn-reject"
                                                        onClick={() => handleAction(item._id, 'reject')}
                                                        disabled={actionLoading === item._id}
                                                        title="Reject"
                                                    >
                                                        {actionLoading === item._id ? <RefreshCw size={16} className="kda-spin" /> : <X size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="kda-pagination-container">
                                <span className="kda-page-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, pendingItems.length)} of {pendingItems.length} entries
                                </span>
                                <div className="kda-pagination">
                                    <button 
                                        className="kda-page-btn" 
                                        onClick={() => paginate(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    
                                    <div className="kda-page-numbers">
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button 
                                                key={index + 1} 
                                                className={`kda-page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                                onClick={() => paginate(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        className="kda-page-btn" 
                                        onClick={() => paginate(currentPage + 1)} 
                                        disabled={currentPage === totalPages}
                                    >
                                        Next <ChevronRight size={16} />
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

export default DataApproval;

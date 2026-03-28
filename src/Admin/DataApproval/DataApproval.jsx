import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Database, ChevronLeft, ChevronRight, RefreshCw, Search, ChevronDown } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DataApproval.css';

const DataApproval = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); 
    
    // Search State
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Fixed 6 items for both Desktop and Mobile

    // Mobile Scroll Indicator State
    const [showMainScroll, setShowMainScroll] = useState(false);

    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/pending-data";

    useEffect(() => {
        fetchPendingData();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Scroll Indicator Logic
    useEffect(() => {
        const checkMainScroll = () => {
            if (pendingItems.length === 0) {
                setShowMainScroll(false);
                return;
            }
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            setShowMainScroll(documentHeight > windowHeight + 20 && scrollY + windowHeight < documentHeight - 30);
        };

        const timer = setTimeout(checkMainScroll, 500); 
        window.addEventListener('scroll', checkMainScroll);
        window.addEventListener('resize', checkMainScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', checkMainScroll);
            window.removeEventListener('resize', checkMainScroll);
        };
    }, [pendingItems, currentPage]);

    const fetchPendingData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(API_BASE, {
                headers: { Authorization: token } 
            });

            if (res.data.success) {
                setPendingItems(res.data.data);
                setCurrentPage(1); 
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load pending data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (pendingId, action) => {
        if (action === 'approve') {
            const currentItem = pendingItems.find(item => item._id === pendingId);
            
            if (currentItem && currentItem.parentValue) {
                const isParentStillPending = pendingItems.some(
                    pending => pending.value === currentItem.parentValue
                );

                if (isParentStillPending) {
                    toast.warning(`Please approve the parent element "${currentItem.parentValue}" first!`);
                    return; 
                }
            }
        }

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

    // Filter Logic
    const filteredItems = pendingItems.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        const val = (item.value || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const parent = (item.parentValue || '').toLowerCase();
        const fName = (item.submittedBy?.firstName || '').toLowerCase();
        const lName = (item.submittedBy?.lastName || '').toLowerCase();
        const uId = (item.submittedBy?.uniqueId || '').toLowerCase();

        return val.includes(searchStr) || cat.includes(searchStr) || parent.includes(searchStr) || fName.includes(searchStr) || lName.includes(searchStr) || uId.includes(searchStr);
    });

    // Pagination Calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="kda-layout">
            <ToastContainer position="top-right" theme="colored" />
            
            <div className="kda-header">
                <div className="kda-title-group">
                    <h2>Master Data Approvals</h2>
                    <p>Review new dropdown entries submitted by users.</p>
                </div>
                <div className="kda-controls-wrapper">
                    <div className="kda-search-group">
                        <Search size={16} className="kda-search-icon" />
                        <input 
                            type="text"
                            placeholder="Search category, value, or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="kda-search-input"
                        />
                    </div>
                    <button className="kda-refresh-btn" onClick={fetchPendingData}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className="kda-content">
                {isLoading ? (
                    <div className="kda-skeleton-stack">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="kda-skeleton-row">
                                <div className="kda-sk-box kda-sk-cat"></div>
                                <div className="kda-sk-box kda-sk-val"></div>
                                <div className="kda-sk-box kda-sk-user"></div>
                                <div className="kda-sk-box kda-sk-action"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="kda-empty-state">
                        <div className="kda-empty-icon"><Database size={40} /></div>
                        <h3>No pending data</h3>
                        <p>{searchTerm ? `No results match "${searchTerm}".` : "There are no new dropdown entries to review right now."}</p>
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
                                        <th className="kda-text-right">Actions</th>
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
                                                    <span className="kda-text-muted">-- None --</span>
                                                )}
                                            </td>
                                            <td data-label="Submitted By">
                                                <div className="kda-user-info">
                                                    <span className="kda-user-name">
                                                        {item.submittedBy ? `${item.submittedBy.firstName} ${item.submittedBy.lastName}` : "Unknown"}
                                                    </span>
                                                    {item.submittedBy?.uniqueId && (
                                                        <span className="kda-user-id">ID: {item.submittedBy.uniqueId}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td data-label="Date">
                                                <span className="kda-date-text">
                                                    {new Date(item.createdAt).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}
                                                </span>
                                            </td>
                                            <td data-label="Actions" className="kda-text-right">
                                                <div className="kda-actions">
                                                    <button 
                                                        className="kda-btn-approve"
                                                        onClick={() => handleAction(item._id, 'approve')}
                                                        disabled={actionLoading === item._id}
                                                        title="Approve"
                                                    >
                                                        {actionLoading === item._id ? <RefreshCw size={16} className="kda-spin" /> : <><Check size={16} strokeWidth={3} /> Approve</>}
                                                    </button>
                                                    <button 
                                                        className="kda-btn-reject"
                                                        onClick={() => handleAction(item._id, 'reject')}
                                                        disabled={actionLoading === item._id}
                                                        title="Reject"
                                                    >
                                                        {actionLoading === item._id ? <RefreshCw size={16} className="kda-spin" /> : <X size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* NEW CIRCULAR PAGINATION DESIGN */}
                        {totalPages > 1 && (
                            <div className="kda-pagination-container">
                                <button 
                                    className="kda-page-btn-circle" 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <span className="kda-page-text">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button 
                                    className="kda-page-btn-circle" 
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

            {/* SCROLL INDICATOR */}
            {showMainScroll && (
                <div className="kda-scroll-indicator">
                    <ChevronDown size={18} />
                    <span>Scroll for more</span>
                </div>
            )}
        </div>
    );
};

export default DataApproval;

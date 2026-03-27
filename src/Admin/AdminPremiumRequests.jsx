import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// --- ICONS ---
const Icons = {
  Crown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 15 7 10 12 16 17 10 22 15 22 20 2 20 2 15"></polygon><line x1="2" y1="20" x2="22" y2="20"></line></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

const AdminPremiumRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const API_URL = "https://kalyanashobha-back.vercel.app/api/admin";
    const token = localStorage.getItem('adminToken'); 

    useEffect(() => {
        fetchRequests();
    }, []);

    // Reset pagination when search or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/premium-requests`, {
                headers: { 'Authorization': token }
            });
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            } else {
                toast.error(data.message || "Failed to fetch requests.");
            }
        } catch (error) {
            toast.error("Network error fetching requests.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        setProcessingId(id);
        try {
            const res = await fetch(`${API_URL}/premium-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success(`Request marked as ${newStatus}`);
                setRequests(prev => prev.map(req => 
                    req._id === id ? { ...req, status: newStatus } : req
                ));
                window.dispatchEvent(new Event('premiumUpdated'));
            } else {
                toast.error(data.message || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Network error while updating.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeTab !== 'All' && req.status !== activeTab) return false;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const fullName = `${req.userId?.firstName || ''} ${req.userId?.lastName || ''}`.toLowerCase();
            const email = (req.userId?.email || '').toLowerCase();
            const phone = (req.userId?.mobileNumber || '').toLowerCase();
            const uniqueId = (req.userId?.uniqueId || '').toLowerCase();

            if (!fullName.includes(term) && !email.includes(term) && !phone.includes(term) && !uniqueId.includes(term)) {
                return false;
            }
        }
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const StatusBadge = ({ status }) => {
        let style = {};
        let Icon = null;

        switch(status) {
            case 'Pending':
                style = { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
                Icon = Icons.Clock;
                break;
            case 'Contacted':
                style = { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' };
                Icon = Icons.Phone;
                break;
            case 'Resolved':
                style = { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
                Icon = Icons.Check;
                break;
            default:
                style = { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
        }

        return (
            <span className="apr-status-badge" style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                {Icon && <span className="apr-badge-icon"><Icon /></span>}
                {status}
            </span>
        );
    };

    return (
        <div className="apr-layout">
            <Toaster position="top-right" />
            
            {/* INTERNAL CSS FOR PREMIUM STYLING */}
            <style>{`
                /* --- VARIABLES --- */
                .apr-layout {
                    --apr-primary: #4f46e5;
                    --apr-primary-dark: #4338ca;
                    --apr-bg: #f8fafc;
                    --apr-card-bg: #ffffff;
                    --apr-text-main: #0f172a;
                    --apr-text-sub: #64748b;
                    --apr-border: #e2e8f0;
                    --apr-border-hover: #cbd5e1;
                    --apr-radius: 12px;
                    --apr-radius-sm: 8px;
                    --apr-shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.05);
                    --apr-shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
                    --apr-anim: 0.25s cubic-bezier(0.4, 0, 0.2, 1);

                    padding: 32px;
                    background-color: var(--apr-bg);
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    color: var(--apr-text-main);
                    box-sizing: border-box;
                }

                /* --- HEADER --- */
                .apr-header {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .apr-title-group h2 {
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    margin: 0 0 4px 0;
                    color: var(--apr-text-main);
                }
                .apr-title-group p {
                    color: var(--apr-text-sub);
                    margin: 0;
                    font-size: 15px;
                }

                /* --- CONTROLS --- */
                .apr-controls-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    justify-content: space-between;
                    align-items: center;
                }
                .apr-search-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 250px;
                    max-width: 400px;
                }
                .apr-search-group svg {
                    position: absolute;
                    left: 14px;
                    color: #94a3b8;
                }
                .apr-search-input {
                    width: 100%;
                    padding: 12px 16px 12px 40px;
                    border: 1px solid var(--apr-border);
                    border-radius: var(--apr-radius-sm);
                    outline: none;
                    font-size: 14px;
                    box-shadow: var(--apr-shadow-sm);
                    transition: var(--apr-anim);
                    box-sizing: border-box;
                }
                .apr-search-input:focus {
                    border-color: var(--apr-primary);
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }

                /* --- TABS --- */
                .apr-tabs-wrapper {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 10px;
                    gap: 4px;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .apr-tabs-wrapper::-webkit-scrollbar { display: none; }
                .apr-tab-button {
                    flex-shrink: 0;
                    background: transparent;
                    border: none;
                    padding: 8px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--apr-text-sub);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                    transition: var(--apr-anim);
                }
                .apr-tab-button:hover { color: var(--apr-text-main); }
                .apr-tab-button.active {
                    background: var(--apr-card-bg);
                    color: var(--apr-text-main);
                    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
                }
                .apr-tab-count {
                    background: #e2e8f0;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                }
                .apr-tab-button.active .apr-tab-count {
                    background: #dbeafe;
                    color: #1e40af;
                }

                /* --- DATA TABLE --- */
                .apr-data-card {
                    background: var(--apr-card-bg);
                    border: 1px solid var(--apr-border);
                    border-radius: var(--apr-radius);
                    box-shadow: var(--apr-shadow-md);
                    overflow: hidden;
                }
                .apr-table-wrapper { width: 100%; overflow-x: auto; }
                .apr-data-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    min-width: 850px;
                }
                .apr-data-table th {
                    background: #f8fafc;
                    padding: 16px 24px;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: var(--apr-text-sub);
                    font-weight: 700;
                    border-bottom: 1px solid var(--apr-border);
                }
                .apr-data-table td {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }
                .apr-data-table tr:last-child td { border-bottom: none; }
                .apr-data-table tr:hover td { background: #f8fafc; }

                /* Cell Text */
                .apr-info-stack { display: flex; flex-direction: column; gap: 4px; }
                .apr-info-stack strong { font-size: 14px; font-weight: 600; color: var(--apr-text-main); }
                .apr-text-muted { font-size: 13px; color: var(--apr-text-sub); font-family: 'Monaco', monospace;}
                .apr-text-small { font-size: 14px; color: var(--apr-text-main); font-weight: 500; display: block;}

                /* Badges */
                .apr-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .apr-badge-icon svg { width: 14px; height: 14px; }

                /* Actions */
                .apr-action-group { display: flex; justify-content: flex-end; gap: 10px; }
                .apr-btn {
                    padding: 8px 16px;
                    border-radius: var(--apr-radius-sm);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: var(--apr-anim);
                    white-space: nowrap;
                }
                .apr-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .apr-btn-primary { background: #eff6ff; color: var(--apr-primary-dark); }
                .apr-btn-primary:hover:not(:disabled) { background: #dbeafe; transform: translateY(-1px); }
                .apr-btn-success { background: #059669; color: #ffffff; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2); }
                .apr-btn-success:hover:not(:disabled) { background: #047857; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3); }
                .apr-status-done { color: #94a3b8; font-size: 13px; font-weight: 600; padding-right: 8px; text-transform: uppercase;}

                /* --- PAGINATION --- */
                .apr-pagination-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-top: 1px solid var(--apr-border);
                    background: #f8fafc;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .apr-pagination-text { font-size: 13px; color: var(--apr-text-sub); }
                .apr-pagination-controls { display: flex; gap: 8px; }
                .apr-page-btn {
                    display: flex; align-items: center; justify-content: center;
                    min-width: 36px; height: 36px;
                    border: 1px solid transparent;
                    background: white;
                    border-radius: 6px;
                    color: var(--apr-text-sub);
                    font-size: 13px; font-weight: 600;
                    cursor: pointer;
                    transition: var(--apr-anim);
                }
                .apr-page-btn:hover:not(:disabled) { background: #f1f5f9; color: var(--apr-text-main); }
                .apr-page-btn.active { background: var(--apr-primary); color: white; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }
                .apr-page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: transparent; }

                /* --- STATE VIEWS --- */
                .apr-state-view {
                    padding: 60px 24px;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    color: var(--apr-text-sub); gap: 16px;
                }
                .apr-state-view.empty svg { width: 48px; height: 48px; color: #cbd5e1; }
                .apr-state-view h3 { margin: 0; color: var(--apr-text-main); font-size: 18px; }
                .apr-spinner {
                    width: 32px; height: 32px;
                    border: 3px solid var(--apr-border);
                    border-top-color: var(--apr-primary);
                    border-radius: 50%;
                    animation: apr-spin 1s linear infinite;
                }
                @keyframes apr-spin { to { transform: rotate(360deg); } }

                /* =========================================================
                   MOBILE RESPONSIVENESS (PERFECT ALIGNMENT & SMALLER FONTS)
                   ========================================================= */
                @media (max-width: 768px) {
                    .apr-layout { padding: 16px; }
                    
                    /* Header & Controls */
                    .apr-title-group h2 { font-size: 20px; }
                    .apr-title-group p { font-size: 13px; }
                    .apr-controls-group { flex-direction: column; align-items: stretch; }
                    .apr-search-group { max-width: 100%; }
                    .apr-tab-button { padding: 6px 16px; font-size: 12px; }

                    /* Table to Cards */
                    .apr-data-table thead { display: none; }
                    .apr-data-card { background: transparent; border: none; box-shadow: none; }
                    
                    .apr-data-table, .apr-data-table tbody, .apr-data-table tr, .apr-data-table td {
                        display: block; width: 100%; box-sizing: border-box;
                    }
                    
                    .apr-data-table tr {
                        margin-bottom: 16px;
                        background: var(--apr-card-bg);
                        border: 1px solid var(--apr-border);
                        border-radius: 16px;
                        padding: 16px;
                        box-shadow: var(--apr-shadow-sm);
                    }
                    
                    .apr-data-table td {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 12px 0;
                        border-bottom: 1px dashed var(--apr-border);
                        text-align: right;
                        word-break: break-word;
                    }
                    
                    .apr-data-table td:last-child { border-bottom: none; padding-bottom: 0; }
                    .apr-data-table td[data-label="Actions"] { padding-top: 16px; margin-top: 4px; align-items: center; }
                    
                    .apr-data-table td::before {
                        content: attr(data-label);
                        font-size: 11px;
                        font-weight: 700;
                        color: var(--apr-text-sub);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-right: 12px;
                        flex-shrink: 0;
                        margin-top: 2px;
                        max-width: 100px;
                        text-align: left;
                    }

                    /* FIX: Cell Alignment Adjustments */
                    .apr-info-stack { 
                        align-items: flex-end; 
                        text-align: right; 
                        width: calc(100% - 110px); /* Forces it to fill space next to label */
                    }
                    .apr-info-stack strong { font-size: 13px; line-height: 1.4;}
                    .apr-text-muted { font-size: 11px; }
                    
                    .apr-text-small { 
                        font-size: 13px; 
                        text-align: right; 
                        width: calc(100% - 110px); /* Prevents overflow issues */
                        line-height: 1.4; 
                    }

                    .apr-status-badge { font-size: 10px; padding: 4px 10px; }
                    
                    .apr-action-group { width: 100%; justify-content: flex-end; }
                    .apr-btn { font-size: 12px; padding: 6px 12px; }
                    
                    /* Pagination Stack */
                    .apr-pagination-bar {
                        flex-direction: column;
                        border-radius: 16px;
                        border: 1px solid var(--apr-border);
                        padding: 16px;
                        box-shadow: var(--apr-shadow-sm);
                        gap: 16px;
                    }
                }
            `}</style>

            <div className="apr-header">
                <div className="apr-title-group">
                    <h2>Premium Upgrades</h2>
                    <p>Manage users requesting personalized premium assistance.</p>
                </div>

                <div className="apr-controls-group">
                    <div className="apr-search-group">
                        <Icons.Search />
                        <input 
                            className="apr-search-input"
                            type="text" 
                            placeholder="Search name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="apr-tabs-wrapper">
                        {['All', 'Pending', 'Contacted', 'Resolved'].map(tab => (
                            <button 
                                key={tab}
                                className={`apr-tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {tab !== 'All' && (
                                    <span className="apr-tab-count">
                                        {requests.filter(r => r.status === tab).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="apr-data-card">
                {loading ? (
                    <div className="apr-state-view">
                        <span className="apr-spinner"></span>
                        Loading requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="apr-state-view empty">
                        <Icons.Crown />
                        <h3>No requests found</h3>
                        <p>
                            {searchTerm 
                                ? `No results match "${searchTerm}" in the ${activeTab} tab.` 
                                : `There are currently no ${activeTab !== 'All' ? activeTab.toLowerCase() : ''} premium requests.`
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="apr-table-wrapper">
                            <table className="apr-data-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Contact Info</th>
                                        <th>Location</th>
                                        <th>Request Date</th>
                                        <th>Status</th>
                                        <th style={{textAlign: 'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((req) => (
                                        <tr key={req._id}>
                                            <td data-label="User Details">
                                                <div className="apr-info-stack">
                                                    <strong>{req.userId?.firstName} {req.userId?.lastName}</strong>
                                                    <span className="apr-text-muted">{req.userId?.uniqueId}</span>
                                                </div>
                                            </td>
                                            <td data-label="Contact Info">
                                                <div className="apr-info-stack">
                                                    <span className="apr-text-small">{req.userId?.mobileNumber}</span>
                                                    <span className="apr-text-muted">{req.userId?.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="Location">
                                                <span className="apr-text-small">{req.userId?.city}, {req.userId?.state}</span>
                                            </td>
                                            <td data-label="Request Date">
                                                <span className="apr-text-small">{formatDate(req.requestDate)}</span>
                                            </td>
                                            <td data-label="Status">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td data-label="Actions">
                                                <div className="apr-action-group">
                                                    {req.status === 'Pending' && (
                                                        <button 
                                                            className="apr-btn apr-btn-primary"
                                                            onClick={() => updateStatus(req._id, 'Contacted')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Contacted'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Contacted' && (
                                                        <button 
                                                            className="apr-btn apr-btn-success"
                                                            onClick={() => updateStatus(req._id, 'Resolved')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Resolved'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Resolved' && (
                                                        <span className="apr-status-done">Done</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="apr-pagination-bar">
                                <span className="apr-pagination-text">
                                    Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredRequests.length)}</strong> of <strong>{filteredRequests.length}</strong>
                                </span>
                                <div className="apr-pagination-controls">
                                    <button 
                                        className="apr-page-btn" 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <Icons.ChevronLeft />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button 
                                            key={index + 1}
                                            className={`apr-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="apr-page-btn" 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <Icons.ChevronRight />
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

export default AdminPremiumRequests;

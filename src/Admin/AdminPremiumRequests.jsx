import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './PremiumRequests.css'; // <-- External CSS imported here

// --- ICONS ---
const Icons = {
  Crown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 15 7 10 12 16 17 10 22 15 22 20 2 20 2 15"></polygon><line x1="2" y1="20" x2="22" y2="20"></line></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  ChevronDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
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

    // Mobile Scroll Indicator State
    const [showMainScroll, setShowMainScroll] = useState(false);

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

    // Scroll Indicator Logic
    useEffect(() => {
        const checkMainScroll = () => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            setShowMainScroll(documentHeight > windowHeight + 10 && scrollY + windowHeight < documentHeight - 60);
        };

        const timer = setTimeout(checkMainScroll, 500); 
        window.addEventListener('scroll', checkMainScroll);
        window.addEventListener('resize', checkMainScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', checkMainScroll);
            window.removeEventListener('resize', checkMainScroll);
        };
    }, [currentItems, activeTab]);

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
            <span className="apr-status-badge" style={{
                backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`
            }}>
                {Icon && <span className="apr-badge-icon"><Icon /></span>}
                {status}
            </span>
        );
    };

    return (
        <div className="apr-layout">
            <Toaster position="top-right" />
            
            <div className="apr-header">
                <div className="apr-title-group">
                    <div className="apr-header-text">
                        <h2>Premium Upgrades</h2>
                        <p>Manage users requesting personalized premium assistance.</p>
                    </div>
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
                                        <th className="apr-text-right">Actions</th>
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
                                            <td data-label="Actions" className="apr-text-right">
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
            
            {/* MOBILE SCROLL INDICATOR */}
            {showMainScroll && (
                <div className="apr-scroll-indicator">
                    <Icons.ChevronDown />
                    <span>Scroll for more</span>
                </div>
            )}
        </div>
    );
};

export default AdminPremiumRequests;

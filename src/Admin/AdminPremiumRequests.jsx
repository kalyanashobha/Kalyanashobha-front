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
            <span className="admin-status-badge" style={{
                backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`
            }}>
                {Icon && <span className="admin-badge-icon"><Icon /></span>}
                {status}
            </span>
        );
    };

    return (
        <div className="admin-layout-container" id="premium-requests-root">
            <Toaster position="top-right" />
            
            <style>{`
                .admin-layout-container {
                    --pr-primary: #4f46e5;
                    --pr-primary-dark: #4338ca;
                    --pr-bg: #f8fafc;
                    --pr-card-bg: #ffffff;
                    --pr-text-main: #0f172a;
                    --pr-text-sub: #64748b;
                    --pr-border: #e2e8f0;
                    --pr-border-hover: #cbd5e1;
                    --pr-radius: 12px;
                    --pr-radius-sm: 8px;
                    --pr-shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.05);
                    --pr-shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
                    --pr-anim: 0.25s cubic-bezier(0.4, 0, 0.2, 1);

                    padding: 32px !important;
                    background-color: var(--pr-bg) !important;
                    min-height: 100vh !important;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    color: var(--pr-text-main) !important;
                    box-sizing: border-box !important;
                }

                /* Header Styles */
                .admin-header {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 20px !important;
                    margin-bottom: 24px !important;
                }
                .admin-header-title-group {
                    display: flex !important;
                    align-items: center !important;
                    gap: 16px !important;
                }
                .admin-header-text h2 {
                    font-size: 26px !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.5px !important;
                    margin: 0 0 4px 0 !important;
                    color: var(--pr-text-main) !important;
                }
                .admin-header-text p {
                    color: var(--pr-text-sub) !important;
                    margin: 0 !important;
                    font-size: 15px !important;
                }

                /* Controls (Search & Tabs) */
                .admin-controls-group {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 16px !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                }
                .admin-search-group {
                    position: relative !important;
                    display: flex !important;
                    align-items: center !important;
                    flex: 1 !important;
                    min-width: 250px !important;
                    max-width: 400px !important;
                }
                .admin-search-group svg {
                    position: absolute !important;
                    left: 14px !important;
                    color: #94a3b8 !important;
                }
                .admin-search-input {
                    width: 100% !important;
                    padding: 12px 16px 12px 40px !important;
                    border: 1px solid var(--pr-border) !important;
                    border-radius: var(--pr-radius-sm) !important;
                    outline: none !important;
                    font-size: 14px !important;
                    box-shadow: var(--pr-shadow-sm) !important;
                    transition: var(--pr-anim) !important;
                    box-sizing: border-box !important;
                }
                .admin-search-input:focus {
                    border-color: var(--pr-primary) !important;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
                }

                /* TABS SCROLLING */
                .admin-tabs-wrapper {
                    display: flex !important;
                    background: #f1f5f9 !important;
                    padding: 4px !important;
                    border-radius: 10px !important;
                    gap: 4px !important;
                    overflow-x: auto !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    -webkit-overflow-scrolling: touch !important;
                }
                .admin-tabs-wrapper::-webkit-scrollbar { display: none !important; }
                
                .admin-tab-button {
                    flex-shrink: 0 !important;
                    background: transparent !important;
                    border: none !important;
                    padding: 8px 24px !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    color: var(--pr-text-sub) !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    white-space: nowrap !important;
                    transition: var(--pr-anim) !important;
                }
                .admin-tab-button:hover { color: var(--pr-text-main) !important; }
                .admin-tab-button.active {
                    background: var(--pr-card-bg) !important;
                    color: var(--pr-text-main) !important;
                    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1) !important;
                }
                .admin-tab-count {
                    background: #e2e8f0 !important;
                    padding: 2px 8px !important;
                    border-radius: 12px !important;
                    font-size: 11px !important;
                }
                .admin-tab-button.active .admin-tab-count {
                    background: #dbeafe !important;
                    color: #1e40af !important;
                }

                /* Table Styles */
                .admin-data-card {
                    background: var(--pr-card-bg) !important;
                    border: 1px solid var(--pr-border) !important;
                    border-radius: var(--pr-radius) !important;
                    box-shadow: var(--pr-shadow-md) !important;
                    overflow: hidden !important;
                }
                .admin-table-wrapper {
                    width: 100% !important;
                    overflow-x: auto !important;
                }
                .admin-data-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    text-align: left !important;
                    min-width: 850px !important;
                }
                .admin-data-table th {
                    background: #f8fafc !important;
                    padding: 16px 24px !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.8px !important;
                    color: var(--pr-text-sub) !important;
                    font-weight: 700 !important;
                    border-bottom: 1px solid var(--pr-border) !important;
                }
                .admin-data-table td {
                    padding: 20px 24px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                }
                .admin-data-table tr:last-child td { border-bottom: none !important; }
                .admin-data-table tr:hover td { background: #f8fafc !important; }
                
                .admin-info-stack {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 4px !important;
                }
                .admin-info-stack strong { font-size: 14px !important; font-weight: 600 !important; color: var(--pr-text-main) !important; }
                .admin-text-muted { font-size: 13px !important; color: var(--pr-text-sub) !important; font-family: 'Monaco', monospace !important;}
                .admin-text-small { font-size: 14px !important; color: var(--pr-text-main) !important; font-weight: 500 !important;}
                .admin-text-right { text-align: right !important; }

                /* Badges & Buttons */
                .admin-status-badge {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 6px 12px !important;
                    border-radius: 20px !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .admin-badge-icon svg { width: 14px !important; height: 14px !important; }
                
                .admin-action-group {
                    display: flex !important;
                    justify-content: flex-end !important;
                    gap: 10px !important;
                }
                .admin-btn {
                    padding: 8px 16px !important;
                    border-radius: var(--pr-radius-sm) !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    border: none !important;
                    transition: var(--pr-anim) !important;
                    white-space: nowrap !important;
                }
                .admin-btn:disabled { opacity: 0.6 !important; cursor: not-allowed !important; }
                
                .admin-btn-primary { background: #eff6ff !important; color: var(--pr-primary-dark) !important; }
                .admin-btn-primary:hover:not(:disabled) { background: #dbeafe !important; transform: translateY(-1px) !important; }
                
                .admin-btn-success { background: #059669 !important; color: #ffffff !important; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2) !important; }
                .admin-btn-success:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px) !important; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3) !important; }
                
                .admin-status-done { color: #94a3b8 !important; font-size: 13px !important; font-weight: 600 !important; padding-right: 8px !important; text-transform: uppercase !important;}

                /* Pagination */
                .admin-pagination-bar {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    padding: 16px 24px !important;
                    border-top: 1px solid var(--pr-border) !important;
                    background: #f8fafc !important;
                    flex-wrap: wrap !important;
                    gap: 16px !important;
                }
                .admin-pagination-text { font-size: 13px !important; color: var(--pr-text-sub) !important; }
                .admin-pagination-controls { display: flex !important; gap: 8px !important; }
                .admin-page-btn {
                    display: flex !important; align-items: center !important; justify-content: center !important;
                    min-width: 36px !important; height: 36px !important;
                    border: 1px solid transparent !important;
                    background: white !important;
                    border-radius: 6px !important;
                    color: var(--pr-text-sub) !important;
                    font-size: 13px !important; font-weight: 600 !important;
                    cursor: pointer !important;
                    transition: var(--pr-anim) !important;
                }
                .admin-page-btn:hover:not(:disabled) { background: #f1f5f9 !important; color: var(--pr-text-main) !important; }
                .admin-page-btn.active { background: var(--pr-primary) !important; color: white !important; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2) !important; }
                .admin-page-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; background: transparent !important; }

                /* Loading & Empty States */
                .admin-state-view {
                    padding: 60px 24px !important;
                    display: flex !important; flex-direction: column !important;
                    align-items: center !important; justify-content: center !important;
                    color: var(--pr-text-sub) !important; gap: 16px !important;
                }
                .admin-state-view.empty svg { width: 48px !important; height: 48px !important; color: #cbd5e1 !important; }
                .admin-state-view h3 { margin: 0 !important; color: var(--pr-text-main) !important; font-size: 18px !important; }
                .admin-spinner {
                    width: 32px !important; height: 32px !important;
                    border: 3px solid var(--pr-border) !important;
                    border-top-color: var(--pr-primary) !important;
                    border-radius: 50% !important;
                    animation: apr-spin 1s linear infinite !important;
                }
                @keyframes apr-spin { to { transform: rotate(360deg) !important; } }

                /* --- SCROLL INDICATOR UI --- */
                .admin-scroll-indicator {
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

                /* =========================================================
                   MOBILE RESPONSIVENESS (PERFECT ALIGNMENT & CLEAN CARDS)
                   ========================================================= */
                @media (max-width: 768px) {
                    .admin-layout-container { padding: 16px !important; }
                    
                    /* Show scroll indicator on mobile */
                    .admin-scroll-indicator { display: flex !important; }

                    /* Header & Controls */
                    .admin-header-text h2 { font-size: 22px !important; }
                    .admin-header-text p { font-size: 14px !important; }
                    .admin-controls-group { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
                    .admin-search-group { max-width: 100% !important; width: 100% !important; }
                    .admin-tab-button { padding: 8px 16px !important; font-size: 13px !important; }

                    /* Table to Clean Cards Transformation */
                    .admin-data-table thead { display: none !important; }
                    
                    /* Remove background from table container so cards stand out */
                    .admin-data-card { background: transparent !important; border: none !important; box-shadow: none !important; }
                    
                    .admin-data-table, .admin-data-table tbody, .admin-data-table tr, .admin-data-table td {
                        display: block !important; width: 100% !important; box-sizing: border-box !important;
                    }
                    
                    /* Individual Card Wrapper Styling */
                    .admin-data-table tr {
                        margin-bottom: 16px !important;
                        background: var(--pr-card-bg) !important;
                        border: 1px solid var(--pr-border) !important;
                        border-radius: var(--pr-radius) !important;
                        box-shadow: var(--pr-shadow-sm) !important;
                        overflow: hidden !important; 
                    }
                    
                    /* Cell Layout - Flexbox fixes overlap and squishing */
                    .admin-data-table td {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important; 
                        padding: 14px 16px !important;
                        border-bottom: 1px solid var(--pr-border) !important;
                        text-align: right !important;
                        gap: 12px !important;
                    }
                    
                    /* Distinct area for action buttons */
                    .admin-data-table td:last-child { 
                        border-bottom: none !important; 
                        background-color: #f8fafc !important; 
                    }
                    
                    /* Mobile Labels */
                    .admin-data-table td::before {
                        content: attr(data-label) !important;
                        font-size: 12px !important;
                        font-weight: 600 !important;
                        color: var(--pr-text-sub) !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.5px !important;
                        flex-shrink: 0 !important;
                        text-align: left !important;
                    }

                    /* Content Alignment */
                    .admin-info-stack { 
                        align-items: flex-end !important; 
                        text-align: right !important; 
                        margin: 0 !important;
                        width: auto !important; 
                    }
                    
                    .admin-info-stack strong { font-size: 14px !important; }
                    .admin-text-muted { font-size: 12px !important; }
                    .admin-text-small { font-size: 14px !important; }

                    .admin-status-badge { font-size: 11px !important; padding: 4px 10px !important; }
                    
                    .admin-action-group { width: 100% !important; justify-content: flex-end !important; }
                    .admin-btn { font-size: 13px !important; padding: 8px 16px !important; }
                    
                    /* Pagination Stack */
                    .admin-pagination-bar {
                        flex-direction: column !important;
                        border-radius: var(--pr-radius) !important;
                        border: 1px solid var(--pr-border) !important;
                        padding: 16px !important;
                        box-shadow: var(--pr-shadow-sm) !important;
                        gap: 16px !important;
                        background: var(--pr-card-bg) !important;
                    }
                }
            `}</style>

            <div className="admin-header">
                <div className="admin-header-title-group">
                    <div className="admin-header-text">
                        <h2>Premium Upgrades</h2>
                        <p>Manage users requesting personalized premium assistance.</p>
                    </div>
                </div>

                <div className="admin-controls-group">
                    <div className="admin-search-group">
                        <Icons.Search />
                        <input 
                            id="premium-search-input"
                            className="admin-search-input"
                            type="text" 
                            placeholder="Search name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="admin-tabs-wrapper">
                        {['All', 'Pending', 'Contacted', 'Resolved'].map(tab => (
                            <button 
                                key={tab}
                                id={`filter-tab-${tab.toLowerCase()}`}
                                className={`admin-tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                                {tab !== 'All' && (
                                    <span className="admin-tab-count">
                                        {requests.filter(r => r.status === tab).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-data-card" id="premium-data-view">
                {loading ? (
                    <div className="admin-state-view">
                        <span className="admin-spinner"></span>
                        Loading requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="admin-state-view empty">
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
                        <div className="admin-table-wrapper">
                            <table className="admin-data-table">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Contact Info</th>
                                        <th>Location</th>
                                        <th>Request Date</th>
                                        <th>Status</th>
                                        <th className="admin-text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((req) => (
                                        <tr key={req._id}>
                                            <td data-label="User Details">
                                                <div className="admin-info-stack">
                                                    <strong>{req.userId?.firstName} {req.userId?.lastName}</strong>
                                                    <span className="admin-text-muted">{req.userId?.uniqueId}</span>
                                                </div>
                                            </td>
                                            <td data-label="Contact Info">
                                                <div className="admin-info-stack">
                                                    <span className="admin-text-small">{req.userId?.mobileNumber}</span>
                                                    <span className="admin-text-muted">{req.userId?.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="Location">
                                                <span className="admin-text-small">{req.userId?.city}, {req.userId?.state}</span>
                                            </td>
                                            <td data-label="Request Date">
                                                <span className="admin-text-small">{formatDate(req.requestDate)}</span>
                                            </td>
                                            <td data-label="Status">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td data-label="Actions" className="admin-text-right">
                                                <div className="admin-action-group">
                                                    {req.status === 'Pending' && (
                                                        <button 
                                                            className="admin-btn admin-btn-primary"
                                                            onClick={() => updateStatus(req._id, 'Contacted')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Contacted'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Contacted' && (
                                                        <button 
                                                            className="admin-btn admin-btn-success"
                                                            onClick={() => updateStatus(req._id, 'Resolved')}
                                                            disabled={processingId === req._id}
                                                        >
                                                            {processingId === req._id ? 'Processing...' : 'Mark Resolved'}
                                                        </button>
                                                    )}
                                                    {req.status === 'Resolved' && (
                                                        <span className="admin-status-done">Done</span>
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
                            <div className="admin-pagination-bar">
                                <span className="admin-pagination-text">
                                    Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredRequests.length)}</strong> of <strong>{filteredRequests.length}</strong>
                                </span>
                                <div className="admin-pagination-controls">
                                    <button 
                                        className="admin-page-btn" 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <Icons.ChevronLeft />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button 
                                            key={index + 1}
                                            className={`admin-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="admin-page-btn" 
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
            
            {/* NEW MOBILE SCROLL INDICATOR */}
            {showMainScroll && (
                <div className="admin-scroll-indicator">
                    <Icons.ChevronDown />
                    <span>Scroll for more</span>
                </div>
            )}
        </div>
    );
};

export default AdminPremiumRequests;

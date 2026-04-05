import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const UserList = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Agent Dropdown States
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('');

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); 

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 5;

    // Scroll Indicator State
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

    const API_BASE_URL = 'https://kalyanashobha-back.vercel.app';

    // 1. Fetch Agents for the Dropdown
    const fetchAgents = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/agents`, {
                method: 'GET',
                headers: { 'Authorization': token }
            });
            const data = await response.json();
            if (data.success) {
                // Adjust based on how your agent API returns data (e.g., data.agents or data.data)
                setAgents(data.agents || data.data || []);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
            toast.error("Failed to load agents list");
        }
    };

    // 2. Fetch Resolved Users (Dynamic based on selected agent)
    const fetchResolvedUsers = async (agentId = '') => {
        setLoading(true);
        const token = localStorage.getItem('adminToken'); 

        try {
            // Determine URL based on whether an agent is selected
            const endpoint = agentId 
                ? `${API_BASE_URL}/api/admin/agents/${agentId}/premium-resolved`
                : `${API_BASE_URL}/api/admin/premium-requests/resolved`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token 
                }
            });

            const data = await response.json();

            if (data.success) {
                setAllRequests(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch premium users');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error('Server error while fetching premium users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Agents and Users on initial mount
    useEffect(() => {
        fetchAgents();
        fetchResolvedUsers();
    }, []);

    // Scroll Listener for the Mobile Indicator
    useEffect(() => {
        const handleScroll = () => {
            // Hide the indicator if the user scrolls down more than 50px
            if (window.scrollY > 50) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handlers
    const handleAgentChange = (e) => {
        const newAgentId = e.target.value;
        setSelectedAgent(newAgentId);
        setCurrentPage(1); // Reset pagination
        setSearchInput(''); // Clear search text when switching agents
        setSearchQuery('');
        fetchResolvedUsers(newAgentId);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        setSearchQuery(searchInput);
        if (searchInput) {
            toast.success(`Showing results for "${searchInput}"`);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // 3. Client-Side Search Filtering & Validation
    const filteredRequests = useMemo(() => {
        const validRequests = allRequests.filter(req => req.userId);

        if (!searchQuery) return validRequests;

        const lowerSearch = searchQuery.toLowerCase();
        return validRequests.filter(req => {
            const user = req.userId;
            return (
                (user.firstName && user.firstName.toLowerCase().includes(lowerSearch)) ||
                (user.lastName && user.lastName.toLowerCase().includes(lowerSearch)) ||
                (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
                (user.mobileNumber && user.mobileNumber.toLowerCase().includes(lowerSearch)) ||
                (user.uniqueId && user.uniqueId.toLowerCase().includes(lowerSearch))
            );
        });
    }, [allRequests, searchQuery]);

    // 4. Client-Side Pagination Calculations
    const totalUsers = filteredRequests.length;
    const totalPages = Math.ceil(totalUsers / LIMIT) || 1;

    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * LIMIT;
        return filteredRequests.slice(startIndex, startIndex + LIMIT);
    }, [filteredRequests, currentPage]);


    // --- INTERNAL CSS ---
    const internalCss = `
        .ul-wrapper {
            font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 1050px;
            margin: 40px auto;
            padding: 32px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.02);
            color: #1f2937;
        }
        
        .ul-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }

        .ul-header h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ul-header h2::before {
            content: '';
            display: block;
            width: 12px;
            height: 12px;
            background-color: #b91c1c;
            border-radius: 50%;
        }

        .ul-record-count {
            font-size: 14px;
            color: #6b7280;
            background-color: #f3f4f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 500;
        }

        .ul-filters-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .ul-agent-select {
            width: 100%;
            max-width: 300px;
            padding: 12px 16px;
            font-size: 14px;
            color: #111827;
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .ul-agent-select:focus {
            border-color: #b91c1c;
            box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
        }

        .ul-search-form {
            display: flex;
            gap: 12px;
            width: 100%;
        }

        .ul-input {
            flex: 1;
            padding: 12px 16px;
            font-size: 14px;
            color: #111827;
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            transition: all 0.2s ease;
        }

        .ul-input:focus {
            border-color: #b91c1c;
            box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
        }

        .ul-btn {
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            white-space: nowrap;
        }

        .ul-btn-primary {
            background-color: #b91c1c;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(185, 28, 28, 0.2);
        }

        .ul-btn-primary:hover:not(:disabled) {
            background-color: #991b1b;
            transform: translateY(-1px);
        }

        .ul-btn-secondary {
            background-color: #ffffff;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .ul-table-wrapper {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 24px;
            overflow-x: auto;
        }

        .ul-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            word-break: break-word;
        }

        .ul-table th {
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 16px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
        }

        .ul-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #4b5563;
            font-size: 14px;
            vertical-align: middle;
        }

        .ul-table tbody tr:hover {
            background-color: #f9fafb;
        }

        .ul-primary-text {
            color: #111827;
            font-weight: 600;
            display: block;
            margin-bottom: 2px;
        }

        .ul-secondary-text {
            color: #6b7280;
            font-size: 13px;
        }

        .ul-badge {
            display: inline-flex;
            align-items: center;
            background-color: #ecfdf5;
            color: #059669;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid #a7f3d0;
        }

        .ul-pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .ul-empty-state {
            text-align: center;
            padding: 48px 24px;
            color: #6b7280;
        }

        /* --- SKELETON ANIMATION --- */
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .skeleton {
            background: linear-gradient(90deg, #f0f2f5 25%, #e2e4e8 50%, #f0f2f5 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
            border-radius: 4px;
        }

        .skeleton-text { height: 16px; margin-bottom: 8px; }
        .skeleton-text-sm { height: 12px; width: 60%; }
        .skeleton-badge { height: 24px; width: 60px; border-radius: 12px; }

        /* --- MOBILE SCROLL INDICATOR --- */
        .mobile-scroll-indicator {
            display: none;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
            60% { transform: translateY(-3px); }
        }

        /* --- RESPONSIVE MOBILE STYLES --- */
        @media (max-width: 768px) {
            .ul-wrapper {
                padding: 16px;
                margin: 16px auto;
            }

            .ul-search-form { flex-direction: column; }
            .ul-header { flex-direction: column; align-items: flex-start; gap: 12px; }
            
            .ul-agent-select { max-width: 100%; }

            .ul-table-wrapper { border: none; margin-bottom: 8px; }
            
            .ul-table, .ul-table tbody, .ul-table tr, .ul-table td {
                display: block;
                width: 100%;
            }

            .ul-table thead { display: none; }

            .ul-table tbody tr {
                margin-bottom: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }

            .ul-table td {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                text-align: right;
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
            }

            .ul-table td::before {
                content: attr(data-label);
                font-size: 12px;
                text-transform: uppercase;
                font-weight: 600;
                color: #6b7280;
                margin-right: 16px;
                text-align: left;
                flex-shrink: 0;
            }

            .ul-primary-text, .ul-secondary-text { text-align: right; }

            .ul-pagination { flex-direction: column; gap: 16px; margin-top: 16px; padding-bottom: 40px; }
            .ul-btn { width: 100%; }

            .mobile-scroll-indicator {
                display: flex;
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(31, 41, 55, 0.9);
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                z-index: 50;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                animation: bounce 2s infinite;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .mobile-scroll-indicator.hide {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }

            .arrow-down {
                width: 0; 
                height: 0; 
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid #ffffff;
                margin-top: 6px;
            }
        }
    `;

    // Render 5 Skeleton rows while loading
    const renderSkeletons = () => {
        return [...Array(LIMIT)].map((_, index) => (
            <tr key={`skeleton-${index}`}>
                <td data-label="Profile ID">
                    <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                </td>
                <td data-label="Name">
                    <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
                </td>
                <td data-label="Contact Info">
                    <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                    <div className="skeleton skeleton-text-sm"></div>
                </td>
                <td data-label="Location">
                    <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                    <div className="skeleton skeleton-text-sm"></div>
                </td>
                <td data-label="Status">
                    <div className="skeleton skeleton-badge"></div>
                </td>
            </tr>
        ));
    };

    return (
        <>
            <style>{internalCss}</style>

            <div className="ul-wrapper">
                <Toaster position="top-right" />

                <div className="ul-header">
                    <h2>Resolved Premium Users</h2>
                    <span className="ul-record-count">
                        Total Records: <strong>{loading ? '-' : totalUsers}</strong>
                    </span>
                </div>

                <div className="ul-filters-container">
                    {/* Agent Dropdown */}
                    <select 
                        className="ul-agent-select"
                        value={selectedAgent}
                        onChange={handleAgentChange}
                        disabled={loading}
                    >
                        <option value="">All Agents (Global)</option>
                        {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                                {agent.name} {agent.agentCode ? `(${agent.agentCode})` : ''}
                            </option>
                        ))}
                    </select>

                    {/* Search Form */}
                    <form className="ul-search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search by Name, Email, Mobile, or Profile ID..."
                            className="ul-input"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="ul-btn ul-btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        {searchQuery && (
                            <button type="button" className="ul-btn ul-btn-secondary" onClick={handleClearSearch}>
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                <div className="ul-table-wrapper">
                    <table className="ul-table">
                        <thead>
                            <tr>
                                <th>Profile ID</th>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                renderSkeletons()
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((req) => {
                                    const user = req.userId;
                                    return (
                                        <tr key={req._id}>
                                            <td data-label="Profile ID">
                                                <span className="ul-primary-text">{user.uniqueId}</span>
                                            </td>
                                            <td data-label="Name">
                                                <span className="ul-primary-text">{user.firstName} {user.lastName}</span>
                                            </td>
                                            <td data-label="Contact Info">
                                                <div>
                                                    <span className="ul-primary-text">{user.mobileNumber}</span>
                                                    <span className="ul-secondary-text">{user.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="Location">
                                                <div>
                                                    <span className="ul-primary-text">{user.city}</span>
                                                    <span className="ul-secondary-text">{user.state}</span>
                                                </div>
                                            </td>
                                            <td data-label="Status">
                                                <span className="ul-badge">{req.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="ul-empty-state">
                                        No resolved users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Bouncing Scroll Indicator (Now Dynamic) */}
                {!loading && currentUsers.length > 2 && (
                    <div className={`mobile-scroll-indicator ${!showScrollIndicator ? 'hide' : ''}`}>
                        <span>Scroll for more</span>
                        <div className="arrow-down"></div>
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && totalPages > 0 && (
                    <div className="ul-pagination">
                        <button 
                            className="ul-btn ul-btn-secondary"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                        >
                            &laquo; Previous
                        </button>

                        <div className="ul-page-info">
                            Page <strong style={{ color: '#111827' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </div>

                        <button 
                            className="ul-btn ul-btn-secondary"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                        >
                            Next &raquo;
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserList;

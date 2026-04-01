import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const UserList = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); 

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 5;

    const API_BASE_URL = 'https://kalyanashobha-back.vercel.app';

    // 1. Fetch data
    const fetchResolvedUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken'); 

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/premium-requests/resolved`, {
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

    // Fetch on initial mount
    useEffect(() => {
        fetchResolvedUsers();
    }, []);

    // 2. Client-Side Search Filtering
    const filteredRequests = useMemo(() => {
        if (!searchQuery) return allRequests;

        const lowerSearch = searchQuery.toLowerCase();
        return allRequests.filter(req => {
            const user = req.userId;
            if (!user) return false; 

            return (
                (user.firstName && user.firstName.toLowerCase().includes(lowerSearch)) ||
                (user.lastName && user.lastName.toLowerCase().includes(lowerSearch)) ||
                (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
                (user.mobileNumber && user.mobileNumber.toLowerCase().includes(lowerSearch)) ||
                (user.uniqueId && user.uniqueId.toLowerCase().includes(lowerSearch))
            );
        });
    }, [allRequests, searchQuery]);

    // 3. Client-Side Pagination Calculations
    const totalUsers = filteredRequests.length;
    const totalPages = Math.ceil(totalUsers / LIMIT) || 1;

    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * LIMIT;
        return filteredRequests.slice(startIndex, startIndex + LIMIT);
    }, [filteredRequests, currentPage]);

    // Handlers
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

        .ul-search-form {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
        }

        .ul-input {
            flex: 1;
            padding: 12px 16px;
            font-size: 15px;
            color: #111827;
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            transition: all 0.2s ease;
        }

        .ul-input:focus {
            background-color: #ffffff;
            border-color: #b91c1c;
            box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
        }

        .ul-btn {
            padding: 12px 24px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }

        .ul-btn-primary {
            background-color: #b91c1c;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(185, 28, 28, 0.2);
        }

        .ul-btn-primary:hover:not(:disabled) {
            background-color: #991b1b;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(185, 28, 28, 0.25);
        }

        .ul-btn-primary:disabled {
            background-color: #fca5a5;
            cursor: not-allowed;
            box-shadow: none;
        }

        .ul-btn-secondary {
            background-color: #ffffff;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .ul-btn-secondary:hover:not(:disabled) {
            background-color: #f3f4f6;
            color: #111827;
        }

        .ul-table-wrapper {
            /* Removed overflow-x: auto */
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 24px;
        }

        .ul-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            /* Removed white-space: nowrap to allow wrapping */
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

        .ul-table tbody tr {
            transition: background-color 0.15s ease;
        }

        .ul-table tbody tr:hover {
            background-color: #f9fafb;
        }

        .ul-table tbody tr:last-child td {
            border-bottom: none;
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

        .ul-page-info {
            color: #4b5563;
            font-size: 14px;
        }

        .ul-empty-state {
            text-align: center;
            padding: 48px 24px;
            color: #6b7280;
        }

        /* --- RESPONSIVE MOBILE STYLES --- */
        @media (max-width: 768px) {
            .ul-wrapper {
                padding: 16px;
                margin: 16px auto;
            }

            .ul-search-form {
                flex-direction: column;
            }
            .ul-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }

            /* Convert Table to Cards */
            .ul-table-wrapper {
                border: none; /* Remove outer border */
            }
            
            .ul-table, .ul-table tbody, .ul-table tr, .ul-table td {
                display: block;
                width: 100%;
            }

            .ul-table thead {
                display: none; /* Hide standard column headers */
            }

            .ul-table tbody tr {
                margin-bottom: 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }

            .ul-table tbody tr:hover {
                background-color: transparent; /* Disable hover effect on mobile */
            }

            .ul-table td {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                text-align: right;
                padding: 12px 16px;
                border-bottom: 1px solid #f3f4f6;
            }

            .ul-table td:last-child {
                border-bottom: none;
            }

            /* Insert the data-label as a pseudo-element before the actual content */
            .ul-table td::before {
                content: attr(data-label);
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
                color: #6b7280;
                margin-right: 16px;
                text-align: left;
                flex-shrink: 0;
            }

            .ul-primary-text, .ul-secondary-text {
                text-align: right; /* Ensure text aligns to the right inside the card */
            }

            .ul-pagination {
                flex-direction: column;
                gap: 16px;
            }
            
            .ul-btn {
                width: 100%;
            }
        }
    `;

    return (
        <>
            <style>{internalCss}</style>

            <div className="ul-wrapper">
                <Toaster position="top-right" />

                <div className="ul-header">
                    <h2>Resolved Premium Users</h2>
                    <span className="ul-record-count">
                        Total Records: <strong>{totalUsers}</strong>
                    </span>
                </div>

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
                                <tr>
                                    <td colSpan="5" className="ul-empty-state">
                                        <strong style={{ color: '#b91c1c', fontSize: '16px' }}>Loading records...</strong>
                                    </td>
                                </tr>
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((req) => {
                                    const user = req.userId;
                                    if (!user) return null; 

                                    return (
                                        <tr key={req._id}>
                                            {/* Note the data-label attributes added below */}
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
                                        No resolved users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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

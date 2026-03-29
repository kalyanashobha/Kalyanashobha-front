import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); // To hold input before submitting
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const API_BASE_URL = 'https://kalyanashobha-back.vercel.app';
    const LIMIT = 5;

    const fetchUsers = async (page, search) => {
        setLoading(true);
        // Replace 'adminToken' with wherever you store your admin JWT token
        const token = localStorage.getItem('adminToken'); 

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/admin/users/advanced?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token 
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
                setTotalPages(data.totalPages || 1);
                setCurrentPage(data.currentPage || 1);
                setTotalUsers(data.totalUsers || 0);
                
                // Only show success toast if it's a new search, to avoid spamming on simple page changes
                if (search && page === 1) {
                    toast.success(`Found ${data.totalUsers} users`);
                }
            } else {
                toast.error(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error('Server error while fetching users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on initial mount and when currentPage or searchQuery changes
    useEffect(() => {
        fetchUsers(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        setSearchQuery(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // --- INTERNAL STYLES ---
    const styles = {
        container: {
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            maxWidth: '1000px',
            margin: '40px auto',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        header: {
            color: '#b91c1c', // Thick Red
            borderBottom: '3px solid #b91c1c',
            paddingBottom: '10px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        searchForm: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
        },
        input: {
            flex: 1,
            padding: '12px 15px',
            fontSize: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            outline: 'none',
            transition: 'border-color 0.3s'
        },
        primaryButton: {
            backgroundColor: '#b91c1c', // Thick Red
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
        },
        secondaryButton: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '6px',
            cursor: 'pointer'
        },
        tableWrapper: {
            overflowX: 'auto',
            marginBottom: '20px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
        },
        th: {
            backgroundColor: '#fef2f2', // Very light red for header background
            color: '#b91c1c', // Thick red text
            padding: '14px',
            fontWeight: 'bold',
            borderBottom: '2px solid #fca5a5'
        },
        td: {
            padding: '14px',
            borderBottom: '1px solid #f3f4f6',
            color: '#4b5563'
        },
        statusBadge: (isActive) => ({
            backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
            color: isActive ? '#166534' : '#991b1b',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
        }),
        paginationContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
        },
        pageInfo: {
            color: '#6b7280',
            fontWeight: '500'
        },
        emptyState: {
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
        }
    };

    return (
        <div style={styles.container}>
            <Toaster position="top-right" />
            
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>User Management</h2>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Total Users: <strong>{totalUsers}</strong>
                </span>
            </div>

            <form style={styles.searchForm} onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search by Name, Email, Mobile, or Profile ID..."
                    style={styles.input}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = '#b91c1c'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="submit" style={styles.primaryButton} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
                {searchQuery && (
                    <button type="button" style={styles.secondaryButton} onClick={handleClearSearch}>
                        Clear
                    </button>
                )}
            </form>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Profile ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Mobile</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#b91c1c' }}>
                                    <strong>Loading records...</strong>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td style={styles.td}><strong>{user.uniqueId}</strong></td>
                                    <td style={styles.td}>{user.firstName} {user.lastName}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.mobileNumber}</td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge(user.isActive)}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={styles.emptyState}>
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 0 && (
                <div style={styles.paginationContainer}>
                    <button 
                        style={{...styles.secondaryButton, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        &laquo; Previous
                    </button>
                    
                    <div style={styles.pageInfo}>
                        Page <strong style={{ color: '#b91c1c' }}>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </div>

                    <button 
                        style={{...styles.primaryButton, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserList;

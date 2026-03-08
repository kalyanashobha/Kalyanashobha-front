import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPageContent.css';

const AdminPageContent = () => {
    const [pageName, setPageName] = useState('terms');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_BASE = "https://kalyanashobha-back.vercel.app/api";

    // Fetch existing content whenever the selected page changes
    useEffect(() => {
        fetchExistingContent(pageName);
    }, [pageName]);

    const fetchExistingContent = async (selectedPage) => {
        setIsFetching(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await axios.get(`${API_BASE}/pages/${selectedPage}`);
            if (res.data.success) {
                // If content exists, populate it. Otherwise, clear it.
                setContent(res.data.content === "<p>Content is currently being updated. Please check back later.</p>" ? "" : res.data.content);
            }
        } catch (err) {
            console.error("Error fetching content:", err);
            setMessage({ type: 'error', text: 'Failed to load existing content.' });
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        const adminToken = localStorage.getItem('adminToken');

        if (!adminToken) {
            setMessage({ type: 'error', text: 'Admin authentication missing. Please log in again.' });
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(
                `${API_BASE}/admin/pages`, 
                { pageName, content },
                { headers: { Authorization: adminToken } }
            );

            if (res.data.success) {
                setMessage({ type: 'success', text: res.data.message });
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to update page content.";
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="apc-container">
            <div className="apc-card">
                
                <div className="apc-header">
                    <h2>Manage Page Content</h2>
                    <p>Update the text/HTML for public-facing pages.</p>
                </div>

                {message.text && (
                    <div className={`apc-alert apc-alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="apc-form">
                    
                    <div className="apc-form-group">
                        <label>Select Page to Edit</label>
                        <select 
                            className="apc-control apc-select" 
                            value={pageName} 
                            onChange={(e) => setPageName(e.target.value)}
                            disabled={isLoading || isFetching}
                        >
                            <option value="terms">Terms & Conditions</option>
                            <option value="refund">Refund Policy</option>
                            <option value="about">About Us</option>
                            {/* ADDED FAQ OPTION HERE */}
                            <option value="faq">FAQ (Frequently Asked Questions)</option>
                        </select>
                    </div>

                    <div className="apc-form-group">
                        <label>
                            Page Content 
                            <span className="apc-hint"> (HTML tags like &lt;b&gt;, &lt;ul&gt;, &lt;br&gt; are supported)</span>
                        </label>
                        {isFetching ? (
                            <div className="apc-loading-skeleton">Loading existing content...</div>
                        ) : (
                            <textarea 
                                className="apc-control apc-textarea" 
                                rows="15" 
                                placeholder="Enter the page content here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            ></textarea>
                        )}
                    </div>

                    <div className="apc-footer">
                        <button 
                            type="submit" 
                            className="apc-btn-primary" 
                            disabled={isLoading || isFetching}
                        >
                            {isLoading ? 'Saving Changes...' : 'Save Content'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminPageContent;

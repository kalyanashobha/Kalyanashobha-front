import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPostTestimonial = () => {
    // Form State
    const [authorName, setAuthorName] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [previewType, setPreviewType] = useState('');
    const [uploadMode, setUploadMode] = useState('image');
    
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [testimonials, setTestimonials] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    const API_URL = "https://kalyanashobha-back.vercel.app/api/admin/testimonials";
    const PUBLIC_API_URL = "https://kalyanashobha-back.vercel.app/api/testimonials";

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(PUBLIC_API_URL);
            if (res.data.success) setTestimonials(res.data.data);
        } catch (err) {
            console.error("Error fetching testimonials", err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            setMediaPreview(URL.createObjectURL(file));
            setPreviewType('image');
            setVideoUrl('');
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setVideoUrl(url);
        if (url) {
            setMediaPreview(url);
            setPreviewType('video');
            setMedia(null);
        } else {
            setMediaPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        const token = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('authorName', authorName);
        formData.append('content', content);
        
        if (uploadMode === 'video') {
            formData.append('videoUrl', videoUrl);
        } else if (media) {
            formData.append('media', media);
        }

        try {
            const res = await axios.post(API_URL, formData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: 'Testimonial published successfully!' });
                setAuthorName('');
                setContent('');
                setMedia(null);
                setVideoUrl('');
                setMediaPreview(null);
                fetchTestimonials();
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to post testimonial." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this success story permanently?")) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await axios.delete(`${API_URL}/${id}`, {
                headers: { 'Authorization': token }
            });
            if (res.data.success) {
                setTestimonials(testimonials.filter(item => item._id !== id));
                setMessage({ type: 'success', text: 'Item removed.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Deletion failed.' });
        }
    };

    return (
        <div className="admin-testimonial-wrapper">
            <style>{`
                :root {
                    --primary-gold: #D4AF37;
                    --premium-red: #8E1B1B;
                    --dark-slate: #1e293b;
                    --light-gray: #f8fafc;
                    --border-color: #e2e8f0;
                }

                .admin-testimonial-wrapper {
                    padding: clamp(20px, 5vw, 40px);
                    background: #ffffff;
                    min-height: 100vh;
                    font-family: 'Inter', -apple-system, sans-serif;
                    color: var(--dark-slate);
                }

                .header-section {
                    margin-bottom: 30px;
                    border-left: 4px solid var(--premium-red);
                    padding-left: 16px;
                }

                .header-section h2 {
                    font-size: 28px;
                    margin: 0;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .header-section p {
                    color: #64748b;
                    margin: 8px 0 0;
                    font-size: 15px;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 30px;
                    align-items: start;
                }

                @media (min-width: 992px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr 1.2fr;
                    }
                }

                .premium-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }

                .card-title {
                    font-size: 18px;
                    color: var(--dark-slate);
                    margin: 0 0 20px 0;
                    font-weight: 600;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                }

                .mode-selector {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    background: var(--light-gray);
                    padding: 6px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                .mode-btn {
                    flex: 1;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    color: #64748b;
                    background: transparent;
                    transition: all 0.2s ease;
                }

                .mode-btn.active {
                    background: #ffffff;
                    color: var(--premium-red);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    font-weight: 600;
                }

                .form-label {
                    font-weight: 500;
                    font-size: 14px;
                    color: #475569;
                    margin-bottom: 6px;
                    display: block;
                }

                .form-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    border-color: var(--premium-red);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(142, 27, 27, 0.1);
                }

                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--premium-red);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    margin-top: 10px;
                }

                .submit-btn:hover {
                    background: #7a1717;
                }

                .submit-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }

                .preview-container {
                    margin-bottom: 20px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--light-gray);
                    border: 1px dashed var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                }

                .preview-container img, .preview-container video {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 4px;
                    object-fit: contain;
                }

                .scrollable-gallery {
                    max-height: 600px;
                    overflow-y: auto;
                    padding-right: 8px;
                }

                /* Custom Scrollbar */
                .scrollable-gallery::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollable-gallery::-webkit-scrollbar-track {
                    background: var(--light-gray);
                    border-radius: 4px;
                }
                .scrollable-gallery::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .scrollable-gallery::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                .testimonial-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .item-card {
                    display: flex;
                    align-items: center;
                    background: #ffffff;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .item-card:hover {
                    border-color: var(--primary-gold);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .item-thumb {
                    width: 64px;
                    height: 64px;
                    border-radius: 6px;
                    object-fit: cover;
                    margin-right: 16px;
                    background: var(--light-gray);
                }

                .item-info { 
                    flex: 1; 
                    min-width: 0; /* Prevents flex items from overflowing */
                }
                
                .item-info h4 { 
                    margin: 0 0 4px 0; 
                    color: var(--dark-slate); 
                    font-size: 15px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .item-info p { 
                    margin: 0; 
                    font-size: 13px; 
                    color: #64748b; 
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .delete-icon-btn {
                    background: transparent;
                    color: #ef4444;
                    border: 1px solid transparent;
                    padding: 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-left: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .delete-icon-btn:hover {
                    background: #fef2f2;
                    border-color: #fca5a5;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                }

                .alert-success {
                    background: #f0fdf4;
                    color: #166534;
                    border: 1px solid #bbf7d0;
                }

                .alert-error {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
            `}</style>

            <div className="header-section">
                <h2>Success Stories</h2>
                <p>Manage the premium testimonials displayed to users.</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message.text}
                </div>
            )}

            <div className="dashboard-grid">
                <div className="premium-card form-container">
                    <h3 className="card-title">Create Testimonial</h3>
                    
                    <div className="mode-selector">
                        <button type="button" className={`mode-btn ${uploadMode === 'image' ? 'active' : ''}`} onClick={() => setUploadMode('image')}>📷 Image Upload</button>
                        <button type="button" className={`mode-btn ${uploadMode === 'video' ? 'active' : ''}`} onClick={() => setUploadMode('video')}>🔗 Video URL</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label className="form-label">Couple/Author Name</label>
                        <input className="form-input" placeholder="e.g., Sravan & Anusha" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />

                        <label className="form-label">Success Story Content</label>
                        <textarea className="form-input" rows="4" placeholder="How they met..." value={content} onChange={(e) => setContent(e.target.value)} required />

                        {uploadMode === 'image' ? (
                            <>
                                <label className="form-label">Upload Image</label>
                                <input type="file" className="form-input" accept="image/*" onChange={handleFileChange} required={!mediaPreview} />
                            </>
                        ) : (
                            <>
                                <label className="form-label">Cloudinary Video URL</label>
                                <input className="form-input" placeholder="Paste .mp4 or Cloudinary link" value={videoUrl} onChange={handleUrlChange} required={!videoUrl} />
                            </>
                        )}

                        {mediaPreview && (
                            <div className="preview-container">
                                {previewType === 'video' || uploadMode === 'video' ? (
                                    <video src={mediaPreview} controls muted autoPlay loop />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" />
                                )}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Publish Success Story'}
                        </button>
                    </form>
                </div>

                <div className="premium-card">
                    <h3 className="card-title">Live Gallery ({testimonials.length})</h3>
                    <div className="scrollable-gallery">
                        <div className="testimonial-list">
                            {isFetching ? (
                                <p style={{color: '#64748b', fontSize: '14px'}}>Refreshing gallery...</p>
                            ) : testimonials.length === 0 ? (
                                <p style={{color: '#64748b', fontSize: '14px'}}>No success stories found.</p>
                            ) : (
                                testimonials.map((item) => (
                                    <div className="item-card" key={item._id}>
                                        {item.mediaType === 'video' ? (
                                            <video className="item-thumb" src={item.mediaUrl} muted />
                                        ) : (
                                            <img className="item-thumb" src={item.mediaUrl} alt="Success" />
                                        )}
                                        <div className="item-info">
                                            <h4>{item.authorName}</h4>
                                            <p>{item.content}</p>
                                        </div>
                                        <button type="button" className="delete-icon-btn" onClick={() => handleDelete(item._id)} title="Delete Story">
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPostTestimonial;

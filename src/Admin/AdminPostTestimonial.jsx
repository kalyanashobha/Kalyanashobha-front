import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Image as ImageIcon, Video, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
    const [testimonials, setTestimonials] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 4 items per page for both Desktop and Mobile

    // Mobile Scroll Indicator State
    const [showMainScroll, setShowMainScroll] = useState(false);

    const API_URL = "https://kalyanashobha-back.vercel.app/api/admin/testimonials";
    const PUBLIC_API_URL = "https://kalyanashobha-back.vercel.app/api/testimonials";

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(testimonials.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTestimonials = testimonials.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // --- MOBILE ONLY SCROLL INDICATOR LOGIC ---
    useEffect(() => {
        const checkMainScroll = () => {
            // 1. Hide on desktop entirely
            if (window.innerWidth > 768) {
                setShowMainScroll(false);
                return;
            }

            // 2. Hide if there is 1 or fewer items
            if (currentTestimonials.length <= 1) {
                setShowMainScroll(false);
                return;
            }

            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // 3. Check if the document is taller than the viewport. 
            const isScrollable = documentHeight > windowHeight + 80;

            // 4. Check if we haven't scrolled to the very bottom yet
            const isNotAtBottom = scrollY + windowHeight < documentHeight - 30;

            // 5. Only show the indicator if it's scrollable AND we aren't at the bottom
            setShowMainScroll(isScrollable && isNotAtBottom);
        };

        const timer = setTimeout(checkMainScroll, 50); 
        window.addEventListener('scroll', checkMainScroll);
        window.addEventListener('resize', checkMainScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', checkMainScroll);
            window.removeEventListener('resize', checkMainScroll);
        };
    }, [currentTestimonials, currentPage]);

    const fetchTestimonials = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(PUBLIC_API_URL);
            if (res.data.success) {
                setTestimonials(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching testimonials", err);
            toast.error("Failed to load testimonials.");
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

        const toastId = toast.loading("Publishing success story...");
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
                toast.success('Testimonial published successfully!', { id: toastId });
                setAuthorName('');
                setContent('');
                setMedia(null);
                setVideoUrl('');
                setMediaPreview(null);
                
                // Clear file input specifically
                const fileInput = document.getElementById('ks-media-upload');
                if(fileInput) fileInput.value = '';

                fetchTestimonials();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post testimonial.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this success story permanently?")) return;
        
        const toastId = toast.loading("Deleting story...");
        const token = localStorage.getItem('adminToken');
        
        try {
            const res = await axios.delete(`${API_URL}/${id}`, {
                headers: { 'Authorization': token }
            });
            if (res.data.success) {
                setTestimonials(testimonials.filter(item => item._id !== id));
                
                // Adjust pagination if deleting the last item on a page
                const newTotalPages = Math.ceil((testimonials.length - 1) / itemsPerPage) || 1;
                if (currentPage > newTotalPages) {
                    setCurrentPage(newTotalPages);
                }

                toast.success('Success story removed from gallery.', { id: toastId });
            }
        } catch (err) {
            toast.error('Deletion failed. Please try again.', { id: toastId });
        }
    };

    return (
        <div className="ks-story-panel">
            <Toaster position="top-right" reverseOrder={false} />
            <style>{`
                :root {
                    /* Thick Red Theme */
                    --ks-primary: #dc2626; 
                    --ks-primary-hover: #b91c1c; 
                    --ks-text-dark: #0f172a;
                    --ks-text-muted: #64748b;
                    --ks-border: #e2e8f0;
                    --ks-border-hover: #cbd5e1;
                    --ks-bg-light: #f8fafc;
                    --ks-card-bg: #ffffff;
                    --ks-danger: #ef4444;
                    --ks-danger-hover: #dc2626;
                    --ks-radius: 12px;
                    --ks-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
                    --ks-anim: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .ks-story-panel * {
                    box-sizing: border-box;
                }

                .ks-story-panel {
                    padding: 32px;
                    background: var(--ks-bg-light);
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    color: var(--ks-text-dark);
                    width: 100%;
                    overflow-x: hidden;
                }

                .ks-panel-header {
                    margin-bottom: 24px;
                }

                .ks-panel-header h2 {
                    font-size: 26px;
                    margin: 0 0 6px 0;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: var(--ks-text-dark);
                }

                .ks-panel-header p {
                    color: var(--ks-text-muted);
                    margin: 0;
                    font-size: 15px;
                }

                .ks-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    align-items: start;
                }

                .ks-content-box {
                    background: var(--ks-card-bg);
                    border-radius: var(--ks-radius);
                    padding: 24px;
                    border: 1px solid var(--ks-border);
                    box-shadow: var(--ks-shadow);
                    width: 100%;
                }

                .ks-box-heading {
                    font-size: 18px;
                    color: var(--ks-text-dark);
                    margin: 0 0 20px 0;
                    font-weight: 700;
                    border-bottom: 1px solid var(--ks-border);
                    padding-bottom: 12px;
                }

                /* Form Elements */
                .ks-upload-toggles {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    background: #f1f5f9;
                    padding: 6px;
                    border-radius: 10px;
                }

                .ks-toggle-action {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 12px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--ks-text-muted);
                    background: transparent;
                    transition: var(--ks-anim);
                    white-space: nowrap;
                }

                .ks-toggle-action:hover:not(.is-selected) {
                    color: var(--ks-text-dark);
                }

                .ks-toggle-action.is-selected {
                    background: var(--ks-card-bg);
                    color: var(--ks-primary);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .ks-field-label {
                    font-weight: 700;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--ks-text-muted);
                    margin-bottom: 8px;
                    display: block;
                }

                .ks-text-input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid var(--ks-border);
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    color: var(--ks-text-dark);
                    transition: var(--ks-anim);
                    background-color: var(--ks-card-bg);
                }

                .ks-text-input:focus {
                    border-color: var(--ks-primary);
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
                }

                .ks-action-button {
                    width: 100%;
                    padding: 14px;
                    background: var(--ks-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--ks-anim);
                    margin-top: 10px;
                    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
                }

                .ks-action-button:hover:not(:disabled) {
                    background: var(--ks-primary-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
                }

                .ks-action-button:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }

                .ks-media-preview-box {
                    margin-bottom: 24px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--ks-text-dark);
                    border: 1px solid var(--ks-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }

                .ks-media-preview-box img, .ks-media-preview-box video {
                    max-width: 100%;
                    max-height: 250px;
                    border-radius: 4px;
                    object-fit: contain;
                }

                /* Gallery / Feed Area */
                .ks-feed-scroll-area {
                    width: 100%;
                }

                .ks-story-feed {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .ks-feed-item {
                    display: flex;
                    align-items: center;
                    background: var(--ks-card-bg);
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid var(--ks-border);
                    transition: var(--ks-anim);
                }

                .ks-feed-item:hover {
                    border-color: var(--ks-border-hover);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .ks-item-thumbnail {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                    margin-right: 16px;
                    background: var(--ks-bg-light);
                    flex-shrink: 0;
                    border: 1px solid var(--ks-border);
                }

                .ks-item-details { 
                    flex: 1; 
                    min-width: 0;
                }
                
                .ks-item-details h4 { 
                    margin: 0 0 6px 0; 
                    color: var(--ks-text-dark); 
                    font-size: 15px;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .ks-item-details p { 
                    margin: 0; 
                    font-size: 13px; 
                    color: var(--ks-text-sub); 
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ks-remove-action {
                    background: #fef2f2;
                    color: var(--ks-danger);
                    border: 1px solid #fecaca;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-left: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--ks-anim);
                }
                
                .ks-remove-action:hover {
                    background: var(--ks-danger);
                    color: white;
                    border-color: var(--ks-danger-hover);
                }

                .ks-empty-gallery {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--ks-text-sub);
                    font-size: 14px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px dashed var(--ks-border);
                }

                /* --- SKELETON STYLES --- */
                .ks-skeleton-item {
                    display: flex;
                    align-items: center;
                }
                .ks-sk-thumbnail, .ks-sk-text {
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: ks-shimmer 1.5s infinite;
                }
                .ks-sk-thumbnail {
                    width: 60px; height: 60px; border-radius: 8px; margin-right: 16px; flex-shrink: 0;
                }
                .ks-sk-text {
                    height: 14px; border-radius: 4px; margin-bottom: 8px;
                }
                .ks-sk-title { width: 40%; height: 16px; margin-bottom: 12px; }
                .ks-sk-desc { width: 90%; }
                .ks-sk-desc.short { width: 60%; margin-bottom: 0; }

                @keyframes ks-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* --- PAGINATION STYLES --- */
                .ks-pagination-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 24px 0 0 0;
                    margin-top: 16px;
                    gap: 24px;
                    background: transparent;
                    border-top: 1px solid var(--ks-border);
                }

                .ks-page-btn-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #ffffff;
                    border: 1px solid var(--ks-border);
                    color: var(--ks-text-sub);
                    cursor: pointer;
                    transition: var(--ks-anim);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }

                .ks-page-btn-circle:hover:not(:disabled) {
                    background: #f8fafc;
                    color: var(--ks-text-dark);
                    border-color: var(--ks-border-hover);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    transform: translateY(-1px);
                }

                .ks-page-btn-circle:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    background: #f8fafc;
                }

                .ks-page-text {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--ks-text-sub);
                    letter-spacing: 0.3px;
                }

                /* --- SCROLL INDICATOR UI --- */
                .ks-scroll-indicator {
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

                /* =========================================
                   DESKTOP MEDIA QUERIES 
                   ========================================= */
                @media (min-width: 768px) {
                    .ks-layout-grid {
                        grid-template-columns: 1fr 1.2fr;
                        gap: 32px;
                    }
                    .ks-content-box {
                        padding: 32px;
                    }
                    .ks-item-thumbnail {
                        width: 72px;
                        height: 72px;
                    }
                }

                /* =========================================
                   MOBILE RESPONSIVENESS
                   ========================================= */
                @media (max-width: 767px) {
                    .ks-story-panel { padding: 16px; }
                    .ks-content-box { padding: 20px; border-radius: 16px;}
                    
                    .ks-scroll-indicator { display: flex; }
                    
                    .ks-panel-header h2 { font-size: 22px; }
                    .ks-panel-header p { font-size: 13px; }

                    .ks-box-heading { font-size: 16px; margin-bottom: 16px;}
                    
                    .ks-toggle-action { padding: 8px; font-size: 13px; }
                    
                    .ks-text-input { padding: 12px 14px; font-size: 14px;}
                    
                    /* Feed Mobile Adjustments */
                    .ks-feed-item {
                        padding: 12px;
                        align-items: flex-start;
                    }
                    .ks-item-thumbnail {
                        width: 50px; height: 50px; margin-right: 12px;
                    }
                    .ks-item-details h4 { font-size: 14px; }
                    .ks-item-details p { font-size: 12px; }
                    
                    .ks-remove-action { padding: 6px; align-self: center;}

                    .ks-pagination-container { gap: 16px; }
                    .ks-page-text { font-size: 14px; }
                }
            `}</style>

            <div className="ks-panel-header">
                <h2>Success Stories</h2>
                <p>Manage the premium testimonials displayed to users.</p>
            </div>

            <div className="ks-layout-grid">
                {/* Form Column */}
                <div className="ks-content-box">
                    <h3 className="ks-box-heading">Create Testimonial</h3>

                    <div className="ks-upload-toggles">
                        <button 
                            type="button" 
                            className={`ks-toggle-action ${uploadMode === 'image' ? 'is-selected' : ''}`} 
                            onClick={() => setUploadMode('image')}
                        >
                            <ImageIcon size={16}/> Image Upload
                        </button>
                        <button 
                            type="button" 
                            className={`ks-toggle-action ${uploadMode === 'video' ? 'is-selected' : ''}`} 
                            onClick={() => setUploadMode('video')}
                        >
                            <Video size={16}/> Video URL
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label className="ks-field-label">Couple/Author Name</label>
                        <input className="ks-text-input" placeholder="e.g., Sravan & Anusha" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />

                        <label className="ks-field-label">Success Story Content</label>
                        <textarea className="ks-text-input" rows="4" placeholder="How they met..." value={content} onChange={(e) => setContent(e.target.value)} required />

                        {uploadMode === 'image' ? (
                            <>
                                <label className="ks-field-label">Upload Image</label>
                                <input type="file" id="ks-media-upload" className="ks-text-input" accept="image/*" onChange={handleFileChange} required={!mediaPreview} />
                            </>
                        ) : (
                            <>
                                <label className="ks-field-label">Cloudinary Video URL</label>
                                <input className="ks-text-input" placeholder="Paste .mp4 or Cloudinary link" value={videoUrl} onChange={handleUrlChange} required={!videoUrl} />
                            </>
                        )}

                        {mediaPreview && (
                            <div className="ks-media-preview-box">
                                {previewType === 'video' || uploadMode === 'video' ? (
                                    <video src={mediaPreview} controls muted autoPlay loop />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" />
                                )}
                            </div>
                        )}

                        <button type="submit" className="ks-action-button" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Publish Success Story'}
                        </button>
                    </form>
                </div>

                {/* Live Gallery Column */}
                <div className="ks-content-box">
                    <h3 className="ks-box-heading">Live Gallery ({testimonials.length})</h3>
                    <div className="ks-feed-scroll-area">
                        <div className="ks-story-feed">
                            {isFetching ? (
                                /* Skeleton Loader mapped to itemsPerPage */
                                [...Array(itemsPerPage)].map((_, i) => (
                                    <div className="ks-feed-item ks-skeleton-item" key={i}>
                                        <div className="ks-sk-thumbnail"></div>
                                        <div className="ks-item-details" style={{ width: '100%' }}>
                                            <div className="ks-sk-text ks-sk-title"></div>
                                            <div className="ks-sk-text ks-sk-desc"></div>
                                            <div className="ks-sk-text ks-sk-desc short"></div>
                                        </div>
                                    </div>
                                ))
                            ) : testimonials.length === 0 ? (
                                <p className="ks-empty-gallery">No success stories found. Publish one to get started.</p>
                            ) : (
                                currentTestimonials.map((item) => (
                                    <div className="ks-feed-item" key={item._id}>
                                        {item.mediaType === 'video' ? (
                                            <video className="ks-item-thumbnail" src={item.mediaUrl} muted />
                                        ) : (
                                            <img className="ks-item-thumbnail" src={item.mediaUrl} alt="Success" />
                                        )}
                                        <div className="ks-item-details">
                                            <h4>{item.authorName}</h4>
                                            <p>{item.content}</p>
                                        </div>
                                        <button type="button" className="ks-remove-action" onClick={() => handleDelete(item._id)} title="Delete Story">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ALWAYS VISIBLE PAGINATION */}
                        {!isFetching && totalPages >= 1 && (
                            <div className="ks-pagination-container">
                                <button 
                                    className="ks-page-btn-circle" 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="ks-page-text">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button 
                                    className="ks-page-btn-circle" 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE ONLY SCROLL INDICATOR */}
            {showMainScroll && (
                <div className="ks-scroll-indicator">
                    <ChevronDown size={18} />
                    <span>Scroll for more</span>
                </div>
            )}
        </div>
    );
};

export default AdminPostTestimonial;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, Star } from 'lucide-react';
import './Testimonials.css'; 

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = "https://kalyanashobha-back.vercel.app/api/testimonials";

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await axios.get(API_URL);
                if (res.data.success) {
                    setTestimonials(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching testimonials:", err);
                setError("Failed to load happy stories. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Skeleton loader component
    const SkeletonCard = () => (
        <div className="ks-testimonial-card ks-skeleton-card">
            <div className="ks-card-inner">
                {/* Skeleton Media Area */}
                <div className="ks-test-media-wrapper ks-skeleton-media"></div>
                
                {/* Skeleton Content Area */}
                <div className="ks-testimonial-content">
                    <div className="ks-skeleton-stars"></div>
                    
                    <div className="ks-skeleton-text-block">
                        <div className="ks-skeleton-line" style={{ width: '90%' }}></div>
                        <div className="ks-skeleton-line" style={{ width: '100%' }}></div>
                        <div className="ks-skeleton-line" style={{ width: '75%' }}></div>
                    </div>
                    
                    <div className="ks-testimonial-footer">
                        <div className="ks-skeleton-avatar"></div>
                        <div className="ks-author-details" style={{ width: '60%' }}>
                            <div className="ks-skeleton-line ks-skeleton-author-name"></div>
                            <div className="ks-skeleton-line ks-skeleton-badge"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) {
        return <div className="ks-test-error">{error}</div>;
    }

    if (!isLoading && testimonials.length === 0) {
        return null; 
    }

    return (
        <section className="ks-testimonials-section">
            {/* Vercel-style Background Elements */}
            <div className="ks-test-bg-grid"></div>
            <div className="ks-test-glow ks-glow-left"></div>
            <div className="ks-test-glow ks-glow-right"></div>

            <div className="ks-test-container">
                
                {/* Premium Header */}
                <div className="ks-test-header">
                    <div className="ks-test-badge">Success Stories</div>
                    <h2 className="ks-test-title">
                        Matches Made in <br className="ks-mobile-break" />
                        <span className="ks-text-gradient">Heaven</span>
                    </h2>
                    <p className="ks-test-subtitle">
                        Read the beautiful journeys of couples who found their forever on KalyanaShobha.
                    </p>
                </div>
                
                {/* Grid */}
                <div className="ks-testimonials-grid">
                    {isLoading ? (
                        /* Render 3 skeleton cards while loading */
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        /* Render actual data when loaded */
                        testimonials.map((item, index) => (
                            <div 
                                className="ks-testimonial-card" 
                                key={item._id}
                                style={{ animationDelay: `${index * 0.1}s` }} 
                            >
                                <div className="ks-card-inner">
                                    {/* Media Section */}
                                    {item.mediaUrl && item.mediaType === 'video' ? (
                                        <div className="ks-test-media-wrapper">
                                            <video 
                                                className="ks-test-media" 
                                                src={item.mediaUrl} 
                                                controls 
                                                preload="metadata"
                                            />
                                        </div>
                                    ) : item.mediaUrl ? (
                                        <div className="ks-test-media-wrapper">
                                            <img 
                                                className="ks-test-media" 
                                                src={item.mediaUrl} 
                                                alt={`Testimonial from ${item.authorName}`} 
                                            />
                                        </div>
                                    ) : null}

                                    {/* Content Section */}
                                    <div className="ks-testimonial-content">
                                        <Quote className="ks-quote-icon" size={24} strokeWidth={1.5} />
                                        
                                        <div className="ks-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                                            ))}
                                        </div>

                                        <p className="ks-testimonial-text">"{item.content}"</p>
                                        
                                        <div className="ks-testimonial-footer">
                                            <div className="ks-author-avatar">
                                                {item.authorName.charAt(0)}
                                            </div>
                                            <div className="ks-author-details">
                                                <span className="ks-testimonial-author">{item.authorName}</span>
                                                <span className="ks-verified-badge">Verified Match</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

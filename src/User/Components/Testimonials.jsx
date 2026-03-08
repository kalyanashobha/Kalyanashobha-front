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
        <div className="story-testimonial-card story-skeleton-card">
            <div className="story-card-inner">
                {/* Skeleton Media Area */}
                <div className="story-test-media-wrapper story-skeleton-media"></div>
                
                {/* Skeleton Content Area */}
                <div className="story-testimonial-content">
                    <div className="story-skeleton-stars"></div>
                    
                    <div className="story-skeleton-text-block">
                        <div className="story-skeleton-line" style={{ width: '90%' }}></div>
                        <div className="story-skeleton-line" style={{ width: '100%' }}></div>
                        <div className="story-skeleton-line" style={{ width: '75%' }}></div>
                    </div>
                    
                    <div className="story-testimonial-footer">
                        <div className="story-skeleton-avatar"></div>
                        <div className="story-author-details" style={{ width: '60%' }}>
                            <div className="story-skeleton-line story-skeleton-author-name"></div>
                            <div className="story-skeleton-line story-skeleton-badge"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) {
        return <div className="story-test-error">{error}</div>;
    }

    if (!isLoading && testimonials.length === 0) {
        return null; 
    }

    return (
        <section className="story-testimonials-section">
            {/* Vercel-style Background Elements */}
            <div className="story-test-bg-grid"></div>
            <div className="story-test-glow story-glow-left"></div>
            <div className="story-test-glow story-glow-right"></div>

            <div className="story-test-container">
                
                {/* Premium Header */}
                <div className="story-test-header">
                    <div className="story-test-badge">Success Stories</div>
                    <h2 className="story-test-title">
                        Matches Made in <br className="story-mobile-break" />
                        <span className="story-text-gradient">Heaven</span>
                    </h2>
                    <p className="story-test-subtitle">
                        Read the beautiful journeys of couples who found their forever on KalyanaShobha.
                    </p>
                </div>
                
                {/* Grid */}
                <div className="story-testimonials-grid">
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
                                className="story-testimonial-card" 
                                key={item._id}
                                style={{ animationDelay: `${index * 0.1}s` }} 
                            >
                                <div className="story-card-inner">
                                    {/* Media Section */}
                                    {item.mediaUrl && item.mediaType === 'video' ? (
                                        <div className="story-test-media-wrapper">
                                            <video 
                                                className="story-test-media" 
                                                src={item.mediaUrl} 
                                                controls 
                                                preload="metadata"
                                            />
                                        </div>
                                    ) : item.mediaUrl ? (
                                        <div className="story-test-media-wrapper">
                                            <img 
                                                className="story-test-media" 
                                                src={item.mediaUrl} 
                                                alt={`Testimonial from ${item.authorName}`} 
                                            />
                                        </div>
                                    ) : null}

                                    {/* Content Section */}
                                    <div className="story-testimonial-content">
                                        <Quote className="story-quote-icon" size={24} strokeWidth={1.5} />
                                        
                                        <div className="story-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                                            ))}
                                        </div>

                                        <p className="story-testimonial-text">"{item.content}"</p>
                                        
                                        <div className="story-testimonial-footer">
                                            <div className="story-author-avatar">
                                                {item.authorName.charAt(0)}
                                            </div>
                                            <div className="story-author-details">
                                                <span className="story-testimonial-author">{item.authorName}</span>
                                                <span className="story-verified-badge">Verified Match</span>
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

import React from 'react';
import './Herobanner.css';
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="k-hero-container">
      
      {/* 1. TEXTURE & BACKGROUND */}
      <div className="k-hero-texture-grain"></div>

      {/* 2. MOVING STAR FIELD (Opacity reduced for elegance) */}
      <div className="k-hero-star-layer">
        <div className="k-hero-stars-sm"></div>
        <div className="k-hero-stars-md"></div>
      </div>

      {/* 3. BACKGROUND IMAGE (Cinematic Zoom Added) */}
      <div className="k-hero-image-wrapper">
        <picture>
          <source media="(max-width: 900px)" srcSet="/kalayanashobha11.png" />
          <img 
            src="/kalyanashobha0.png" 
            alt="Happy Telugu Couple" 
            className="k-hero-background-img" 
          />
        </picture>
        <div className="k-hero-overlay-gradient"></div>
      </div>

      {/* 4. CONTENT LAYER */}
      <div className="k-hero-content">

        {/* Main Title */}
        <h1 className="k-hero-title">
          <div className="k-hero-text-mask">
            <span className="k-hero-reveal k-hero-delay-1">Where Souls</span>
          </div>
          <div className="k-hero-text-mask">
            <span className="k-hero-reveal k-hero-delay-2 k-hero-gold-text">Meet Eternity</span>
          </div>
        </h1>

        {/* Subtitle */}
        <div className="k-hero-text-mask">
          <p className="k-hero-subtitle k-hero-reveal k-hero-delay-3">
            An exclusive journey for those seeking meaningful connections.<br className="k-hero-desktop-break" />
            Discover a love that transcends time and tradition.
          </p>
        </div>

        {/* Action Button */}
        <div className="k-hero-action-wrapper k-hero-fade-in k-hero-delay-4">
          <Link to="/registration" style={{ textDecoration: 'none' }}>
            <button className="k-hero-glass-btn">
              <span className="k-hero-btn-label">Register Now</span>
              <span className="k-hero-btn-arrow">→</span>
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default HeroBanner;

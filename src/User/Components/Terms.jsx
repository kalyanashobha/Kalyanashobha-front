import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Terms.css';
import Navbar from "./Navbar.jsx";

const Terms = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('March 2026');

  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);

    // Fetch dynamic content from the API
    const fetchTermsContent = async () => {
      try {
        const response = await axios.get('https://kalyanashobha-back.vercel.app/api/pages/terms');
        
        if (response.data.success) {
          
          let rawText = response.data.content;

          // --- THE ULTIMATE MAGIC FIXES ---
          
          // 0. DESTROY HIDDEN HTML: Sometimes the database saves hidden <p> or <br> tags 
          // that block our scanner. This turns them back into regular text.
          rawText = rawText.replace(/<br\s*\/?>/gi, '\n');
          rawText = rawText.replace(/<\/?p>/gi, '\n\n');
          rawText = rawText.replace(/<[^>]+>/g, ''); // Strips any other leftover tags
          rawText = rawText.replace(/&nbsp;/gi, ' ');

          // 1. Normalize line breaks and clean up massive gaps
          rawText = rawText.replace(/\r\n/g, '\n');
          rawText = rawText.replace(/\n{3,}/g, '\n\n');

          // 2. Bold Key Terms: Automatically finds "Minimum Age:", etc.
          rawText = rawText.replace(/(^|\n|\s)([A-Z][a-zA-Z\s]+):/g, '$1<strong>$2:</strong>');

          // 3. Bulletproof Heading Scanner: Forces an <h2> tag on lines starting with a number.
          const formattedText = rawText.replace(/^\s*(\d+\.\s+[^\n]+)/gm, '<h2 class="ks-section-heading">$1</h2>');
          
          setContent(formattedText);
          
          // Format the date if it exists
          if (response.data.lastUpdated) {
            const dateObj = new Date(response.data.lastUpdated);
            setLastUpdated(dateObj.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch Terms and Conditions:", error);
        setContent("<p>Unable to load Terms and Conditions at this time. Please try again later.</p>");
      } finally {
        setLoading(false);
      }
    };

    fetchTermsContent();
  }, []);

  return (
    <>
      <Navbar />

      <main className="ks-terms-page">
        {/* Premium Header Banner */}
        <div className="ks-terms-hero">
          <div className="ks-terms-hero__content">
            <h1 className="ks-terms-title">Terms and Conditions</h1>
            <p className="ks-terms-subtitle">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="ks-terms-container">
          <div className="ks-terms-document">
            
            {loading ? (
              // Sleek loading state
              <div className="ks-terms-loading">
                <div className="ks-skeleton-line title"></div>
                <div className="ks-skeleton-line"></div>
                <div className="ks-skeleton-line"></div>
                <div className="ks-skeleton-line short"></div>
              </div>
            ) : (
              // Dynamic HTML rendering wrapper
              <div 
                className="ks-dynamic-html-content" 
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            )}

          </div>
        </div>
      </main>
    </>
  );
};

export default Terms;

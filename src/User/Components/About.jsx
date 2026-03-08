import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HeartHandshake, Sparkles, Gem } from 'lucide-react';

// ==========================================
// UPDATE YOUR IMAGE LINKS HERE
// ==========================================
const OLD_DESKTOP_BG = 'https://res.cloudinary.com/dppiuypop/image/upload/v1772885504/uploads/utm0yfy95zgrber54m2k.png';
const NEW_DESKTOP_BG = 'https://res.cloudinary.com/dppiuypop/image/upload/v1772889701/uploads/ys2i1n2qp8o4i4mjf7e9.png';

const OLD_MOBILE_BG = 'https://res.cloudinary.com/dppiuypop/image/upload/v1772885426/uploads/jcamdhvitkbvy1wk5fxm.png';
const NEW_MOBILE_BG = 'https://res.cloudinary.com/dppiuypop/image/upload/v1772889749/uploads/pjdgq24tu5kbmaqlchiz.png';
// ==========================================

const AboutUs = () => {
  const [pageContent, setPageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAboutData = async () => {
      try {
        const response = await axios.get('https://kalyanashobha-back.vercel.app/api/pages/about');
        
        if (response.data.success) {
          const rawText = response.data.content;
          let colorIndex = 0;
          const bulletColors = [
            'linear-gradient(135deg, #dc2626, #ef4444)', // Red
            'linear-gradient(135deg, #f59e0b, #fbbf24)', // Amber
            'linear-gradient(135deg, #10b981, #34d399)', // Green
            'linear-gradient(135deg, #2563eb, #60a5fa)', // Blue
          ];

          const formattedHtml = rawText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
              if (line.toLowerCase() === 'about us') return '';

              // Animation delay based on index for staggered effect
              const delay = (index * 0.1).toFixed(2);

              if (line.length < 35 && !line.match(/[.,!?]$/)) {
                return `<h2 class="ks-editorial-heading reveal" style="transition-delay: ${delay}s">${line}</h2>`;
              }

              if (/^([A-Za-z\s]+)( [-–:] | to )/.test(line)) {
                let processedLine = line.replace(/^([A-Za-z\s]+)( [-–:] | to )/g, '<span class="ks-feature-title">$1</span><span class="ks-feature-separator">$2</span>');
                const currentColor = bulletColors[colorIndex % bulletColors.length];
                colorIndex++;

                return `
                  <div class="ks-editorial-feature reveal" style="transition-delay: ${delay}s">
                    <div class="ks-feature-indicator" style="background: ${currentColor} !important;"></div>
                    <p class="ks-feature-text">${processedLine}</p>
                  </div>
                `;
              }
              
              return `<p class="ks-editorial-body reveal" style="transition-delay: ${delay}s">${line}</p>`;
            })
            .join('');

          setPageContent(formattedHtml);
          if (response.data.lastUpdated) {
            const dateObj = new Date(response.data.lastUpdated);
            setLastUpdatedDate(dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
          }
        }
      } catch (error) {
        setPageContent("<p class='ks-error-text'>Unable to load content.</p>");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Animation Trigger logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const items = document.querySelectorAll('.reveal');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, [pageContent, isLoading]);

  const internalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Montserrat:wght@300;400;600&display=swap') !important;

    /* BY PREFIXING THE ID, WE GUARANTEE ZERO BLEEDING TO OTHER PAGES */
    #ks-about-page-unique-wrapper {
      position: relative !important;
      min-height: 100vh !important;
      background-color: #ffffff !important; 
      font-family: 'Montserrat', sans-serif !important;
      color: #1a1a1a !important;
      text-align: center !important;
      overflow: hidden !important; 
    }

    /* --- TOP DESKTOP BACKGROUND --- */
    #ks-about-page-unique-wrapper .ks-about-bg-desktop {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100vh !important; 
      z-index: 0 !important;
      pointer-events: none !important;
      background-image: url('${OLD_DESKTOP_BG}') !important;
      background-size: cover !important;
      background-position: center right !important;
      background-repeat: no-repeat !important;
    }

    #ks-about-page-unique-wrapper .ks-about-overlay-desktop {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100vh !important;
      z-index: 1 !important;
      pointer-events: none !important;
      background: linear-gradient(to right, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.2) 100%),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0) 80%, rgba(255, 255, 255, 1) 100%) !important;
    }

    /* --- BOTTOM DESKTOP BACKGROUND (NEW!) --- */
    #ks-about-page-unique-wrapper .ks-about-bottom-bg-desktop {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 90vh !important; 
      z-index: 0 !important;
      pointer-events: none !important;
      background-image: url('${NEW_DESKTOP_BG}') !important;
      background-size: cover !important;
      background-position: center left !important;
      background-repeat: no-repeat !important;
    }

    #ks-about-page-unique-wrapper .ks-about-bottom-overlay-desktop {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 90vh !important;
      z-index: 1 !important;
      pointer-events: none !important;
      /* Smoothly fades the top of the bottom image into the white page */
      background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.6) 30%, rgba(255, 255, 255, 0.1) 100%) !important;
    }

    /* Hide Mobile Elements on Desktop */
    #ks-about-page-unique-wrapper .ks-about-bg-mobile,
    #ks-about-page-unique-wrapper .ks-about-overlay-mobile,
    #ks-about-page-unique-wrapper .ks-about-bottom-bg-mobile,
    #ks-about-page-unique-wrapper .ks-about-bottom-overlay-mobile { display: none !important; }

    /* --- CONTENT ON TOP --- */
    #ks-about-page-unique-wrapper .ks-about-content {
      position: relative !important;
      z-index: 10 !important; /* Keeps text above all backgrounds */
      max-width: 1000px !important;
      margin: 0 auto !important;
      padding: 0 2rem !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
    }

    #ks-about-page-unique-wrapper .reveal {
      opacity: 0 !important;
      transform: translateY(30px) !important;
      transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1) !important;
    }
    #ks-about-page-unique-wrapper .reveal.active {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    #ks-about-page-unique-wrapper .ks-hero-header { padding: 8rem 0 4rem 0 !important; }

    #ks-about-page-unique-wrapper .ks-pill-badge {
      display: inline-flex !important;
      padding: 0.4rem 1rem !important;
      border: 1px solid #dc2626 !important;
      border-radius: 50px !important;
      font-size: 0.7rem !important;
      font-weight: 600 !important;
      color: #dc2626 !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      margin-bottom: 2rem !important;
    }

    #ks-about-page-unique-wrapper .ks-hero-title {
      font-family: 'Playfair Display', serif !important;
      font-size: clamp(2.5rem, 5vw, 4.5rem) !important;
      line-height: 1.1 !important;
      margin-bottom: 1.5rem !important;
    }

    #ks-about-page-unique-wrapper .ks-text-gradient {
      background: linear-gradient(135deg, #dc2626, #f59e0b) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      font-style: italic !important;
    }

    #ks-about-page-unique-wrapper .ks-hero-subtitle {
      font-size: clamp(0.9rem, 1.2vw, 1.1rem) !important;
      color: #666 !important;
      max-width: 650px !important;
      line-height: 1.7 !important;
    }

    #ks-about-page-unique-wrapper .ks-rich-text-renderer {
      width: 100% !important;
      max-width: 800px !important;
      padding-bottom: 30vh !important; /* Increased padding so content doesn't completely cover the bottom image */
    }

    #ks-about-page-unique-wrapper .ks-editorial-heading {
      font-family: 'Playfair Display', serif !important;
      font-size: clamp(1.8rem, 3vw, 2.5rem) !important;
      margin: 4rem 0 1.5rem 0 !important;
    }

    #ks-about-page-unique-wrapper .ks-editorial-body {
      font-size: clamp(0.95rem, 1.1vw, 1.05rem) !important;
      line-height: 1.9 !important;
      color: #444 !important;
      margin-bottom: 1.5rem !important;
    }

    #ks-about-page-unique-wrapper .ks-editorial-feature {
      display: flex !important;
      text-align: left !important;
      background: rgba(255, 255, 255, 0.9) !important; 
      backdrop-filter: blur(5px) !important;
      padding: 1.2rem 1.5rem !important;
      border-radius: 12px !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      margin-bottom: 1rem !important;
      align-items: center !important;
      transition: all 0.3s ease !important;
    }

    #ks-about-page-unique-wrapper .ks-editorial-feature:hover {
      box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
      transform: scale(1.02) !important;
    }

    #ks-about-page-unique-wrapper .ks-feature-indicator {
      width: 10px !important;
      height: 10px !important;
      border-radius: 50% !important;
      margin-right: 1.2rem !important;
      flex-shrink: 0 !important;
    }

    #ks-about-page-unique-wrapper .ks-feature-title { font-weight: 600 !important; color: #111 !important; }

    #ks-about-page-unique-wrapper .ks-skeleton-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 1.5rem !important;
      width: 100% !important;
    }

    #ks-about-page-unique-wrapper .ks-skeleton-pulse {
      height: 1.5rem !important;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%) !important;
      background-size: 200% 100% !important;
      animation: pulseLoad 2s infinite ease-in-out !important;
      border-radius: 4px !important;
    }
    
    #ks-about-page-unique-wrapper .ks-skel-title { height: 3rem !important; width: 50% !important; margin-bottom: 1rem !important; }
    #ks-about-page-unique-wrapper .ks-skel-full { width: 100% !important; }

    @keyframes pulseLoad {
      0% { background-position: 200% 0 !important; }
      100% { background-position: -200% 0 !important; }
    }

    /* --- MOBILE OPTIMIZATION --- */
    @media (max-width: 768px) {
      /* Hide Desktop Elements completely */
      #ks-about-page-unique-wrapper .ks-about-bg-desktop,
      #ks-about-page-unique-wrapper .ks-about-overlay-desktop,
      #ks-about-page-unique-wrapper .ks-about-bottom-bg-desktop,
      #ks-about-page-unique-wrapper .ks-about-bottom-overlay-desktop { display: none !important; }
      
      /* Show Top Mobile Image */
      #ks-about-page-unique-wrapper .ks-about-bg-mobile {
        display: block !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 60vh !important; 
        background-image: url('${OLD_MOBILE_BG}') !important;
        background-size: cover !important;
        background-position: center center !important; 
        z-index: 0 !important;
      }
      
      #ks-about-page-unique-wrapper .ks-about-overlay-mobile {
        display: block !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 60vh !important;
        z-index: 1 !important;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.5) 70%, #ffffff 100%) !important;
      }

      /* Show Bottom Mobile Image (NEW!) */
      #ks-about-page-unique-wrapper .ks-about-bottom-bg-mobile {
        display: block !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 70vh !important;
        z-index: 0 !important;
        background-image: url('${NEW_MOBILE_BG}') !important;
        background-size: cover !important;
        background-position: center bottom !important; 
      }

      #ks-about-page-unique-wrapper .ks-about-bottom-overlay-mobile {
        display: block !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 70vh !important;
        z-index: 1 !important;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0) 100%) !important;
      }

      #ks-about-page-unique-wrapper .ks-hero-header { padding: 6rem 0 3rem 0 !important; }
      #ks-about-page-unique-wrapper .ks-pill-badge { font-size: 0.6rem !important; padding: 0.3rem 0.8rem !important; }
      #ks-about-page-unique-wrapper .ks-editorial-heading { margin: 2.5rem 0 1rem 0 !important; }
      #ks-about-page-unique-wrapper .ks-editorial-feature { padding: 1rem !important; }
      #ks-about-page-unique-wrapper .ks-about-content { padding: 0 1.2rem !important; }
      #ks-about-page-unique-wrapper { text-align: left !important; } 
      #ks-about-page-unique-wrapper .ks-rich-text-renderer { align-items: flex-start !important; padding-bottom: 30vh !important; }
      #ks-about-page-unique-wrapper .ks-skeleton-container { align-items: flex-start !important; }
    }
  `;

  return (
    <div id="ks-about-page-unique-wrapper">
      <style>{internalStyles}</style>
      
      {/* Top Background elements */}
      <div className="ks-about-bg-desktop"></div>
      <div className="ks-about-overlay-desktop"></div>
      <div className="ks-about-bg-mobile"></div>
      <div className="ks-about-overlay-mobile"></div>

      {/* Bottom Background elements (The fix!) */}
      <div className="ks-about-bottom-bg-desktop"></div>
      <div className="ks-about-bottom-overlay-desktop"></div>
      <div className="ks-about-bottom-bg-mobile"></div>
      <div className="ks-about-bottom-overlay-mobile"></div>

      {/* Main Content */}
      <div className="ks-about-content">
        <header className="ks-hero-header reveal">
          <div className="ks-pill-badge">Our Journey</div>
          <h1 className="ks-hero-title">About <span className="ks-text-gradient">Us</span></h1>
          <p className="ks-hero-subtitle">
            {lastUpdatedDate ? `Last updated: ${lastUpdatedDate}` : "Where Tradition Meets Modern Connection"}
          </p>
        </header>

        <div className="ks-rich-text-renderer">
          {isLoading ? (
            <div className="ks-skeleton-container">
              <div className="ks-skeleton-pulse ks-skel-title"></div>
              <div className="ks-skeleton-pulse ks-skel-full"></div>
              <div className="ks-skeleton-pulse ks-skel-full"></div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

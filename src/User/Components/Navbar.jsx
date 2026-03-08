import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Store, 
  UserCheck, 
  User, 
  Heart, 
  CreditCard, 
  FileText, 
  ShieldAlert, 
  HelpCircle,
  ChevronDown,
  Info // <-- Added Info icon for FAQ
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem('token');

  // Fetch pending interests to show the notification badge
  useEffect(() => {
    let isMounted = true;

    const fetchPendingInterests = async () => {
      if (!isLoggedIn) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://kalyanashobha-back.vercel.app/api/user/interests/received', {
          headers: { 'Authorization': token }
        });
        const data = await res.json();
        
        if (data.success && isMounted) {
          // Count only requests that are waiting for the user to respond
          const count = data.data.filter(i => i.status === 'PendingUser').length;
          setPendingCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch pending interests for navbar badge", err);
      }
    };

    fetchPendingInterests();

    return () => { isMounted = false; };
  }, [isLoggedIn, location.pathname]); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    closeMenu();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`main-header ${scrolled ? 'main-header--scrolled' : ''}`}>
      <div className="main-header-container">

        <div className="main-header-brand">
          <Link to="/" onClick={closeMenu} className="main-logo-link">
            <img src="/Kalyanashobha.png" alt="Kalyana Shobha" className="main-logo-img" />
          </Link>
        </div>

        {/* --- Desktop Main Navigation --- */}
        <nav className="main-nav">
          <ul className="main-nav-list">
            <li className="main-nav-item">
              <Link to="/" className={`main-nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li className="main-nav-item">
              <Link to="/vendor" className={`main-nav-link ${isActive('/vendor') ? 'active' : ''}`}>
                Vendors
              </Link>
            </li>

            {!isLoggedIn && (
              <li className="main-nav-item">
                <Link to="/agent/login" className={`main-nav-link ${isActive('/agent/login') ? 'active' : ''}`}>
                  Agent
                </Link>
              </li>
            )}

            {isLoggedIn && (
              <>
                <li className="main-nav-item">
                  <Link to="/myprofile" className={`main-nav-link ${isActive('/myprofile') ? 'active' : ''}`}>
                    My Profile
                  </Link>
                </li>
                <li className="main-nav-item">
                  <Link to="/interests" className={`main-nav-link ${isActive('/interests') ? 'active' : ''}`}>
                    Interests 
                    {/* NEW: Desktop Notification Badge */}
                    {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
                  </Link>
                </li>
                <li className="main-nav-item">
                  <Link to="/payments" className={`main-nav-link ${isActive('/payments') ? 'active' : ''}`}>
                    Payments
                  </Link>
                </li>
              </>
            )}

            {/* --- PREMIUM DESKTOP DROPDOWN --- */}
            <li className="main-nav-item ks-dropdown-container">
              {/* Added /faq to the active check */}
              <button className={`main-nav-link ks-dropdown-trigger ${['/terms', '/refund', '/faq', '/help'].includes(location.pathname) ? 'active' : ''}`}>
                More <ChevronDown size={14} strokeWidth={2.5} className="dropdown-arrow" />
              </button>
              
              <div className="ks-dropdown-menu">
                <Link to="/terms" className="ks-dropdown-item">
                  <span className="nav-icon-box color-gray"><FileText size={16} strokeWidth={2} /></span> 
                  <div className="dropdown-text">
                    <span className="dropdown-title">Terms of Service</span>
                    <span className="dropdown-desc">Read our platform rules</span>
                  </div>
                </Link>
                <Link to="/refund" className="ks-dropdown-item">
                  <span className="nav-icon-box color-indigo"><ShieldAlert size={16} strokeWidth={2} /></span> 
                  <div className="dropdown-text">
                    <span className="dropdown-title">Refund Policy</span>
                    <span className="dropdown-desc">Understand our payment terms</span>
                  </div>
                </Link>
                {/* NEW: FAQ Link */}
                <Link to="/faq" className="ks-dropdown-item">
                  <span className="nav-icon-box color-blue"><Info size={16} strokeWidth={2} /></span> 
                  <div className="dropdown-text">
                    <span className="dropdown-title">FAQ</span>
                    <span className="dropdown-desc">Frequently asked questions</span>
                  </div>
                </Link>
                
                {/* Conditionally rendered Help Center */}
                {isLoggedIn && (
                  <Link to="/help" className="ks-dropdown-item">
                    <span className="nav-icon-box color-amber"><HelpCircle size={16} strokeWidth={2} /></span> 
                    <div className="dropdown-text">
                      <span className="dropdown-title">Help Center</span>
                      <span className="dropdown-desc">Get support and answers</span>
                    </div>
                  </Link>
                )}
              </div>
            </li>
          </ul>
        </nav>

        {/* --- Action Buttons (Desktop) --- */}
        <div className="main-header-actions">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="nav-btn nav-btn-primary">
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-btn nav-btn-primary">
              Login
            </Link>
          )}
        </div>

        {/* --- Modern Hamburger --- */}
        <button
          className={`nav-hamburger ${isOpen ? 'is-active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className="nav-hamburger-line line-top"></span>
          <span className="nav-hamburger-line line-middle"></span>
          <span className="nav-hamburger-line line-bottom"></span>
        </button>
      </div>

      {/* --- Mobile Sidebar Overlay --- */}
      <div className={`mobile-menu-overlay ${isOpen ? 'is-visible' : ''}`}>
        <div className="mobile-menu-content">
          
          <ul className="mobile-menu-list">
            <li style={{ '--i': 1 }}>
              <Link to="/" onClick={closeMenu} className={isActive('/') ? 'mobile-active' : ''}>
                <span className="nav-icon-box color-blue"><Home size={16} strokeWidth={2.5} /></span> Home
              </Link>
            </li>
            <li style={{ '--i': 2 }}>
              <Link to="/vendor" onClick={closeMenu} className={isActive('/vendor') ? 'mobile-active' : ''}>
                <span className="nav-icon-box color-purple"><Store size={16} strokeWidth={2.5} /></span> Vendors
              </Link>
            </li>

            {!isLoggedIn && (
              <li style={{ '--i': 3 }}>
                <Link to="/agent/login" onClick={closeMenu} className={isActive('/agent/login') ? 'mobile-active' : ''}>
                  <span className="nav-icon-box color-orange"><UserCheck size={16} strokeWidth={2.5} /></span> Agent
                </Link>
              </li>
            )}

            {isLoggedIn && (
              <>
                <li style={{ '--i': 3 }}>
                  <Link to="/myprofile" onClick={closeMenu} className={isActive('/myprofile') ? 'mobile-active' : ''}>
                    <span className="nav-icon-box color-teal"><User size={16} strokeWidth={2.5} /></span> My Profile
                  </Link>
                </li>
                <li style={{ '--i': 4 }}>
                  <Link to="/interests" onClick={closeMenu} className={isActive('/interests') ? 'mobile-active' : ''}>
                    <span className="nav-icon-box color-pink"><Heart size={16} strokeWidth={2.5} /></span> 
                    <span style={{ flex: 1 }}>Interests</span>
                    {/* NEW: Mobile Notification Badge */}
                    {pendingCount > 0 && <span className="nav-badge">{pendingCount} New</span>}
                  </Link>
                </li>
                <li style={{ '--i': 5 }}>
                  <Link to="/payments" onClick={closeMenu} className={isActive('/payments') ? 'mobile-active' : ''}>
                    <span className="nav-icon-box color-green"><CreditCard size={16} strokeWidth={2.5} /></span> Payments
                  </Link>
                </li>
              </>
            )}

            <div className="mobile-menu-divider"></div>

            <li style={{ '--i': 6 }}>
              <Link to="/terms" onClick={closeMenu} className={`mobile-menu-link-small ${isActive('/terms') ? 'mobile-active' : ''}`}>
                <span className="nav-icon-box color-gray"><FileText size={14} strokeWidth={2.5} /></span> Terms & Conditions
              </Link>
            </li>
            <li style={{ '--i': 7 }}>
              <Link to="/refund" onClick={closeMenu} className={`mobile-menu-link-small ${isActive('/refund') ? 'mobile-active' : ''}`}>
                <span className="nav-icon-box color-indigo"><ShieldAlert size={14} strokeWidth={2.5} /></span> Refund Policy
              </Link>
            </li>
            {/* NEW: Mobile FAQ Link */}
            <li style={{ '--i': 8 }}>
              <Link to="/faq" onClick={closeMenu} className={`mobile-menu-link-small ${isActive('/faq') ? 'mobile-active' : ''}`}>
                <span className="nav-icon-box color-blue"><Info size={14} strokeWidth={2.5} /></span> FAQ
              </Link>
            </li>
            
            {/* Conditionally rendered Help Center */}
            {isLoggedIn && (
              <li style={{ '--i': 9 }}>
                <Link to="/help" onClick={closeMenu} className={`mobile-menu-link-small ${isActive('/help') ? 'mobile-active' : ''}`}>
                  <span className="nav-icon-box color-amber"><HelpCircle size={14} strokeWidth={2.5} /></span> Help Center
                </Link>
              </li>
            )}
          </ul>

          <div className="mobile-menu-actions">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="nav-btn nav-btn-primary full-width">
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="nav-btn nav-btn-primary full-width">
                Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;

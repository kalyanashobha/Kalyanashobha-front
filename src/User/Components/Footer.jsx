import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="ks-footer-section">
      {/* Decorative Top Gold Line */}
      <div className="ks-footer-gold-line"></div>

      <div className="ks-footer-container">

        {/* COLUMN 1: Brand & About */}
        <div className="ks-footer-col brand-col">
          <p className="ks-footer-desc">
            Bringing hearts together with trust and tradition. 
            The most secure way to find your perfect life partner.
          </p>
        </div>



        {/* COLUMN 3: Legal & Support */}
        <div className="ks-footer-col">
          <h4 className="ks-footer-heading">Legal</h4>
          <ul className="ks-footer-links">
            {/* Note: You don't have a privacy route in App.js yet, so I routed it to terms for now */}

            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/refund">Refund Policy</Link></li>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/faq">Faq</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: Get in Touch */}
        <div className="ks-footer-col contact-col">
          <h4 className="ks-footer-heading">Contact</h4>
          <p className="ks-contact-item">support@kalyanashobha.in</p>

          {/*<div className="ks-social-icons">
            <Link to="#" className="ks-social-btn">FB</Link>
            <Link to="#" className="ks-social-btn">IG</Link>
            <Link to="#" className="ks-social-btn">LN</Link>
            <Link to="#" className="ks-social-btn">YT</Link>
          </div>*/}
        </div>

      </div>

      {/* COPYRIGHT AREA */}
      <div className="ks-footer-bottom">
        <p>&copy; {new Date().getFullYear()} KalyanaShobha Matrimony. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

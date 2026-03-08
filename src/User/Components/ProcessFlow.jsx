import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ProcessFlow.css';

// --- ICONS ---
const IconRegister = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconBrowse = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconConnect = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const IconInteract = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);

const ProcessFlow = () => {
  const steps = [
    { id: "01", tag: "REGISTER", title: "Create Account", desc: "Begin your journey by verifying your identity.", icon: <IconRegister /> },
    { id: "02", tag: "DISCOVER", title: "Browse Profiles", desc: "Use precision filters to find your perfect match.", icon: <IconBrowse /> },
    { id: "03", tag: "CONNECT", title: "Send Interest", desc: "Express your interest with a single secure click.", icon: <IconConnect /> },
    { id: "04", tag: "INTERACT", title: "Connect", desc: "Connect instantly once your request is approved.", icon: <IconInteract /> }
  ];

  // --- AUTOPILOT LOGIC ---
  const [activeStep, setActiveStep] = useState(0);
  
  // Change this from 10000 (10 seconds) to something faster, like 5000 (5 seconds)
  const totalDuration = 5000; 
  
  const stepDuration = totalDuration / steps.length;


  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, stepDuration);
    return () => clearInterval(timer);
  }, [stepDuration, steps.length]);

  return (
    <section className="auto-process-section">
      <div className="auto-container">
        
        <div className="auto-header">
          <h2 className="auto-title">Streamlined <span className="red-text">Connection.</span></h2>
        </div>

        <div className="timeline-layout">


          {/* --- STEPS WRAPPER --- */}
          <div className="steps-column">
            
            {/* --- DESKTOP HORIZONTAL LINE (Visible only on Desktop) --- */}
            {/* Placed INSIDE steps-column to ensure alignment */}


            {/* --- THE STEPS --- */}
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <div key={step.id} className={`step-row ${isActive ? 'active' : ''}`}>
                  <div className="step-icon-wrapper">
                    <div className="step-icon-box">
                      {step.icon}
                    </div>
                  </div>
                  <div className="step-content">
                    <span className="step-tag">{step.id} / {step.tag}</span>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-desc">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;

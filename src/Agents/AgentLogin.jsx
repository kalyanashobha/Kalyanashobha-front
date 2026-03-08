import React, { useState, useRef, useEffect } from 'react';
import Navbar from "../User/Components/Navbar.jsx"; 
import { useNavigate } from 'react-router-dom';
import './AgentLogin.css'; 

const API_BASE = "https://kalyanashobha-back.vercel.app/api/agent";

const AgentLogin = () => {
  const navigate = useNavigate();
  
  // Expanded views for Forgot Password flow
  const [view, setView] = useState('login'); // 'login', 'otp', 'forgot-email', 'forgot-otp', 'reset-password'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(""));
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const otpRefs = useRef([]);

  // Timer states for Resend OTP
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem('agentToken')) {
      navigate('/agent/dashboard');
    }
  }, [navigate]);

  // Countdown Timer Logic
  useEffect(() => {
    if ((view === 'otp' || view === 'forgot-otp') && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if ((view === 'otp' || view === 'forgot-otp') && timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, view]);

  // ==================== LOGIN FLOW ====================
  const handleLoginInit = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login-init`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setView('otp');
        setTimeLeft(30); 
        setCanResend(false);
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Server Error"); } 
    finally { setAuthLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login-verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join("") })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('agentToken', data.token);
        localStorage.setItem('agentInfo', JSON.stringify(data.agent));
        navigate('/agent/dashboard'); 
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Verification Failed"); } 
    finally { setAuthLoading(false); }
  };

  // ==================== FORGOT PASSWORD FLOW ====================
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setView('forgot-otp');
        setOtp(new Array(6).fill(""));
        setTimeLeft(30); 
        setCanResend(false);
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Server Error"); } 
    finally { setAuthLoading(false); }
  };

  const handleVerifyForgotOtp = async () => {
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join("") })
      });
      const data = await res.json();
      if (data.success) {
        setView('reset-password');
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Verification Failed"); } 
    finally { setAuthLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setAuthError("Passwords do not match");
    }
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert("Password Reset Successful! Please login.");
        setPassword(''); setNewPassword(''); setConfirmPassword(''); setOtp(new Array(6).fill(""));
        setView('login');
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Server Error"); } 
    finally { setAuthLoading(false); }
  };

  // ==================== SHARED OTP RESEND ====================
  const handleResendOtp = async () => {
    if (!canResend) return;
    setAuthLoading(true); setAuthError('');
    try {
      const endpoint = view === 'otp' ? '/auth/login-init' : '/auth/forgot-password';
      const bodyPayload = view === 'otp' ? { email, password } : { email };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload) 
      });
      const data = await res.json();
      if (data.success) {
        setOtp(new Array(6).fill(""));
        setTimeLeft(30); 
        setCanResend(false);
        otpRefs.current[0]?.focus(); 
      } else {
        setAuthError(data.message);
      }
    } catch (e) { setAuthError("Failed to resend OTP"); } 
    finally { setAuthLoading(false); }
  };

  // ==================== OTP INPUT HANDLERS ====================
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    if (val !== "" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(isNaN)) return;
    const newOtp = [...otp];
    pastedData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    otpRefs.current[focusIndex]?.focus();
  };

  // ==================== UI RENDERING ====================
  return (
    <>
      <Navbar />
      <div className="al-layout-wrapper">
        <div id="al-auth-container" className="al-login-container al-fade-in">
          
          <div className="al-auth-header">
            <h2>Agent Portal</h2>
            <p>
              {view === 'login' && "Secure access for partners"}
              {view === 'forgot-email' && "Reset your password"}
              {view === 'reset-password' && "Create new password"}
              {(view === 'otp' || view === 'forgot-otp') && "Verify your identity"}
            </p>
          </div>
          
          {/* VIEW: Standard Login */}
          {view === 'login' && (
            <form id="al-login-form" onSubmit={handleLoginInit}>
              <div className="al-input-group">
                <label htmlFor="al-email-input">Email Address</label>
                <input 
                  id="al-email-input" type="email" 
                  value={email} onChange={e => setEmail(e.target.value)} required 
                />
              </div>
              <div className="al-input-group" style={{ marginBottom: '5px' }}>
                <label htmlFor="al-password-input">Password</label>
                <input 
                  id="al-password-input" type="password" 
                  value={password} onChange={e => setPassword(e.target.value)} required 
                />
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <span 
                  style={{ color: '#c0392b', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }} 
                  onClick={() => { setView('forgot-email'); setAuthError(''); }}
                >
                  Forgot Password?
                </span>
              </div>
              
              {authError && <div className="al-auth-error">{authError}</div>}
              
              <button type="submit" className="al-btn-primary al-full-width" disabled={authLoading}>
                {authLoading ? <span className="al-spinner-sm"></span> : "Verify Credentials"}
              </button>
            </form>
          )}

          {/* VIEW: Forgot Password - Request Email */}
          {view === 'forgot-email' && (
            <form onSubmit={handleForgotEmailSubmit}>
              <div className="al-input-group">
                <label>Registered Email Address</label>
                <input 
                  type="email" value={email} 
                  onChange={e => setEmail(e.target.value)} required 
                  placeholder="Enter your agent email"
                />
              </div>
              {authError && <div className="al-auth-error">{authError}</div>}
              <button type="submit" className="al-btn-primary al-full-width" disabled={authLoading}>
                {authLoading ? <span className="al-spinner-sm"></span> : "Send OTP"}
              </button>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span 
                  style={{ color: '#555', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }} 
                  onClick={() => { setView('login'); setAuthError(''); }}
                >
                  Back to Login
                </span>
              </div>
            </form>
          )}

          {/* VIEW: Shared OTP Screen (For Login OR Forgot Password) */}
          {(view === 'otp' || view === 'forgot-otp') && (
            <div id="al-otp-section" className="al-otp-container">
              <p className="al-otp-instruction">Enter 6-digit code sent to {email}</p>
              
              <div className="al-otp-inputs">
                {otp.map((d, i) => (
                  <input 
                    key={i} id={`al-otp-input-${i}`}
                    ref={el => otpRefs.current[i] = el} 
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={d} onChange={e => handleOtpChange(e, i)} 
                    onKeyDown={e => handleKeyDown(e, i)} onPaste={handlePaste}
                    maxLength={2} autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="al-resend-container">
                {canResend ? (
                  <p>Didn't receive the code? <span className="al-resend-link" onClick={handleResendOtp}>Resend Now</span></p>
                ) : (
                  <p>Resend OTP in <strong>{timeLeft}s</strong></p>
                )}
              </div>
              
              {authError && <div className="al-auth-error">{authError}</div>}
              
              <button 
                onClick={view === 'otp' ? handleVerifyOtp : handleVerifyForgotOtp} 
                className="al-btn-primary al-full-width" 
                disabled={authLoading || otp.join("").length < 6} 
              >
                {authLoading ? <span className="al-spinner-sm"></span> : (view === 'otp' ? "Access Dashboard" : "Verify & Continue")}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span 
                  style={{ color: '#555', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }} 
                  onClick={() => { setView('login'); setAuthError(''); setOtp(new Array(6).fill("")); }}
                >
                  Cancel & Back to Login
                </span>
              </div>
            </div>
          )}

          {/* VIEW: Reset Password (After OTP verification) */}
          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword}>
              <div className="al-input-group">
                <label>New Password</label>
                <input 
                  type="password" value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} required 
                />
              </div>
              <div className="al-input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} required 
                />
              </div>
              
              {authError && <div className="al-auth-error">{authError}</div>}
              
              <button type="submit" className="al-btn-primary al-full-width" disabled={authLoading}>
                {authLoading ? <span className="al-spinner-sm"></span> : "Update Password"}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default AgentLogin;

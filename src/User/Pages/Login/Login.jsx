import React, { useState, useRef, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import toast, { Toaster } from 'react-hot-toast'; // Added for professional alerts
import './Login.css';

// --- ICONS ---
const Icons = {
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  ArrowRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
};

// Upgraded CustomInput to handle password toggling and autoComplete
const CustomInput = ({ label, name, type = "text", value, onChange, placeholder, icon: Icon, disabled, autoComplete, isPassword, showPassword, togglePassword }) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-wrapper" style={{ position: 'relative' }}>
      <input 
        name={name}
        type={isPassword && !showPassword ? "password" : type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        style={isPassword ? { paddingRight: '40px' } : {}}
      />
      {Icon && <span className="input-icon"><Icon /></span>}
      {isPassword && (
        <button 
          type="button" 
          onClick={togglePassword}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      )}
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate(); 
  const location = useLocation(); // Used to catch the email from Register page
  
  const [step, setStep] = useState(1);   
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password visibility state

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef([]);
  const API_BASE_URL = "https://kalyanashobha-back.vercel.app/api/auth";

  // --- Auto-fill email from Registration ---
  useEffect(() => {
    if (location.state && location.state.savedEmail) {
      setEmail(location.state.savedEmail);
    }
  }, [location]);

  // --- Timer Logic ---
  useEffect(() => {
    if ((step === 2 || step === 4) && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if ((step === 2 || step === 4) && timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, step]);

  // --------------------------
  // LOGIN FLOW
  // --------------------------

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(2);
        setOtp(new Array(6).fill("")); 
        setTimeLeft(30); 
        setCanResend(false);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('Server error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

            if (data.success) {
        toast.success("Login Successful!");
        
        // Existing code
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // --- ADD THIS NEW LINE ---
        // Safely grab the ID whether your backend sends it as user._id, user.id, or userId
        const extractedUserId = data.user?._id || data.user?.id || data.userId;
        localStorage.setItem('userId', extractedUserId); 
        // -------------------------

        navigate('/dashboard'); 
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }

    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------------------
  // FORGET PASSWORD FLOW
  // -------------------------------------------------------------------------------------

  const handleForgotPasswordInit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!email) return setError("Please enter your email.");

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setStep(4); 
        setOtp(new Array(6).fill(""));
        setTimeLeft(30); 
        setCanResend(false);
        toast.success("OTP sent to your email");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtpVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return setError("Enter full OTP");

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code })
      });

      const data = await response.json();

      if (data.success) {
        setStep(5); 
        setError("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword) return setError("Enter a new password");

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password Reset Successful! You can now login.");
        setStep(1);
        setPassword("");
        setNewPassword("");
        setOtp(new Array(6).fill(""));
        setError("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let bodyData = {};

      if (step === 2) {
        endpoint = `${API_BASE_URL}/login-init`;
        bodyData = { email, password };
      } else if (step === 4) {
        endpoint = `${API_BASE_URL}/forgot-password`;
        bodyData = { email };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("A new OTP has been sent.");
        setOtp(new Array(6).fill("")); 
        setTimeLeft(30); 
        setCanResend(false);
        otpRefs.current[0]?.focus(); 
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (e) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP HANDLERS
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
       otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
       if (step === 2) verifyOtp();
       if (step === 4) handleForgotOtpVerify();
    }
  };

  useEffect(() => {
    if ((step === 2 || step === 4) && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  return (
    <>
      <Navbar/>
      <Toaster position="top-center" reverseOrder={false} /> {/* Added Toaster */}
      <div className="login-wrapper">
        <div className="login-card fade-in">
          
          <div className="brand-header">
            <h2>Welcome Back</h2>
            <p className="subtitle">Secure login to Kalyana Shobha</p>
          </div>

          {/* ------------------------- STEP 1: LOGIN ------------------------- */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit}>
              <CustomInput 
                label="Email Address"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={Icons.Mail}
                disabled={loading}
              />
              <CustomInput 
                label="Password"
                name="password"
                type="text" // Type handled internally by CustomInput
                autoComplete="current-password"
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={Icons.Lock}
                disabled={loading}
              />
              {error && <div className="error-banner">{error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="spinner-sm"></span> Verifying...</> : <>Continue <Icons.ArrowRight/></>}
              </button>
              <div className="footer-links">
                <button type="button" onClick={() => { setStep(3); setError(""); }} className="link-btn" disabled={loading}>
                  Forgot Password?
                </button>
              </div>
              <div className="register-section">
                <span className="register-text">Don't have an account?</span>
                <Link to="/registration" className="register-link">Register Now</Link>
              </div>
            </form>
          )}

          {/* ------------------------- STEP 2: LOGIN OTP ------------------------- */}
          {step === 2 && (
            <div className="otp-section">
              <p className="otp-instruction">Enter the 6-digit login code<br/><strong>{email}</strong></p>
              <div className="otp-container">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    className="otp-input"
                    type="tel"
                    value={d}
                    ref={(el) => otpRefs.current[i] = el}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="resend-container" style={{ marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                {canResend ? (
                  <p>Didn't receive the code? <span onClick={handleResendOtp} style={{ color: '#C5A059', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Resend Now</span></p>
                ) : (
                  <p>Resend OTP in <strong>{timeLeft}s</strong></p>
                )}
              </div>

              {error && <div className="error-banner">{error}</div>}
              <button onClick={verifyOtp} className="login-btn" disabled={loading}>
                {loading ? <><span className="spinner-sm"></span> Verifying...</> : "Verify & Login"}
              </button>
            </div>
          )}

          {/* ------------------------- STEP 3: FORGOT EMAIL ------------------------- */}
          {step === 3 && (
            <form onSubmit={handleForgotPasswordInit}>
              <CustomInput 
                label="Enter your email"
                name="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                icon={Icons.Mail}
                disabled={loading}
              />
              {error && <div className="error-banner">{error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="spinner-sm"></span> Sending...</> : "Send OTP"}
              </button>
              <button type="button" className="link-btn" onClick={() => { setStep(1); setError(""); }} style={{marginTop: '15px', width: '100%'}} disabled={loading}>
                Back to Login
              </button>
            </form>
          )}

          {/* ------------------------- STEP 4: FORGOT PASSWORD OTP ------------------------- */}
          {step === 4 && (
            <div className="otp-section">
              <p className="otp-instruction">Enter OTP sent to<br/><strong>{email}</strong></p>
              <div className="otp-container">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    className="otp-input"
                    type="tel"
                    value={d}
                    ref={(el) => otpRefs.current[i] = el}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="resend-container" style={{ marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                {canResend ? (
                  <p>Didn't receive the code? <span onClick={handleResendOtp} style={{ color: '#C5A059', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Resend Now</span></p>
                ) : (
                  <p>Resend OTP in <strong>{timeLeft}s</strong></p>
                )}
              </div>

              {error && <div className="error-banner">{error}</div>}
              <button onClick={handleForgotOtpVerify} className="login-btn" disabled={loading}>
                 {loading ? <><span className="spinner-sm"></span> Verifying...</> : "Verify OTP"}
              </button>
            </div>
          )}

          {/* ------------------------- STEP 5: RESET PASSWORD ------------------------- */}
          {step === 5 && (
            <form onSubmit={handleResetPassword}>
              <CustomInput 
                label="New Password"
                name="new-password"
                type="text" 
                autoComplete="new-password"
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                icon={Icons.Lock}
                disabled={loading}
              />
              {error && <div className="error-banner">{error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                 {loading ? <><span className="spinner-sm"></span> Updating...</> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;

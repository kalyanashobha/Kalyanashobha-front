import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminLogin.css';
import AdminNavbar from "../Components/AdminNavbar.jsx";

const AdminLogin = () => {
    const navigate = useNavigate();

    // State management
    const [view, setView] = useState('login'); // 'login', 'login-otp', 'forgot-email', 'forgot-otp', 'reset-password'

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // UPDATED: Now pointing to live Vercel backend 
    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/auth";

    // --- HARDWARE BACK BUTTON INTERCEPTION ---
    useEffect(() => {
        // Replace current history state with the initial view when component mounts
        window.history.replaceState({ view: 'login' }, '');

        const handlePopState = (event) => {
            // If the back button is pressed, check if we have a saved view in history
            if (event.state && event.state.view) {
                setView(event.state.view);
            } else {
                // Fallback to login
                setView('login');
            }
            // Clear any lingering errors/messages and OTP when navigating back
            setMessage({ type: '', text: '' });
            setOtp('');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Helper function to handle view changes AND browser history injection
    const changeView = (newView) => {
        window.history.pushState({ view: newView }, '');
        setView(newView);
        setMessage({ type: '', text: '' }); // Clear errors
    };

    // Helper for UI "Back" buttons to keep history stack clean
    const handleUIBack = () => {
        window.history.back(); // This triggers the popstate listener automatically
    };


    // ==================== LOGIN WORKFLOW ====================

    // --- STEP 1: SEND PASSWORD ---
    const handleLoginInit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();

        try {
            const res = await axios.post(`${API_BASE}/login-init`, { email: safeEmail, password });
            if (res.data.success) {
                changeView('login-otp'); // Updated to use history helper
                setMessage({ type: 'success', text: 'OTP sent to your email.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Login failed. Check credentials." });
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();
        const safeOtp = String(otp).trim();

        try {
            const res = await axios.post(`${API_BASE}/login-verify`, { email: safeEmail, otp: safeOtp });
            if (res.data.success) {

                // --- ROLE VERIFICATION CHECK ---
                if (res.data.admin.role !== 'SuperAdmin') {
                    toast.error("Access Restricted: This portal is strictly for Super Administrators. Please use the Moderator login.", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        theme: "colored",
                    });

                    setOtp('');
                    setIsLoading(false);
                    return; 
                }

                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));

                toast.success('Authentication successful! Redirecting...', {
                    position: "top-right",
                    theme: "colored"
                });

                setMessage({ type: 'success', text: 'Login Successful! Redirecting...' });
                setTimeout(() => navigate('/admin/dashboard'), 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Invalid OTP.";
            toast.error(errorMsg, { theme: "colored" });
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };


    // ==================== FORGOT PASSWORD WORKFLOW ====================

    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();

        try {
            const res = await axios.post(`${API_BASE}/forgot-password`, { email: safeEmail });
            if (res.data.success) {
                changeView('forgot-otp'); // Updated to use history helper
                setOtp(''); 
                setMessage({ type: 'success', text: 'Password reset OTP sent to your email.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Email not found." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyForgotOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();
        const safeOtp = String(otp).trim();

        try {
            const res = await axios.post(`${API_BASE}/verify-otp`, { email: safeEmail, otp: safeOtp });
            if (res.data.success) {
                changeView('reset-password'); // Updated to use history helper
                setMessage({ type: 'success', text: 'OTP Verified. Create a new password.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Invalid OTP." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setMessage({ type: 'error', text: "Passwords do not match." });
        }

        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();

        try {
            const res = await axios.post(`${API_BASE}/reset-password`, { email: safeEmail, newPassword });
            if (res.data.success) {
                setMessage({ type: 'success', text: 'Password reset successfully! Please login.' });
                setPassword(''); setNewPassword(''); setConfirmPassword(''); setOtp('');

                // Return to login after 2 seconds
                setTimeout(() => changeView('login'), 2000); // Updated to use history helper
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to reset password." });
        } finally {
            setIsLoading(false);
        }
    };

    // --- OTP INPUT HANDLER ---
    const handleOtpChange = (e) => {
        const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6); 
        setOtp(cleanValue);
    };

    // ==================== UI RENDERING ====================
    return (
      <>
        <AdminNavbar/>

        <ToastContainer />

        <div className="admin-login-container">
            <div className="login-card">

                <div className="login-header">
                    <h2>KalyanaShobha</h2>
                    <p>
                        {view === 'login' && 'Admin Portal Access'}
                        {(view === 'login-otp' || view === 'forgot-otp') && 'Security Verification'}
                        {view === 'forgot-email' && 'Reset Password'}
                        {view === 'reset-password' && 'Create New Password'}
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* VIEW: Login Credentials */}
                {view === 'login' && (
                    <form onSubmit={handleLoginInit}>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input 
                                type="email" className="form-control" 
                                placeholder="Enter admin email" value={email}
                                onChange={(e) => setEmail(e.target.value)} required 
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label>Password</label>
                            <input 
                                type="password" className="form-control" 
                                placeholder="Enter password" value={password}
                                onChange={(e) => setPassword(e.target.value)} required 
                            />
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <span 
                                style={{ color: '#c0392b', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }} 
                                onClick={() => changeView('forgot-email')}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Secure Login'}
                        </button>
                    </form>
                )}

                {/* VIEW: Login OTP */}
                {view === 'login-otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input 
                                type="tel" className="form-control" 
                                placeholder="6-digit code" value={otp}
                                onChange={handleOtpChange} required autoFocus
                            />
                            <small style={{display:'block', marginTop:'5px', color:'#777'}}>
                                Check inbox for {email}
                            </small>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Enter Dashboard'}
                        </button>

                        <div className="back-link" onClick={handleUIBack}>
                            &larr; Cancel & Back to Login
                        </div>
                    </form>
                )}

                {/* VIEW: Forgot Password - Request Email */}
                {view === 'forgot-email' && (
                    <form onSubmit={handleForgotEmailSubmit}>
                        <div className="form-group">
                            <label>Registered Admin Email</label>
                            <input 
                                type="email" className="form-control" 
                                placeholder="Enter admin email" value={email}
                                onChange={(e) => setEmail(e.target.value)} required autoFocus
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <div className="back-link" onClick={handleUIBack}>
                            &larr; Back to Login
                        </div>
                    </form>
                )}

                {/* VIEW: Forgot Password - Verify OTP */}
                {view === 'forgot-otp' && (
                    <form onSubmit={handleVerifyForgotOtp}>
                        <div className="form-group">
                            <label>Enter Reset OTP</label>
                            <input 
                                type="tel" className="form-control" 
                                placeholder="6-digit code" value={otp}
                                onChange={handleOtpChange} required autoFocus
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="back-link" onClick={handleUIBack}>
                            &larr; Cancel Reset
                        </div>
                    </form>
                )}

                {/* VIEW: Forgot Password - Reset Password */}
                {view === 'reset-password' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" className="form-control" 
                                placeholder="Enter new password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} required autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password" className="form-control" 
                                placeholder="Confirm new password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

            </div>
        </div>
      </>
    );
};

export default AdminLogin;

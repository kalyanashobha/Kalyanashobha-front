import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // You can rename this CSS file if needed
import AdminNavbar from "../Components/AdminNavbar.jsx"; // Update to ModeratorNavbar if you have one

const ModeratorLogin = () => {
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

    // API remains exactly the same
    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/auth";

    // ==================== LOGIN WORKFLOW ====================

    // --- STEP 1: SEND PASSWORD ---
    const handleLoginInit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setMessage({ type: '', text: '' });

        const safeEmail = email.trim().toLowerCase();

        try {
            const res = await axios.post(`${API_BASE}/login-init`, { email: safeEmail, password });
            if (res.data.success) {
                setView('login-otp');
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
                // Kept keys the same or you can change them to 'moderatorToken' if your app expects it
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));

                setMessage({ type: 'success', text: 'Login Successful! Redirecting...' });
                // Updated redirect path to moderator dashboard
                setTimeout(() => navigate('/moderator/dashboard'), 1000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Invalid OTP." });
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
                setView('forgot-otp');
                setOtp(''); // Clear any previous OTP
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
                setView('reset-password');
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
                setTimeout(() => setView('login'), 2000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to reset password." });
        } finally {
            setIsLoading(false);
        }
    };

    // --- OTP INPUT HANDLER (Strips spaces and non-numbers instantly) ---
    const handleOtpChange = (e) => {
        const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6); // Keep only digits, max 6
        setOtp(cleanValue);
    };

    // ==================== UI RENDERING ====================
    return (
      <>
        <AdminNavbar/>

        <div className="admin-login-container">
            <div className="login-card">

                {/* Header */}
                <div className="login-header">
                    <h2>KalyanaShobha</h2>
                    <p>
                        {view === 'login' && 'Moderator Portal Access'}
                        {(view === 'login-otp' || view === 'forgot-otp') && 'Security Verification'}
                        {view === 'forgot-email' && 'Reset Password'}
                        {view === 'reset-password' && 'Create New Password'}
                    </p>
                </div>

                {/* Alerts */}
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* VIEW: Login Credentials */}
                {view === 'login' && (
                    <form onSubmit={handleLoginInit}>
                        <div className="form-group">
                            <label>Moderator Email</label>
                            <input 
                                type="email" className="form-control" 
                                placeholder="Enter moderator email" value={email}
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
                                onClick={() => { setView('forgot-email'); setMessage({ type: '', text: '' }); }}
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

                        <div className="back-link" onClick={() => { setView('login'); setMessage({type:'', text:''}); setOtp(''); }}>
                            &larr; Cancel & Back to Login
                        </div>
                    </form>
                )}

                {/* VIEW: Forgot Password - Request Email */}
                {view === 'forgot-email' && (
                    <form onSubmit={handleForgotEmailSubmit}>
                        <div className="form-group">
                            <label>Registered Moderator Email</label>
                            <input 
                                type="email" className="form-control" 
                                placeholder="Enter moderator email" value={email}
                                onChange={(e) => setEmail(e.target.value)} required autoFocus
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <div className="back-link" onClick={() => { setView('login'); setMessage({type:'', text:''}); }}>
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

                        <div className="back-link" onClick={() => { setView('login'); setMessage({type:'', text:''}); setOtp(''); }}>
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

export default ModeratorLogin;
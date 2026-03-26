import React, { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import { useNavigate } from 'react-router-dom';
import QRCode from "react-qr-code"; 
import toast, { Toaster } from 'react-hot-toast'; 
import { CheckCircle, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { BsPatchCheck } from "react-icons/bs"; 
import { MdPendingActions } from "react-icons/md"; 
import './Payment.css'; 

const PaymentRegistration = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 

  const [amount, setAmount] = useState(0); 
  const [upiId, setUpiId] = useState(''); // <-- NEW STATE FOR DYNAMIC UPI ID
  const [isFetchingFee, setIsFetchingFee] = useState(true);
  
  const [existingStatus, setExistingStatus] = useState(null);

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Delay for smooth skeleton transition
        await new Promise(resolve => setTimeout(resolve, 800));

        const feeRes = await fetch("https://kalyanashobha-back.vercel.app/api/user/registration-fee", {
          headers: { 'Authorization': token }
        });
        const feeData = await feeRes.json();
        
        if (feeData.success) {
          setAmount(feeData.fee);
          setUpiId(feeData.upiId || '8897714968@axl'); // <-- STORE THE FETCHED UPI ID (with fallback)
        }

        const statusRes = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/status", {
          headers: { 'Authorization': token }
        });
        const statusData = await statusRes.json();
        
        if (statusData.success && statusData.paymentFound) {
          if (statusData.data.status === 'PendingVerification' || statusData.data.status === 'Success') {
             setExistingStatus(statusData.data.status);
          }
        }

      } catch (err) {
        toast.error("Server connection failed.");
      } finally {
        setIsFetchingFee(false);
      }
    };

    fetchData();
  }, [navigate]);

  // <-- UPDATED UPILINK TO USE DYNAMIC STATE -->
  const upiLink = `upi://pay?pa=${upiId}&pn=Kalyana%20Shobha&am=${amount}&cu=INR`; 

  const handlePayClick = () => {
    toast.success("Opening UPI App...", { duration: 3000 });
    window.location.href = upiLink;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!utrNumber || !screenshot) {
      toast.error("Please provide both UTR Number and Payment Screenshot.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying payment..."); 

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to continue.", { id: toastId });
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('amount', amount); 
      formData.append('utrNumber', utrNumber);
      formData.append('screenshot', screenshot);

      const response = await fetch("https://kalyanashobha-back.vercel.app/api/payment/registration/submit", {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });
      
      const data = await response.json();

      if (data.success) {
        toast.success("Payment submitted successfully!", { id: toastId });
        setExistingStatus("PendingVerification"); 
      } else {
        toast.error(data.message || "Submission failed.", { id: toastId });
      }
    } catch (err) {
      toast.error("Server connection failed. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingFee) {
    return (
      <>
        <Navbar />
        <div className="ks-payment-layout">
          <div className="ks-payment-container">
            {/* Left Skeleton */}
            <div className="ks-summary-panel">
              <div className="ks-skeleton ks-skeleton-text" style={{ width: '30%', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}></div>
              <div className="ks-skeleton ks-skeleton-price" style={{ width: '60%', background: 'rgba(255,255,255,0.1)', marginBottom: '50px' }}></div>
              <div className="ks-features-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="ks-feature-item" style={{ alignItems: 'center' }}>
                    <div className="ks-skeleton ks-skeleton-icon" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ flex: 1 }}>
                      <div className="ks-skeleton ks-skeleton-text" style={{ width: '50%', background: 'rgba(255,255,255,0.1)', marginBottom: '8px' }}></div>
                      <div className="ks-skeleton ks-skeleton-text" style={{ width: '80%', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Skeleton */}
            <div className="ks-action-panel">
              <div className="ks-action-content">
                <div className="ks-skeleton ks-skeleton-title" style={{ width: '60%', marginBottom: '16px' }}></div>
                <div className="ks-skeleton ks-skeleton-text" style={{ width: '90%', marginBottom: '40px' }}></div>
                <div className="ks-skeleton ks-skeleton-box" style={{ height: '200px', width: '200px', margin: '0 auto 30px' }}></div>
                <div className="ks-skeleton ks-skeleton-text" style={{ width: '50%', margin: '0 auto 40px' }}></div>
                <div className="ks-skeleton ks-skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Toaster position="top-center" containerStyle={{ zIndex: 999999, top: 80 }} reverseOrder={false} />

      <div className="ks-payment-layout">
        <div className="ks-payment-container">
          
          {/* LEFT COLUMN: PRODUCT SUMMARY */}
          <div className="ks-summary-panel">
            <div className="ks-summary-header">
              <h2 className="ks-summary-title">Profile Registration</h2> 
              <div className="ks-price-tag">
                <span className="ks-amount">{amount.toLocaleString('en-IN')}</span>
                <span className="ks-currency">INR</span>
              </div>
            </div>

            <div className="ks-features-list">
              <div className="ks-feature-item">
                <div className="ks-icon-wrapper"><CheckCircle size={22} strokeWidth={2.5} /></div>
                <div className="ks-feature-text">
                  <strong>Profile Verification</strong>
                  <p>Standard manual review of your details.</p>
                </div>
              </div>
              <div className="ks-feature-item">
                <div className="ks-icon-wrapper"><CheckCircle size={22} strokeWidth={2.5} /></div>
                <div className="ks-feature-text">
                  <strong>Platform Access</strong>
                  <p>Get full access to basic dashboard features.</p>
                </div>
              </div>
              <div className="ks-feature-item">
                <div className="ks-icon-wrapper"><CheckCircle size={22} strokeWidth={2.5} /></div>
                <div className="ks-feature-text">
                  <strong>Profile Activation</strong>
                  <p>Make your profile active and visible on our network.</p>
                </div>
              </div>
            </div>
            
            <div className="ks-secure-badge">
              <ShieldCheck size={20} strokeWidth={1.5} /> 
              <span>SSL Encrypted & Secure Payment</span>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION AREA */}
          <div className="ks-action-panel">
            
            {existingStatus ? (
              <div className="ks-action-content ks-fade-in ks-status-view">
                <div className="ks-status-icon">
                   {existingStatus === 'Success' 
                     ? <BsPatchCheck size={72} color="var(--ks-success)" /> 
                     : <MdPendingActions size={72} color="var(--ks-warning)" />}
                </div>
                <h3 className={existingStatus === 'Success' ? 'ks-text-success' : 'ks-text-warning'}>
                   {existingStatus === 'Success' ? 'Payment Approved' : 'Verification Pending'}
                </h3>
                <p className="ks-status-desc">
                  {existingStatus === 'Success' 
                    ? 'Your membership is active. You do not need to submit another payment.' 
                    : 'We have received your payment details. Our administration team is currently verifying your transaction.'}
                </p>
                <button className="ks-btn-primary ks-mt-lg" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="ks-action-content ks-fade-in">
                    <h3 className="ks-action-title">Select Payment Method</h3>
                    <p className="ks-step-desc">
                      {isMobile ? "Pay securely via any UPI Application" : "Scan QR code with your mobile device"}
                    </p>

                    <div className="ks-alert-box ks-alert-info">
                      <div className="ks-alert-header">
                        <AlertTriangle size={18} strokeWidth={2} />
                        <strong>Important Requirement</strong>
                      </div>
                      <p>After completing the payment on your app, you <b>must</b> return to this screen to submit your UTR number and screenshot.</p>
                    </div>
                    
                    {isMobile ? (
                      <>
                        <div className="ks-manual-link-area ks-mobile-link-area">
                          <p>Payment Completed?</p>
                          <button className="ks-btn-text" onClick={() => setStep(2)}>
                            Enter Transaction Details <ArrowRight size={18} strokeWidth={2} />
                          </button>
                        </div>

                        <button className="ks-btn-primary" onClick={handlePayClick}>
                          Pay INR {amount.toLocaleString('en-IN')}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="ks-qr-container">
                          <div className="ks-qr-box">
                             <QRCode value={upiLink} size={180} fgColor="var(--ks-text-main)" />
                          </div>
                          <p className="ks-qr-text">Scan with GPay, PhonePe, or Paytm</p>
                          <div className="ks-divider"><span>OR</span></div>
                          {/* <-- UPDATED MANUAL TEXT TO SHOW DYNAMIC UPI ID --> */}
                          <p className="ks-manual-upi">UPI ID: <strong>{upiId}</strong></p>
                        </div>
                        
                        <div className="ks-manual-link-area">
                          <p>Payment Completed?</p>
                          <button className="ks-btn-text" onClick={() => setStep(2)}>
                            Enter Transaction Details <ArrowRight size={18} strokeWidth={2} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="ks-action-content ks-fade-in">
                    <h3 className="ks-action-title">Verify Transaction</h3>
                    <p className="ks-step-desc">Provide reference details to activate your account.</p>

                    <div className="ks-input-group">
                      <label htmlFor="utr">UTR / Reference ID</label>
                      <input 
                        id="utr"
                        type="text" 
                        value={utrNumber} 
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 123456789012"
                        className="ks-input-field"
                      />
                    </div>

                    <div className="ks-input-group">
                      <label>Screenshot Proof</label>
                      <div className="ks-file-drop-area">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="ks-file-input"
                        />
                        <span className="ks-file-msg">
                          {screenshot ? screenshot.name : "Click to Upload Screenshot"}
                        </span>
                      </div>
                    </div>

                    <div className="ks-btn-group">
                      <button type="button" className="ks-btn-secondary" onClick={() => setStep(1)}>Back</button>
                      <button type="submit" className="ks-btn-primary" disabled={loading}>
                        {loading ? "Verifying..." : "Submit Verification"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentRegistration;

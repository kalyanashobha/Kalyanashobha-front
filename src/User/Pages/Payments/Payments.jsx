import React, { useState, useEffect } from 'react';
import { Calendar, Wallet, Hash, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Navbar from "../../Components/Navbar.jsx";
import "./Payments.css";

// --- SKELETON LOADER ---
const PaymentSkeleton = () => (
  <div className="pmt-content">
    <div className="pmt-row pmt-header-row skeleton-header">
      <div className="skeleton-line shimmer" style={{width: '80px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '70px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '100px'}}></div>
      <div className="skeleton-line shimmer" style={{width: '60px'}}></div>
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="pmt-row pmt-data-row">
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '90px', height: '16px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '70px', height: '16px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '120px', height: '16px'}}></div></div>
        <div className="pmt-col"><div className="skeleton-line shimmer" style={{width: '80px', height: '28px', borderRadius: '14px'}}></div></div>
      </div>
    ))}
  </div>
);

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://kalyanashobha-back.vercel.app/api";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/payment-history`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        }
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.membershipHistory || []);
      }
    } catch (err) {
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusType = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (['success', 'approved', 'paid', 'completed'].includes(s)) return 'success';
    if (['failed', 'rejected', 'cancelled'].includes(s)) return 'failed';
    return 'pending';
  };

  const getStatusIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={14} strokeWidth={2.5} />;
    if (type === 'failed') return <XCircle size={14} strokeWidth={2.5} />;
    return <Clock size={14} strokeWidth={2.5} />;
  };

  return (
    <>
      <Navbar/>

      <div className="pmt-dashboard fade-in">
        
        {/* Header Section */}
        <div className="pmt-header">
          <h2 className="pmt-title">Transaction History</h2>
          <p className="pmt-subtitle">View and manage your membership payments</p>
        </div>

        {/* Content Area */}
        <div className="pmt-table-container">
          
          {loading ? (
            <PaymentSkeleton />
          ) : (
            <div className="pmt-content ks-card-shadow">
              
              {/* Desktop Table Header */}
              <div className="pmt-row pmt-header-row">
                <div className="pmt-col pmt-col-date">
                  <span className="ks-icon-box-small ks-bg-blue"><Calendar size={14} strokeWidth={2.5} /></span> Date
                </div>
                <div className="pmt-col pmt-col-amount">
                  <span className="ks-icon-box-small ks-bg-green"><Wallet size={14} strokeWidth={2.5} /></span> Amount
                </div>
                <div className="pmt-col pmt-col-ref">
                  <span className="ks-icon-box-small ks-bg-purple"><Hash size={14} strokeWidth={2.5} /></span> Reference ID
                </div>
                <div className="pmt-col pmt-col-status">
                  <span className="ks-icon-box-small ks-bg-orange"><Activity size={14} strokeWidth={2.5} /></span> Status
                </div>
              </div>

              {/* Data Rows */}
              {payments.length > 0 ? (
                payments.map((pay) => {
                  const statusType = getStatusType(pay.status);
                  
                  return (
                    <div key={pay._id} className="pmt-row pmt-data-row">
                      
                      {/* Date */}
                      <div className="pmt-col pmt-col-date" data-label="Date">
                        <div className="pmt-cell-wrap">
                          <span className="pmt-text-primary">
                            {pay.date ? new Date(pay.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', month: 'short', year: 'numeric'
                            }) : '-'}
                          </span>
                          <span className="pmt-text-secondary">
                            {pay.date ? new Date(pay.date).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', minute:'2-digit'
                            }) : ''}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="pmt-col pmt-col-amount" data-label="Amount">
                        <div className="pmt-cell-wrap">
                          <span className="pmt-amount">
                            ₹{parseFloat(pay.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="pmt-col pmt-col-ref" data-label="Reference ID">
                        <div className="pmt-cell-wrap">
                          <span className="pmt-ref-badge">{pay.utrNumber || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="pmt-col pmt-col-status" data-label="Status">
                        <div className="pmt-cell-wrap">
                          <span className={`pmt-status-pill pmt-status-${statusType}`}>
                            {getStatusIcon(statusType)}
                            {pay.status || 'Pending'}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="pmt-empty-state">
                  <Wallet size={48} className="pmt-empty-icon ks-color-gray" strokeWidth={1.5} />
                  <p className="pmt-empty-title">No transactions found</p>
                  <p className="pmt-empty-sub">Your payment history will appear here once you make a transaction.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payments;

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../Components/Navbar.jsx"; // Adjust path if needed
import './Interests.css';

// --- HELPER TO TRANSLATE STATUS ---
// --- HELPER TO TRANSLATE STATUS ---
const getUserFriendlyStatus = (status) => {
    switch (status) {
        case 'PendingAdminPhase1':
            return 'Under Admin Review';

        case 'PendingUser':
            return 'Awaiting Response from Member';

        case 'PendingAdminPhase2':
            return 'Final Verification in Progress';

        case 'Finalized':
        case 'Accepted':
            return 'Connection Established';

        case 'Declined':
            return 'Interest Declined';

        case 'Rejected':
            return 'Request Not Approved';

        default:
            return 'Processing';
    }
};

// --- CLEAN NAME FORMATTER ---
// Takes "Sanjay" and "Adepu" -> Returns "A. Sanjay"
const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return "Unknown";
  if (!lastName) return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  if (!firstName) return lastName;

  const surnameInitial = lastName.charAt(0).toUpperCase();
  const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return `${surnameInitial}. ${formattedFirstName}`;
};

const Interests = () => {
  const [activeTab, setActiveTab] = useState('received'); // received | sent | connected
  const [sentList, setSentList] = useState([]);
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const neutralAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; 
  const API_BASE = "https://kalyanashobha-back.vercel.app/api/user";

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async (isBackground = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to view connections");
      return;
    }

    if (!isBackground) setLoading(true);

    try {
      const [resSent, resRec] = await Promise.all([
        fetch(`${API_BASE}/interests/sent`, { headers: { 'Authorization': token } }),
        fetch(`${API_BASE}/interests/received`, { headers: { 'Authorization': token } })
      ]);

      const dataSent = await resSent.json();
      const dataRec = await resRec.json();

      if (dataSent.success) setSentList(dataSent.data || []);
      if (dataRec.success) setReceivedList(dataRec.data || []);

    } catch (err) {
      if (!isBackground) toast.error("Could not load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId, action) => {
    toast((t) => (
      <div className="toast-confirm">
        <span className="toast-confirm__text">{action === 'accept' ? 'Accept' : 'Decline'} this request?</span>
        <div className="toast-confirm__actions">
          <button className="btn btn--primary btn--small" onClick={() => performAction(interestId, action, t.id)}>Yes</button>
          <button className="btn btn--secondary btn--small" onClick={() => toast.dismiss(t.id)}>No</button>
        </div>
      </div>
    ), { duration: 4000, position: 'top-center' });
  };

  const performAction = async (interestId, action, toastId) => {
    toast.dismiss(toastId);
    const loadingToast = toast.loading("Processing...");
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/interest/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ interestId, action })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Request ${action}ed successfully!`, { id: loadingToast });
        fetchInterests(true); 
      } else {
        toast.error(data.message || "Action failed", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const renderSkeleton = () => (
    <div className="profile-grid">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="profile-card skeleton">
          <div className="profile-card__header">
            <div className="skeleton__avatar shimmer"></div>
            <div className="skeleton__info">
              <div className="skeleton__line skeleton__line--long shimmer"></div>
              <div className="skeleton__line skeleton__line--short shimmer"></div>
            </div>
          </div>
          <div className="skeleton__body">
            <div className="skeleton__line shimmer"></div>
            <div className="skeleton__line skeleton__line--medium shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const Card = ({ profile, status, type, onAction, item }) => {
    const isConnected = ['Finalized', 'Accepted'].includes(status);

    let age = "--";
    if (profile?.dob) {
       const diff = Date.now() - new Date(profile.dob).getTime();
       const ageDate = new Date(diff);
       age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return (
      <div className="profile-card fade-in">
        <div className="profile-card__header">
          <img src={neutralAvatar} alt="User Avatar" className="profile-card__avatar" />
          <div className="profile-card__user-info">
            {/* USING THE NEW FORMAT NAME FUNCTION HERE */}
            <h3 className="profile-card__name">
              {formatName(profile?.firstName, profile?.lastName)}
            </h3>
            <p className="profile-card__role">{profile?.jobRole || profile?.occupation || "Not Specified"}</p>
            {/* FIXED: Styled exactly like screenshot 3 */}
            {isConnected && (
              <span style={{ 
                color: '#15803d', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                marginTop: '6px', 
                display: 'block',
                letterSpacing: '0.02em'
              }}>
                MANAGED BY ADMIN
              </span>
            )}
          </div>
        </div>

        <div className="profile-card__details">
          <div className="detail-item">
            <span className="detail-item__label">ID</span>
            <span className="detail-item__value detail-item__value--highlight">{profile?.uniqueId || "--"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Age</span>
            <span className="detail-item__value">{age} Yrs</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Education</span>
            <span className="detail-item__value">{profile?.education || profile?.highestQualification || "--"}</span>
          </div>

          {/* FIXED: Forced Location text to wrap cleanly */}
          <div className="detail-item">
            <span className="detail-item__label">Location</span>
            <span className="detail-item__value" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {profile?.city ? `${profile.city}, ${profile.state}` : "--"}
            </span>
          </div>

          {/* FIXED: Forced Community text to wrap cleanly */}
          <div className="detail-item">
            <span className="detail-item__label">Community</span>
            <span className="detail-item__value" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {profile?.community || profile?.caste || "--"}
            </span>
          </div>

          {/* FIXED: Forced Sub-Community text to wrap cleanly */}
          <div className="detail-item">
            <span className="detail-item__label">Sub-Community</span>
            <span className="detail-item__value" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {profile?.subCommunity || "--"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-item__label">Height</span>
            <span className="detail-item__value">{profile?.height ? `${profile.height} cm` : "--"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-item__label">Status</span>
            <span className="detail-item__value">{profile?.maritalStatus || "--"}</span>
          </div>
        </div>

        {!isConnected && (
          <div className="profile-card__tracker">
             <span className={`status-pill status-pill--${status?.toLowerCase() || 'default'}`}>
               {getUserFriendlyStatus(status)}
             </span>
          </div>
        )}

        {type === 'received' && status === 'PendingUser' && (
          <div className="profile-card__actions">
            <button onClick={() => onAction(item._id, 'accept')} className="btn btn--success">Accept</button>
            <button onClick={() => onAction(item._id, 'decline')} className="btn btn--danger">Decline</button>
          </div>
        )}
      </div>
    );
  };

  const getDisplayData = () => {
    if (activeTab === 'received') {
      return receivedList
        .filter(i => !['Finalized', 'Accepted'].includes(i.status))
        .map(item => ({ ...item, profile: item.senderId, type: 'received' }));
    }
    if (activeTab === 'sent') {
      return sentList
        .filter(i => !['Finalized', 'Accepted'].includes(i.status))
        .map(item => ({ ...item, profile: item.receiverId || item.receiverProfile, type: 'sent' }));
    }
    if (activeTab === 'connected') {
      const acceptedSent = sentList
        .filter(i => ['Finalized', 'Accepted'].includes(i.status))
        .map(i => ({ ...i, profile: i.receiverId || i.receiverProfile }));
        
      const acceptedRec = receivedList
        .filter(i => ['Finalized', 'Accepted'].includes(i.status))
        .map(i => ({ ...i, profile: i.senderId }));
        
      return [...acceptedSent, ...acceptedRec].map(item => ({ ...item, type: 'connected' }));
    }
    return [];
  };

  const displayData = getDisplayData();
  const pendingRequestsCount = receivedList.filter(i => i.status === 'PendingUser').length;

  return (
    <div className="network-page">
      <Navbar />
      <Toaster position="top-center" toastOptions={{ className: 'premium-toast' }} />

      <main className="network-dashboard">
        <header className="dashboard-header">
          <h2 className="dashboard-header__title">My Network</h2>
          <nav className="dashboard-tabs">
            <button 
              className={`dashboard-tabs__btn ${activeTab === 'received' ? 'dashboard-tabs__btn--active' : ''}`} 
              onClick={() => setActiveTab('received')}
            >
              Requests {pendingRequestsCount > 0 && <span className="notification-dot"></span>}
            </button>
            <button 
              className={`dashboard-tabs__btn ${activeTab === 'sent' ? 'dashboard-tabs__btn--active' : ''}`} 
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
            <button 
              className={`dashboard-tabs__btn ${activeTab === 'connected' ? 'dashboard-tabs__btn--active' : ''}`} 
              onClick={() => setActiveTab('connected')}
            >
              Connected
            </button>
          </nav>
        </header>

        <section className="dashboard-content">
          {loading ? (
            renderSkeleton()
          ) : displayData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <p className="empty-state__text">No {activeTab} profiles found.</p>
            </div>
          ) : (
            <div className="profile-grid">
              {displayData.map((item) => (
                <Card 
                  key={item._id} 
                  item={item} 
                  profile={item.profile} 
                  status={item.status} 
                  type={item.type} 
                  onAction={handleRespond} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Interests;

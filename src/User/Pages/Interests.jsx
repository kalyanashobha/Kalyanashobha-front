import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  MapPin, 
  GraduationCap, 
  CalendarDays, 
  Fingerprint, 
  ShieldCheck, 
  Clock, 
  Check, 
  X, 
  Inbox, 
  Send, 
  Users,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import Navbar from "../Components/Navbar.jsx";
import './Interests.css';

// --- HELPER TRANSLATIONS ---
const getUserFriendlyStatus = (status) => {
    switch (status) {
        case 'PendingAdminPhase1': return 'Under Admin Review';
        case 'PendingUser': return 'Awaiting Response from Member';
        case 'PendingAdminPhase2': return 'Final Verification in Progress';
        case 'Finalized':
        case 'Accepted': return 'Connection Established';
        case 'Declined': return 'Interest Declined';
        case 'Rejected': return 'Request Not Approved';
        default: return 'Processing';
    }
};

const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return "Unknown";
  if (!lastName) return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  if (!firstName) return lastName;
  return `${lastName.charAt(0).toUpperCase()}. ${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()}`;
};

const Interests = () => {
  const [activeTab, setActiveTab] = useState('received');
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
        <p className="toast-confirm__text">
          {action === 'accept' ? 'Accept this connection request?' : 'Decline this connection request?'}
        </p>
        <div className="toast-confirm__actions">
          <button className="ui-btn ui-btn--primary" onClick={() => performAction(interestId, action, t.id)}>
            <Check size={16} /> Confirm
          </button>
          <button className="ui-btn ui-btn--ghost" onClick={() => toast.dismiss(t.id)}>
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const performAction = async (interestId, action, toastId) => {
    // 1. Gracefully dismiss the confirmation toast
    toast.dismiss(toastId); 

    // 2. Trigger the processing toast
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
        // 3. Replace the loading toast with a success toast seamlessly
        toast.success(
          action === 'accept' ? 'Request Accepted' : 'Request Declined', 
          { id: loadingToast }
        );
        fetchInterests(true); 
      } else {
        // Replace with error toast
        toast.error(data.message || "Action failed", { id: loadingToast });
      }
    } catch (err) {
      // Replace with network error toast
      toast.error("Network error", { id: loadingToast });
    }
  };

  const renderSkeleton = () => (
    <div className="ui-list">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="ui-row skeleton">
          <div className="skeleton__avatar shimmer"></div>
          <div className="skeleton__info" style={{ flex: 1 }}>
            <div className="skeleton__line shimmer" style={{width: '40%', height: '16px', marginBottom: '8px'}}></div>
            <div className="skeleton__line shimmer" style={{width: '25%', height: '12px'}}></div>
          </div>
          <div className="skeleton__info" style={{ flex: 1.5, display: 'flex', gap: '16px' }}>
            <div className="skeleton__line shimmer" style={{width: '100px', height: '24px', borderRadius: '4px'}}></div>
            <div className="skeleton__line shimmer" style={{width: '100px', height: '24px', borderRadius: '4px'}}></div>
          </div>
          <div className="skeleton__line shimmer" style={{width: '120px', height: '36px', borderRadius: '8px'}}></div>
        </div>
      ))}
    </div>
  );

  const ProfileRow = ({ profile, status, type, onAction, item }) => {
    const isConnected = ['Finalized', 'Accepted'].includes(status);

    let age = "--";
    if (profile?.dob) {
       const diff = Date.now() - new Date(profile.dob).getTime();
       const ageDate = new Date(diff);
       age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    return (
      <div className="ui-row fade-in">
        <div className="ui-row__avatar-wrapper">
          <img src={neutralAvatar} alt="Avatar" className="ui-row__avatar" />
          {isConnected && (
            <div className="ui-row__admin-badge" title="Admin Managed">
              <ShieldCheck size={12} />
            </div>
          )}
        </div>

        <div className="ui-row__identity">
          <div className="ui-row__name-group">
            <h3 className="ui-row__name">
              {formatName(profile?.firstName, profile?.lastName)}
            </h3>
            <span className="ui-row__id"><Fingerprint size={12} /> {profile?.uniqueId || "--"}</span>
          </div>
          <p className="ui-row__role">
            <Briefcase size={14} />
            {profile?.jobRole || profile?.occupation || "Profession Not Specified"}
          </p>
        </div>

        <div className="ui-row__details">
          <div className="row-detail">
            <CalendarDays size={14} className="icon-age" />
            <span>{age} yrs</span>
          </div>
          <div className="row-detail">
            <MapPin size={14} className="icon-location" />
            <span>{profile?.city ? `${profile.city}, ${profile.state}` : "--"}</span>
          </div>
          <div className="row-detail">
            <GraduationCap size={14} className="icon-education" />
            <span>{profile?.education || profile?.highestQualification || "--"}</span>
          </div>
        </div>

        <div className="ui-row__actions">
          {isConnected ? (
             <span className="ui-status ui-status--finalized">
                <ShieldCheck size={14} /> Connected
             </span>
          ) : type === 'received' && status === 'PendingUser' ? (
            <div className="ui-row__btn-group">
              <button onClick={() => onAction(item._id, 'decline')} className="ui-btn ui-btn--soft-danger">
                Decline
              </button>
              <button onClick={() => onAction(item._id, 'accept')} className="ui-btn ui-btn--soft-success">
                Accept <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <span className={`ui-status ui-status--${status?.toLowerCase() || 'default'}`}>
              {status?.toLowerCase().includes('admin') ? <ShieldCheck size={14} /> : <Clock size={14} />}
              {getUserFriendlyStatus(status)}
            </span>
          )}
        </div>
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
    <div className="page-container">
      <Navbar />

      <Toaster 
        position="top-center" 
        containerStyle={{
          top: 80, 
          zIndex: 99999 
        }}
        toastOptions={{ 
            style: { 
              borderRadius: '12px', 
              background: '#0F172A', 
              color: '#fff', 
              fontSize: '14px',
              padding: '16px'
            } 
        }} 
      />

      <main className="dashboard">
        <header className="dashboard__header">
          <h2 className="dashboard__title">Network & Connections</h2>
          <nav className="ui-tabs">
            <button 
              className={`ui-tab ${activeTab === 'received' ? 'ui-tab--active' : ''}`} 
              onClick={() => setActiveTab('received')}
            >
              <Inbox size={18} /> Requests 
              {pendingRequestsCount > 0 && <span className="ui-tab__badge">{pendingRequestsCount}</span>}
            </button>
            <button 
              className={`ui-tab ${activeTab === 'sent' ? 'ui-tab--active' : ''}`} 
              onClick={() => setActiveTab('sent')}
            >
              <Send size={18} /> Sent
            </button>
            <button 
              className={`ui-tab ${activeTab === 'connected' ? 'ui-tab--active' : ''}`} 
              onClick={() => setActiveTab('connected')}
            >
              <Users size={18} /> Connected
            </button>
          </nav>
        </header>

        <section className="dashboard__content">
          {loading ? (
            renderSkeleton()
          ) : displayData.length === 0 ? (
            <div className="ui-empty-state">
              <div className="ui-empty-state__icon">
                <Inbox size={48} strokeWidth={1} />
              </div>
              <h3 className="ui-empty-state__title">No profiles found</h3>
              <p className="ui-empty-state__text">You don't have any {activeTab} connections at the moment.</p>
            </div>
          ) : (
            <div className="ui-list">
              {displayData.map((item) => (
                <ProfileRow 
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

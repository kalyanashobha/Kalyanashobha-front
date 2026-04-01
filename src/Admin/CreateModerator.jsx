import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateModerator() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [moderators, setModerators] = useState([]);
  const [isFetchingMods, setIsFetchingMods] = useState(true);
  const [editingModId, setEditingModId] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Global Scroll Indicator State
  const [showMainScroll, setShowMainScroll] = useState(false);

  // UPDATED PERMISSIONS LIST to match all options from AdminSidebar
  const availablePermissions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "User Registry" },
    { id: "premium-users", label: "Premium Users" },
    { id: "reg-approvals", label: "Registration Approvals" },
    { id: "interest-approvals", label: "Interest Approvals" },
    { id: "data-approval", label: "Data Approval" },
    { id: "premium-requests", label: "Premium Requests" },
    { id: "vendor-leads", label: "Vendor Leads" },
    { id: "help-center", label: "Help Center" },
    { id: "agents", label: "Agents Management" },
    { id: "vendors", label: "Vendors Management" },
    { id: "user-certificates", label: "User Acceptance" },
    { id: "add-data", label: "Add Data Fields" },
    { id: "manage-pages", label: "Manage Pages" },
    { id: "testimonials", label: "Testimonials" },
    { id: "fee-settings", label: "Fee Settings" },
    { id: "create-moderator", label: "Create Moderator" }
  ];

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    setIsFetchingMods(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://kalyanashobha-back.vercel.app/api/admin/moderators', {
        headers: { Authorization: token }
      });
      if (response.data.success) {
        setModerators(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch moderators", error);
      toast.error("Failed to load moderators.");
    } finally {
      setIsFetchingMods(false);
    }
  };

  // Pagination Calculations
  const totalPages = Math.ceil(moderators.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentModerators = moderators.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
          setCurrentPage(pageNumber);
      }
  };

  // --- GLOBAL SCROLL INDICATOR LOGIC ---
  useEffect(() => {
    const checkMainScroll = () => {
        // Hide if there is 1 or fewer items to prevent false positives on short pages
        if (currentModerators.length <= 1) {
            setShowMainScroll(false);
            return;
        }

        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Check if the document is taller than the viewport
        const isScrollable = documentHeight > windowHeight + 10;

        // Check if we haven't scrolled to the very bottom yet
        const isNotAtBottom = scrollY + windowHeight < documentHeight - 30;

        // Only show the indicator if it's scrollable AND we aren't at the bottom
        setShowMainScroll(isScrollable && isNotAtBottom);
    };

    const timer = setTimeout(checkMainScroll, 50); 
    window.addEventListener('scroll', checkMainScroll);
    window.addEventListener('resize', checkMainScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', checkMainScroll);
        window.removeEventListener('resize', checkMainScroll);
    };
  }, [currentModerators, currentPage, moderators]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setSelectedPermissions((prev) => 
      prev.includes(id) 
        ? prev.filter(perm => perm !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setSelectedPermissions([]); 
    } else {
      setSelectedPermissions(availablePermissions.map(p => p.id)); 
    }
  };

  const handleEditClick = (mod) => {
    setEditingModId(mod._id);
    setFormData({
      username: mod.username,
      email: mod.email,
      password: '' 
    });
    setSelectedPermissions(mod.permissions || []);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleCancelEdit = () => {
    setEditingModId(null);
    setFormData({ username: '', email: '', password: '' });
    setSelectedPermissions([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this moderator? This action cannot be undone.")) return;

    const toastId = toast.loading('Deleting moderator...');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/moderators/${id}`, {
        headers: { Authorization: token }
      });

      if (response.data.success) {
        toast.success('Moderator deleted successfully.', { id: toastId });
        fetchModerators(); 
        if (editingModId === id) handleCancelEdit(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete moderator.', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading(editingModId ? 'Updating moderator...' : 'Creating moderator profile...');

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        ...formData,
        permissions: selectedPermissions
      };

      let response;

      if (editingModId) {
        response = await axios.put(
          `https://kalyanashobha-back.vercel.app/api/admin/moderators/${editingModId}`,
          payload,
          { headers: { Authorization: token } }
        );
      } else {
        response = await axios.post(
          'https://kalyanashobha-back.vercel.app/api/admin/create-moderator',
          payload,
          { headers: { Authorization: token } }
        );
      }

      if (response.data.success) {
        toast.success(editingModId ? 'Moderator updated successfully.' : 'Moderator profile successfully created.', { id: toastId });
        handleCancelEdit(); 
        fetchModerators();  
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingModId ? 'update' : 'create'} moderator.`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ks-mod-admin-wrapper">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{`
        :root {
          /* Thick Red Theme */
          --ks-mod-primary: #dc2626; 
          --ks-mod-primary-hover: #b91c1c; 
          --ks-mod-text-dark: #0f172a;
          --ks-mod-text-muted: #64748b;
          --ks-mod-border: #e2e8f0;
          --ks-mod-bg-light: #f8fafc;
          --ks-mod-danger: #ef4444;
          --ks-mod-success-bg: #f0fdf4;
          --ks-mod-success-text: #166534;
          --ks-mod-error-bg: #fef2f2;
          --ks-mod-error-text: #991b1b;
          --ks-mod-radius: 12px;
          --ks-mod-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
          --ks-mod-anim: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Essential reset */
        .ks-mod-admin-wrapper * {
          box-sizing: border-box;
        }

        .ks-mod-admin-wrapper {
          padding: 32px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--ks-mod-text-dark);
          background-color: var(--ks-mod-bg-light);
          min-height: 100vh;
          width: 100%;
        }

        .ks-mod-card {
          background: #ffffff;
          border-radius: var(--ks-mod-radius);
          padding: 32px;
          border: 1px solid var(--ks-mod-border);
          box-shadow: var(--ks-mod-shadow);
          margin-bottom: 24px;
        }

        .ks-mod-header {
          margin-bottom: 24px;
        }

        .ks-mod-header h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-header p {
          margin: 0;
          color: var(--ks-mod-text-muted);
          font-size: 15px;
        }

        .ks-mod-form {
          display: flex;
          flex-direction: column;
          gap: 20px; 
        }

        .ks-mod-input-grid {
          display: flex;
          flex-direction: column;
          gap: 20px; 
        }

        .ks-mod-form-group {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .ks-mod-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: var(--ks-mod-text-muted);
        }

        .ks-mod-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--ks-mod-border);
          border-radius: 8px;
          font-size: 14px;
          color: var(--ks-mod-text-dark);
          outline: none;
          transition: var(--ks-mod-anim);
          background-color: #fff;
        }

        .ks-mod-input:focus {
          border-color: var(--ks-mod-primary);
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        .ks-mod-permissions-panel {
          background-color: var(--ks-mod-bg-light);
          border: 1px solid var(--ks-mod-border);
          border-radius: 12px;
          padding: 24px;
          margin-top: 10px;
        }

        .ks-mod-perm-header-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .ks-mod-perm-titles h3 {
          margin: 0 0 6px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .ks-mod-perm-titles p {
          margin: 0;
          font-size: 14px;
          color: var(--ks-mod-text-muted);
        }

        .ks-mod-btn-outline {
          background: #ffffff;
          border: 1px solid var(--ks-mod-border);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: var(--ks-mod-text-dark);
          transition: var(--ks-mod-anim);
          align-self: flex-start;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .ks-mod-btn-outline:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .ks-mod-permissions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .ks-mod-checkbox-card {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid var(--ks-mod-border);
          border-radius: 8px;
          cursor: pointer;
          transition: var(--ks-mod-anim);
        }

        .ks-mod-checkbox-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .ks-mod-checkbox-card.is-active {
          border-color: var(--ks-mod-primary);
          background-color: #fef2f2;
        }

        .ks-mod-checkbox-card input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          cursor: pointer;
          accent-color: var(--ks-mod-primary);
        }

        .ks-mod-checkbox-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-form-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .ks-mod-btn-primary {
          background-color: var(--ks-mod-primary);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--ks-mod-anim);
          width: 100%;
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
        }

        .ks-mod-btn-primary:hover:not(:disabled) {
          background-color: var(--ks-mod-primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
        }

        .ks-mod-btn-primary:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .ks-mod-btn-cancel {
          background-color: #ffffff;
          color: var(--ks-mod-text-dark);
          border: 1px solid var(--ks-mod-border);
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: var(--ks-mod-anim);
        }
        .ks-mod-btn-cancel:hover {
          background-color: #f1f5f9;
        }

        /* --- SKELETON STYLES --- */
        .ks-mod-skeleton-row td {
          padding: 16px 20px;
        }
        .ks-mod-sk-box {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: ks-shimmer 1.5s infinite;
          height: 20px;
          border-radius: 6px;
        }
        @keyframes ks-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ks-sk-username { width: 120px; }
        .ks-sk-email { width: 180px; }
        .ks-sk-badge { width: 80px; border-radius: 20px; }
        .ks-sk-actions { width: 140px; margin-left: auto; }

        /* --- TABLE STYLES --- */
        .ks-mod-table-container {
          width: 100%;
          overflow-x: auto; 
        }

        .ks-mod-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px; 
          text-align: left;
        }

        .ks-mod-table th {
          background-color: var(--ks-mod-bg-light);
          padding: 16px 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--ks-mod-text-sub);
          border-bottom: 1px solid var(--ks-mod-border);
        }
        
        .ks-mod-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          vertical-align: middle;
        }

        .ks-mod-table tr:last-child td { border-bottom: none; }
        .ks-mod-table tr:hover td { background-color: var(--ks-mod-bg-light); }

        .ks-mod-td-bold {
          font-weight: 700;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-td-muted {
          color: var(--ks-mod-text-sub);
        }

        .ks-mod-badge {
          background-color: #f1f5f9;
          color: var(--ks-mod-text-sub);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: inline-block;
          border: 1px solid var(--ks-mod-border);
        }

        .ks-mod-actions-cell {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .ks-mod-table th.actions-header { text-align: right; }

        .ks-mod-action-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: var(--ks-mod-anim);
        }

        .ks-mod-btn-edit {
          background-color: #ffffff;
          color: var(--ks-mod-text-dark);
          border-color: var(--ks-mod-border);
        }
        .ks-mod-btn-edit:hover { background-color: #f1f5f9; border-color: #cbd5e1; }

        .ks-mod-btn-delete {
          background-color: var(--ks-mod-error-bg);
          color: var(--ks-mod-danger);
        }
        .ks-mod-btn-delete:hover { background-color: #fecaca; }

        .ks-mod-empty-state {
          text-align: center;
          padding: 60px 20px !important;
          color: var(--ks-mod-text-sub);
          font-size: 15px;
        }

        /* --- PAGINATION STYLES --- */
        .ks-mod-pagination-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-top: 1px solid var(--ks-mod-border);
            background: #f8fafc;
            flex-wrap: wrap;
            gap: 16px;
            border-bottom-left-radius: var(--ks-mod-radius);
            border-bottom-right-radius: var(--ks-mod-radius);
            margin: 0 -32px -32px -32px; 
        }

        .ks-mod-pagination-text { 
            font-size: 13px; 
            color: var(--ks-mod-text-sub); 
        }

        .ks-mod-pagination-controls { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }

        .ks-mod-page-btn {
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 4px;
            padding: 6px 16px;
            border: 1px solid var(--ks-mod-border);
            background: white;
            border-radius: var(--ks-mod-radius-sm);
            color: var(--ks-mod-text-dark);
            font-size: 13px; 
            font-weight: 600;
            cursor: pointer;
            transition: var(--ks-mod-anim);
        }

        .ks-mod-page-btn:hover:not(:disabled) { 
            background: #f1f5f9; 
            border-color: var(--ks-mod-border-hover); 
        }

        .ks-mod-page-btn:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
            background: #f8fafc; 
        }

        .ks-mod-page-number {
            min-width: 32px; 
            height: 32px;
            display: flex; 
            align-items: center; 
            justify-content: center;
            border-radius: 6px; 
            font-size: 13px; 
            font-weight: 600;
            background: var(--ks-mod-primary); 
            color: white;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
        }

        /* --- SCROLL INDICATOR UI --- */
        .ks-mod-scroll-indicator {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.9);
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          pointer-events: none; 
          z-index: 50;
          animation: bounceSubtle 2s infinite ease-in-out;
          backdrop-filter: blur(4px);
          display: flex; 
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 6px); }
        }

        /* Desktop Media Queries */
        @media (min-width: 768px) {
          .ks-mod-input-grid {
            flex-direction: row; 
          }
          .ks-mod-perm-header-row {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .ks-mod-btn-outline {
            align-self: center;
          }
          .ks-mod-permissions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ks-mod-form-actions {
            flex-direction: row;
          }
          .ks-mod-btn-primary, .ks-mod-btn-cancel {
            width: auto;
            min-width: 200px;
          }
        }

        /* =========================================================
           MOBILE RESPONSIVENESS (NO HORIZONTAL SCROLLING FIX)
           ========================================================= */
        @media (max-width: 767px) {
          .ks-mod-admin-wrapper { padding: 16px; }
          .ks-mod-card { padding: 20px; border-radius: 16px; overflow: hidden; }

          .ks-mod-header h2 { font-size: 20px; }
          .ks-mod-header p { font-size: 13px; }

          /* Table to Cards */
          .ks-mod-table-container { overflow-x: hidden; }
          .ks-mod-table thead { display: none; }
          
          .ks-mod-table, .ks-mod-table tbody, .ks-mod-table tr, .ks-mod-table td {
              display: block; width: 100%; box-sizing: border-box; min-width: unset; 
          }
          
          .ks-mod-table tr {
              margin-bottom: 16px; background: #ffffff;
              border: 1px solid var(--ks-mod-border); border-radius: 12px;
              padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          /* Flex alignment for Mobile Cells */
          .ks-mod-table td {
              display: flex; justify-content: space-between; align-items: flex-start;
              padding: 12px 0; border-bottom: 1px dashed var(--ks-mod-border);
              text-align: right; 
              gap: 12px; 
          }
          
          .ks-mod-table td:last-child { border-bottom: none; padding-bottom: 0; }
          .ks-mod-table td[data-label="Actions"] { padding-top: 16px; margin-top: 4px; align-items: center;}
          
          /* Inject Labels as the Left Flex Item */
          .ks-mod-table td::before {
              content: attr(data-label);
              font-size: 11px; font-weight: 700; color: var(--ks-mod-text-sub);
              text-transform: uppercase; letter-spacing: 0.5px;
              flex-shrink: 0; margin-top: 2px;
              width: 90px; 
              text-align: left;
          }

          /* OVERRIDE FOR SQUISHED TEXT ISSUE */
          .ks-mod-td-bold, .ks-mod-td-muted, .ks-mod-badge {
              flex: 1;
              word-break: break-all; 
              overflow-wrap: anywhere;
              text-align: right;
              font-size: 13px;
          }
          
          .ks-mod-actions-cell { width: 100%; justify-content: flex-end; }
          .ks-mod-action-btn { font-size: 12px; padding: 6px 12px; }

          /* Mobile Pagination Styling FIX */
          .ks-mod-pagination-bar {
              flex-direction: column;
              margin: 16px -20px -20px -20px; 
              padding: 16px 20px;
              align-items: center;
              justify-content: center;
              gap: 12px;
          }
          
          .ks-mod-pagination-controls { 
              width: 100%; 
              justify-content: center; 
              gap: 12px;
          }
          
          .ks-mod-page-btn { 
              flex: initial; 
              padding: 8px 20px; 
          }

          /* Skeleton Mobile */
          .ks-mod-skeleton-row td {
            display: flex; flex-direction: column; gap: 8px; border-bottom: none;
          }
          .ks-mod-skeleton-row td::before { display: none; }
          .ks-sk-username, .ks-sk-email, .ks-sk-badge, .ks-sk-actions { width: 100%; height: 16px; }
          .ks-sk-actions { height: 32px; margin-top: 8px; }
        }
      `}</style>

      {/* FORM SECTION */}
      <div className="ks-mod-card">
        <div className="ks-mod-header">
          <h2>{editingModId ? 'Edit Moderator Access' : 'Create Moderator Access'}</h2>
          <p>{editingModId ? 'Update administrative roles and permissions.' : 'Assign administrative roles and configure dashboard permissions.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="ks-mod-form">
          <div className="ks-mod-input-grid">
            <div className="ks-mod-form-group">
              <label className="ks-mod-label" htmlFor="ks-mod-username">Moderator Username</label>
              <input 
                id="ks-mod-username"
                className="ks-mod-input"
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. JohnAdmin"
              />
            </div>

            <div className="ks-mod-form-group">
              <label className="ks-mod-label" htmlFor="ks-mod-email">Official Email</label>
              <input 
                id="ks-mod-email"
                className="ks-mod-input"
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          <div className="ks-mod-form-group">
            <label className="ks-mod-label" htmlFor="ks-mod-password">
              {editingModId ? 'New Password (leave blank to keep current)' : 'Temporary Password'}
            </label>
            <input 
              id="ks-mod-password"
              className="ks-mod-input"
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required={!editingModId} 
              placeholder={editingModId ? "Enter new password if changing..." : "Set a strong secure password"}
            />
          </div>

          <div className="ks-mod-permissions-panel">
            <div className="ks-mod-perm-header-row">
              <div className="ks-mod-perm-titles">
                <h3>Module Permissions</h3>
                <p>Select the areas this moderator can access.</p>
              </div>
              <button type="button" onClick={handleSelectAll} className="ks-mod-btn-outline">
                {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="ks-mod-permissions-grid">
              {availablePermissions.map((perm) => (
                <label key={perm.id} className={`ks-mod-checkbox-card ${selectedPermissions.includes(perm.id) ? 'is-active' : ''}`}>
                  <input 
                    type="checkbox" 
                    id={`perm-${perm.id}`}
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleCheckboxChange(perm.id)}
                  />
                  <span className="ks-mod-checkbox-text">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ks-mod-form-actions">
            <button type="submit" disabled={isLoading} className="ks-mod-btn-primary">
              {isLoading 
                ? (editingModId ? 'Updating...' : 'Provisioning Account...') 
                : (editingModId ? 'Update Moderator' : 'Create Moderator Profile')}
            </button>
            {editingModId && (
              <button type="button" onClick={handleCancelEdit} className="ks-mod-btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="ks-mod-card" style={{ paddingBottom: 0 }}>
        <div className="ks-mod-header">
          <h2>Active Moderators</h2>
          <p>Manage existing sub-admins and their permissions.</p>
        </div>

        <div className="ks-mod-table-container">
          <table className="ks-mod-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Permissions</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isFetchingMods ? (
                /* Skeleton Loader */
                [...Array(itemsPerPage)].map((_, i) => (
                  <tr key={i} className="ks-mod-skeleton-row">
                    <td data-label="Username"><div className="ks-mod-sk-box ks-sk-username"></div></td>
                    <td data-label="Email"><div className="ks-mod-sk-box ks-sk-email"></div></td>
                    <td data-label="Permissions"><div className="ks-mod-sk-box ks-sk-badge"></div></td>
                    <td data-label="Actions"><div className="ks-mod-sk-box ks-sk-actions"></div></td>
                  </tr>
                ))
              ) : currentModerators.length > 0 ? (
                currentModerators.map(mod => (
                  <tr key={mod._id}>
                    <td data-label="Username" className="ks-mod-td-bold">{mod.username}</td>
                    <td data-label="Email" className="ks-mod-td-muted">{mod.email}</td>
                    <td data-label="Permissions">
                      <span className="ks-mod-badge">
                        {mod.permissions?.length || 0} Modules
                      </span>
                    </td>
                    <td data-label="Actions" className="ks-mod-actions-cell">
                      <button 
                        onClick={() => handleEditClick(mod)}
                        className="ks-mod-action-btn ks-mod-btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(mod._id)}
                        className="ks-mod-action-btn ks-mod-btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="ks-mod-empty-state">
                    No active moderators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ALWAYS VISIBLE PAGINATION CONTROLS */}
        {!isFetchingMods && totalPages >= 1 && (
            <div className="ks-mod-pagination-bar">
                <span className="ks-mod-pagination-text">
                    Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, moderators.length)}</strong> of <strong>{moderators.length}</strong>
                </span>

                <div className="ks-mod-pagination-controls">
                    <button 
                        className="ks-mod-page-btn"
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    <span className="ks-mod-page-number">
                        {currentPage}
                    </span>

                    <button 
                        className="ks-mod-page-btn"
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* GLOBAL SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="ks-mod-scroll-indicator">
              <ChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}

    </div>
  );
}

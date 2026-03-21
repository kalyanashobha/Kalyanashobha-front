import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateModerator() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [moderators, setModerators] = useState([]);
  const [editingModId, setEditingModId] = useState(null);

  const availablePermissions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "User Registry" },
    { id: "reg-approvals", label: "Registration Approvals" },
    { id: "interest-approvals", label: "Interest Approvals" },
    { id: "agents", label: "Agents Management" },
    { id: "vendors", label: "Vendors Management" },
    { id: "user-certificates", label: "User Acceptance" },
    { id: "add-data", label: "Add Data Fields" },
    { id: "vendor-leads", label: "Vendor Leads" },
    { id: "help-center", label: "Help Center" },
    { id: "data-approval", label: "Data Approval" },
    { id: "manage-pages", label: "Manage Pages" },
    { id: "testimonials", label: "Testimonials" }
  ];

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
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
    }
  };

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
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleCancelEdit = () => {
    setEditingModId(null);
    setFormData({ username: '', email: '', password: '' });
    setSelectedPermissions([]);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this moderator? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`https://kalyanashobha-back.vercel.app/api/admin/moderators/${id}`, {
        headers: { Authorization: token }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Moderator deleted successfully.' });
        fetchModerators(); 
        if (editingModId === id) handleCancelEdit(); 
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete moderator.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    if (selectedPermissions.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one permission.' });
      setIsLoading(false);
      return;
    }

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
        setMessage({ 
          type: 'success', 
          text: editingModId ? 'Moderator updated successfully.' : 'Moderator profile successfully created.' 
        });
        handleCancelEdit(); 
        fetchModerators();  
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to ${editingModId ? 'update' : 'create'} moderator.` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ks-mod-admin-wrapper">
      <style>{`
        :root {
          --ks-mod-primary: #8E1B1B;
          --ks-mod-primary-hover: #7a1717;
          --ks-mod-text-dark: #1e293b;
          --ks-mod-text-muted: #64748b;
          --ks-mod-border: #e2e8f0;
          --ks-mod-bg-light: #f8fafc;
          --ks-mod-danger: #ef4444;
          --ks-mod-success-bg: #f0fdf4;
          --ks-mod-success-text: #166534;
          --ks-mod-error-bg: #fef2f2;
          --ks-mod-error-text: #991b1b;
        }

        /* Essential fix for mobile overlapping */
        .ks-mod-admin-wrapper * {
          box-sizing: border-box;
        }

        .ks-mod-admin-wrapper {
          padding: 16px;
          font-family: 'Inter', -apple-system, sans-serif;
          color: var(--ks-mod-text-dark);
          background-color: #ffffff;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        .ks-mod-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--ks-mod-border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }

        .ks-mod-header {
          margin-bottom: 24px;
        }

        .ks-mod-header h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          font-weight: 700;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-header p {
          margin: 0;
          color: var(--ks-mod-text-muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .ks-mod-alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .ks-mod-alert-success {
          background-color: var(--ks-mod-success-bg);
          color: var(--ks-mod-success-text);
          border: 1px solid #bbf7d0;
        }

        .ks-mod-alert-error {
          background-color: var(--ks-mod-error-bg);
          color: var(--ks-mod-error-text);
          border: 1px solid #fecaca;
        }

        .ks-mod-form {
          display: flex;
          flex-direction: column;
          gap: 20px; /* Consistent spacing between all form rows */
        }

        .ks-mod-input-grid {
          display: flex;
          flex-direction: column;
          gap: 20px; /* Separates the username and email on mobile */
        }

        .ks-mod-form-group {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .ks-mod-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #475569;
        }

        .ks-mod-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--ks-mod-border);
          border-radius: 8px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          background-color: #fff;
        }

        .ks-mod-input:focus {
          border-color: var(--ks-mod-primary);
          box-shadow: 0 0 0 3px rgba(142, 27, 27, 0.1);
        }

        .ks-mod-permissions-panel {
          background-color: var(--ks-mod-bg-light);
          border: 1px solid var(--ks-mod-border);
          border-radius: 10px;
          padding: 20px;
          margin-top: 10px;
        }

        .ks-mod-perm-header-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .ks-mod-perm-titles h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
        }

        .ks-mod-perm-titles p {
          margin: 0;
          font-size: 13px;
          color: var(--ks-mod-text-muted);
        }

        .ks-mod-btn-outline {
          background: transparent;
          border: 1px solid var(--ks-mod-border);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: var(--ks-mod-text-dark);
          transition: background 0.2s;
          align-self: flex-start;
        }

        .ks-mod-btn-outline:hover {
          background: #e2e8f0;
        }

        .ks-mod-permissions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .ks-mod-checkbox-card {
          display: flex;
          align-items: center;
          padding: 14px;
          background: #fff;
          border: 1px solid var(--ks-mod-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ks-mod-checkbox-card.is-active {
          border-color: var(--ks-mod-primary);
          background-color: #fdf2f2;
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
          font-weight: 500;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-form-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .ks-mod-btn-primary {
          background-color: var(--ks-mod-primary);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }

        .ks-mod-btn-primary:hover {
          background-color: var(--ks-mod-primary-hover);
        }

        .ks-mod-btn-primary:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }

        .ks-mod-btn-cancel {
          background-color: transparent;
          color: var(--ks-mod-text-muted);
          border: 1px solid var(--ks-mod-border);
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
        }

        /* Table Styles */
        .ks-mod-table-container {
          width: 100%;
          overflow-x: auto; /* Enables horizontal scroll on small screens */
          -webkit-overflow-scrolling: touch;
        }

        .ks-mod-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px; /* Forces scroll on mobile so layout doesn't break */
        }

        .ks-mod-table th, .ks-mod-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid var(--ks-mod-border);
          font-size: 14px;
        }

        .ks-mod-table th {
          background-color: var(--ks-mod-bg-light);
          font-weight: 600;
          color: #475569;
        }

        .ks-mod-td-bold {
          font-weight: 600;
          color: var(--ks-mod-text-dark);
        }

        .ks-mod-td-muted {
          color: var(--ks-mod-text-muted);
        }

        .ks-mod-badge {
          background-color: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .ks-mod-actions-cell {
          display: flex;
          gap: 10px;
        }

        .ks-mod-action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .ks-mod-btn-edit {
          background-color: #f1f5f9;
          color: #334155;
        }
        .ks-mod-btn-edit:hover { background-color: #e2e8f0; }

        .ks-mod-btn-delete {
          background-color: #fef2f2;
          color: var(--ks-mod-danger);
        }
        .ks-mod-btn-delete:hover { background-color: #fecaca; }

        .ks-mod-empty-state {
          text-align: center;
          padding: 30px !important;
          color: var(--ks-mod-text-muted);
        }

        /* Desktop Media Queries */
        @media (min-width: 768px) {
          .ks-mod-admin-wrapper {
            padding: clamp(20px, 5vw, 40px);
          }
          .ks-mod-card {
            padding: 30px;
          }
          .ks-mod-input-grid {
            flex-direction: row; /* Places Username and Email side-by-side */
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

        @media (min-width: 1024px) {
          .ks-mod-permissions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* FORM SECTION */}
      <div className="ks-mod-card">
        <div className="ks-mod-header">
          <h2>{editingModId ? 'Edit Moderator Access' : 'Create Moderator Access'}</h2>
          <p>{editingModId ? 'Update administrative roles and permissions.' : 'Assign administrative roles and configure dashboard permissions.'}</p>
        </div>
        
        {message.text && (
          <div className={`ks-mod-alert ${message.type === 'success' ? 'ks-mod-alert-success' : 'ks-mod-alert-error'}`}>
            {message.text}
          </div>
        )}

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
                placeholder="moderator@kalyanashobha.in"
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
      <div className="ks-mod-card">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {moderators.length > 0 ? (
                moderators.map(mod => (
                  <tr key={mod._id}>
                    <td className="ks-mod-td-bold">{mod.username}</td>
                    <td className="ks-mod-td-muted">{mod.email}</td>
                    <td>
                      <span className="ks-mod-badge">
                        {mod.permissions?.length || 0} Modules
                      </span>
                    </td>
                    <td className="ks-mod-actions-cell">
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
                    No moderators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

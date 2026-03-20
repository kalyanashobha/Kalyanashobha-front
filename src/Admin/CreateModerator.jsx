import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateModerator.css'; 

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
    <div className="role-mgr-wrapper">
      
      {/* FORM SECTION */}
      <div className="role-mgr-card">
        <div className="role-mgr-header">
          <h2>{editingModId ? 'Edit Moderator Access' : 'Create Moderator Access'}</h2>
          <p>{editingModId ? 'Update administrative roles and permissions.' : 'Assign administrative roles and configure dashboard permissions.'}</p>
        </div>
        
        {message.text && (
          <div className={`role-mgr-alert role-mgr-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="role-mgr-form">
          <div className="role-mgr-input-grid">
            <div className="role-mgr-form-group">
              <label htmlFor="mgr-username">Moderator Username</label>
              <input 
                id="mgr-username"
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g. JohnAdmin"
              />
            </div>

            <div className="role-mgr-form-group">
              <label htmlFor="mgr-email">Official Email</label>
              <input 
                id="mgr-email"
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                placeholder="moderator@kalyanashobha.in"
              />
            </div>
          </div>

          <div className="role-mgr-form-group">
            <label htmlFor="mgr-password">
              {editingModId ? 'New Password (leave blank to keep current)' : 'Temporary Password'}
            </label>
            <input 
              id="mgr-password"
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required={!editingModId} 
              placeholder={editingModId ? "Enter new password if changing..." : "Set a strong secure password"}
            />
          </div>

          <div className="role-mgr-permissions-panel">
            <div className="role-mgr-permissions-header">
              <div className="role-mgr-perm-titles">
                <h3>Module Permissions</h3>
                <p>Select the areas this moderator can access.</p>
              </div>
              <button type="button" onClick={handleSelectAll} className="role-mgr-btn-outline">
                {selectedPermissions.length === availablePermissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="role-mgr-permissions-grid">
              {availablePermissions.map((perm) => (
                <label key={perm.id} className={`role-mgr-checkbox-wrapper ${selectedPermissions.includes(perm.id) ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    id={`perm-${perm.id}`}
                    checked={selectedPermissions.includes(perm.id)}
                    onChange={() => handleCheckboxChange(perm.id)}
                  />
                  <span className="role-mgr-checkbox-text">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="role-mgr-form-actions">
            <button type="submit" disabled={isLoading} className="role-mgr-btn-primary">
              {isLoading 
                ? (editingModId ? 'Updating...' : 'Provisioning Account...') 
                : (editingModId ? 'Update Moderator' : 'Create Moderator Profile')}
            </button>
            {editingModId && (
              <button type="button" onClick={handleCancelEdit} className="role-mgr-btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="role-mgr-card role-mgr-table-card">
        <div className="role-mgr-header">
          <h2>Active Moderators</h2>
          <p>Manage existing sub-admins and their permissions.</p>
        </div>

        <div className="role-mgr-table-container">
          <table className="role-mgr-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Permissions Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {moderators.length > 0 ? (
                moderators.map(mod => (
                  <tr key={mod._id}>
                    <td className="role-mgr-td-bold">{mod.username}</td>
                    <td className="role-mgr-td-muted">{mod.email}</td>
                    <td>
                      <span className="role-mgr-badge">
                        {mod.permissions?.length || 0} Modules
                      </span>
                    </td>
                    <td className="role-mgr-actions-cell">
                      <button 
                        onClick={() => handleEditClick(mod)}
                        className="role-mgr-btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(mod._id)}
                        className="role-mgr-btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="role-mgr-empty-state">
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

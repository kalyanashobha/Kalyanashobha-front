import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiPlus, FiX, FiLayers, FiList, FiCheckCircle, FiRefreshCw, 
  FiDatabase, FiTrash2, FiCornerDownRight, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import './AddCommunity.css';

// --- ALL CATEGORIES ADDED HERE ---
const CATEGORIES = [
  { id: 'Community', label: 'Community & Sub-Community' },
  { id: 'Religion', label: 'Religion' },
  { id: 'Gothra', label: 'Gothra' },
  { id: 'MotherTongue', label: 'Mother Tongue' },
  { id: 'Moonsign', label: 'Moonsign (Rasi)' },
  { id: 'Star', label: 'Star (Nakshatram)' },
  { id: 'Pada', label: 'Pada (Quarter)' },
  { id: 'Complexion', label: 'Complexion' },
  { id: 'Country', label: 'Country' },
  { id: 'State', label: 'State' },
  { id: 'City', label: 'City' },
  { id: 'Education', label: 'Highest Qualification' },
  { id: 'Income', label: 'Annual Income' },
  { id: 'Sector', label: 'Employment Sector' },
  { id: 'Designation', label: 'Current Designation' },
  { id: 'MaritalStatus', label: 'Marital Status' },
  { id: 'Height', label: 'Height' },
  { id: 'Diet', label: 'Dietary Preference' }
];

const ITEMS_PER_PAGE = 12; // Controls how many items show per page

const AdminMasterDataManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('Community'); 
  const [activeTab, setActiveTab] = useState('create'); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [deletingId, setDeletingId] = useState({ id: null, subName: null });
  const [existingItems, setExistingItems] = useState([]);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);

  const [mainInput, setMainInput] = useState(''); 
  const [subInput, setSubInput] = useState('');
  const [subItemsList, setSubItemsList] = useState([]);

  const getAuthToken = () => localStorage.getItem('adminToken'); 

  const fetchData = async () => {
    setFetching(true);
    try {
      let url = selectedCategory === 'Community' 
        ? 'https://kalyanashobha-back.vercel.app/api/public/get-all-communities'
        : `https://kalyanashobha-back.vercel.app/api/public/master-data/${selectedCategory}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setExistingItems(data.data); 
      } else {
        setExistingItems([]);
      }
    } catch (error) {
      toast.error(`Could not load data for ${selectedCategory}.`);
      setExistingItems([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    setMainInput('');
    setSubItemsList([]);
    setSubInput('');
    setCurrentPage(1); // Reset to page 1 when category changes
    
    if (selectedCategory !== 'Community') {
      setActiveTab('create');
    }
  }, [selectedCategory]);

  // Adjust page if current page becomes empty due to deletion
  useEffect(() => {
    const maxPage = Math.ceil(existingItems.length / ITEMS_PER_PAGE);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [existingItems.length, currentPage]);

  const handleSubKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = subInput.trim();
      if (val && !subItemsList.includes(val)) {
        setSubItemsList([...subItemsList, val]);
        setSubInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setSubItemsList(subItemsList.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = async (parentId, mainName, isSubCommunity = false, subName = null) => {
    const confirmMessage = isSubCommunity 
        ? `Are you sure you want to delete the sub-community "${subName}" from "${mainName}"?`
        : `Are you sure you want to delete the entire "${mainName}" category?`;

    if (!window.confirm(confirmMessage)) return;

    setDeletingId({ id: parentId, subName: subName });
    const token = getAuthToken();

    try {
      let url;
      if (selectedCategory === 'Community') {
          if (isSubCommunity) {
              url = `https://kalyanashobha-back.vercel.app/api/admin/community/${parentId}/sub/${encodeURIComponent(subName)}`;
          } else {
              url = `https://kalyanashobha-back.vercel.app/api/admin/community/${parentId}`;
          }
      } else {
          url = `https://kalyanashobha-back.vercel.app/api/admin/master-data/${parentId}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(isSubCommunity ? `"${subName}" removed.` : `"${mainName}" deleted successfully.`);
        
        if (isSubCommunity) {
            setExistingItems(prevItems => prevItems.map(item => {
                if (item._id === parentId) {
                    return { ...item, subCommunities: item.subCommunities.filter(sub => sub !== subName) };
                }
                return item;
            }));
        } else {
            setExistingItems(prevItems => prevItems.filter(item => item._id !== parentId));
        }
      } else {
        throw new Error(data.message || "Failed to delete item.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId({ id: null, subName: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainInput.trim()) {
      toast.error(activeTab === 'create' ? "Name is required" : "Please select an item");
      return;
    }

    setLoading(true);
    const token = getAuthToken();
    let url = '';
    let payload = {};

    if (selectedCategory === 'Community') {
      if (activeTab === 'create') {
        url = 'https://kalyanashobha-back.vercel.app/api/admin/add-community';
        payload = mainInput.includes(',') 
          ? { community: mainInput.split(',').map(s => s.trim()).filter(s => s) }
          : { community: mainInput.trim() };
      } else {
        url = 'https://kalyanashobha-back.vercel.app/api/admin/add-sub-community';
        if (subItemsList.length === 0) {
          toast.error("Please add at least one sub-community.");
          setLoading(false); return;
        }
        payload = { communityName: mainInput.trim(), subCommunities: subItemsList };
      }
    } else {
      url = 'https://kalyanashobha-back.vercel.app/api/admin/master-data';
      payload = {
        category: selectedCategory,
        name: mainInput.includes(',') ? mainInput.split(',').map(s => s.trim()).filter(s => s) : mainInput.trim(),
        subItems: [] 
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Saved Successfully");
        setMainInput('');
        setSubItemsList([]);
        setSubInput('');
        fetchData(); 
      } else {
        throw new Error(data.message || "Request failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(existingItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = existingItems.slice(indexOfFirstItem, indexOfLastItem);

  const isCommunity = selectedCategory === 'Community';
  const isBulkMode = activeTab === 'create' && mainInput.includes(',');

  return (
    <div className="sys-cfg-layout">
      <Toaster position="top-right" toastOptions={{ style: { background: '#000', color: '#fff', borderRadius: '4px' } }} />
      
      <div className="sys-cfg-surface">
        
        {/* --- CONTROLS SECTION --- */}
        <div className="sys-cfg-controls">
          <div className="sys-cfg-selector-box">
            <label className="sys-cfg-label">Target Data Category</label>
            <div className="sys-cfg-input-row">
              <select 
                className="sys-cfg-dropdown"
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <button onClick={fetchData} className="sys-cfg-refresh" title="Sync Data">
                <FiRefreshCw className={fetching ? 'sys-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        <div className="sys-cfg-separator"></div>

        {/* --- TABS --- */}
        {isCommunity && (
          <div className="sys-cfg-tab-group">
            <button 
              className={`sys-cfg-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => { setActiveTab('create'); setMainInput(''); setSubItemsList([]); }}
            >
              <FiLayers /> Main Community
            </button>
            <button 
              className={`sys-cfg-tab ${activeTab === 'append' ? 'active' : ''}`}
              onClick={() => { setActiveTab('append'); setMainInput(''); setSubItemsList([]); }}
            >
              <FiList /> Sub-Communities
            </button>
          </div>
        )}

        {/* --- FORM AREA --- */}
        <div className="sys-cfg-form-wrapper">
          <div className="sys-cfg-alert">
            <FiCheckCircle className="sys-cfg-alert-icon"/> 
            <span>
              {activeTab === 'create' 
                ? `Add a single ${selectedCategory} or input comma-separated values for bulk entry.` 
                : `Select a primary Community below to nest sub-communities within it.`}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="sys-cfg-form">
            {activeTab === 'create' && (
              <div className="sys-cfg-field">
                <label className="sys-cfg-label">{selectedCategory} Identifier(s)</label>
                <input 
                  type="text" 
                  className="sys-cfg-input"
                  placeholder={`e.g. Value 1, Value 2`}
                  value={mainInput}
                  onChange={(e) => setMainInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {activeTab === 'append' && isCommunity && (
              <>
                <div className="sys-cfg-field">
                  <label className="sys-cfg-label">Parent Community</label>
                  <select 
                    className="sys-cfg-dropdown"
                    value={mainInput}
                    onChange={(e) => setMainInput(e.target.value)}
                  >
                    <option value="">-- Assign Parent --</option>
                    {existingItems.map((item) => (
                      <option key={item._id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sys-cfg-field">
                  <label className="sys-cfg-label">Nested Entries</label>
                  <div className="sys-cfg-tag-area">
                    {subItemsList.map((tag, index) => (
                      <span key={index} className="sys-cfg-chip">
                        {tag} <FiX onClick={() => removeTag(tag)} className="sys-cfg-chip-close" />
                      </span>
                    ))}
                    <input 
                      type="text" 
                      className="sys-cfg-tag-input"
                      placeholder={subItemsList.length > 0 ? "Add next..." : "Press Enter or comma to add"}
                      value={subInput}
                      onChange={(e) => setSubInput(e.target.value)}
                      onKeyDown={handleSubKeyDown}
                      disabled={!mainInput} 
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="sys-cfg-btn-primary" disabled={loading}>
              {loading ? <span className="sys-cfg-loader-ring"></span> : (
                <>
                   <FiPlus /> 
                   {activeTab === 'create' 
                     ? (isBulkMode ? `Execute Bulk Save` : `Commit ${selectedCategory}`) 
                     : `Commit Nested Items`
                   }
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- LIVE PREVIEW GRID WITH PAGINATION --- */}
        <div className="sys-cfg-data-section">
          <div className="sys-cfg-data-header-row">
            <h3 className="sys-cfg-data-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
              <FiDatabase /> Active Records ({existingItems.length})
            </h3>
            
            {/* Top Pagination Controls (Optional, keeping it clean by just putting them at the bottom, but adding a page indicator here looks good) */}
            {existingItems.length > ITEMS_PER_PAGE && (
              <span className="sys-cfg-page-indicator">Page {currentPage} of {totalPages}</span>
            )}
          </div>
          
          <div className="sys-cfg-separator" style={{ marginTop: '16px' }}></div>

          {fetching ? (
            <div className="sys-cfg-grid">
              {[1, 2, 3, 4, 5, 6].map(skeleton => (
                <div key={skeleton} className="sys-cfg-skeleton-card">
                  <div className="sys-cfg-skel-text-main"></div>
                  <div className="sys-cfg-skel-text-sub"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="sys-cfg-grid">
                 {currentItems.length === 0 ? (
                     <p className="sys-cfg-empty-state">No records present on this page.</p>
                 ) : (
                     currentItems.map(item => (
                         <div key={item._id} className="sys-cfg-data-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                             
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div className="sys-cfg-data-content">
                                     <span className="sys-cfg-record-name">{item.name}</span>
                                 </div>
                                 <button 
                                     onClick={() => handleDelete(item._id, item.name, false)}
                                     className="sys-cfg-btn-delete"
                                     disabled={deletingId.id === item._id && !deletingId.subName}
                                     title={`Delete ${item.name}`}
                                 >
                                     {deletingId.id === item._id && !deletingId.subName ? <span className="sys-cfg-loader-ring-mini"></span> : <FiTrash2 />}
                                 </button>
                             </div>

                             {(isCommunity && item.subCommunities && item.subCommunities.length > 0) && (
                                 <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #e4e4e7' }}>
                                     {item.subCommunities.map((sub, idx) => (
                                         <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', paddingLeft: '0.5rem' }}>
                                             <span style={{ fontSize: '0.85rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <FiCornerDownRight style={{ color: '#a1a1aa' }}/> {sub}
                                             </span>
                                             <button 
                                                 onClick={() => handleDelete(item._id, item.name, true, sub)}
                                                 className="sys-cfg-btn-delete"
                                                 style={{ padding: '0.25rem' }}
                                                 disabled={deletingId.id === item._id && deletingId.subName === sub}
                                                 title={`Delete ${sub}`}
                                             >
                                                 {deletingId.id === item._id && deletingId.subName === sub ? <span className="sys-cfg-loader-ring-mini"></span> : <FiX size={14} />}
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             )}

                         </div>
                     ))
                 )}
              </div>

              {/* --- PAGINATION CONTROLS --- */}
              {totalPages > 1 && (
                <div className="sys-cfg-pagination">
                  <button 
                    className="sys-cfg-page-btn" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  
                  <div className="sys-cfg-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        className={`sys-cfg-page-num ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="sys-cfg-page-btn" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminMasterDataManager;

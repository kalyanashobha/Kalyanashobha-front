import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FiPlus, FiX, FiLayers, FiList, FiRefreshCw, 
  FiDatabase, FiTrash2, FiCornerDownRight, FiChevronLeft, FiChevronRight, FiMenu, FiChevronDown 
} from 'react-icons/fi';
import './AddCommunity.css';

const CATEGORIES = [
  { id: 'Country', label: 'Country' },
  { id: 'State', label: 'State' },
  { id: 'City', label: 'City' },
  { id: 'Community', label: 'Community & Sub-Community' },
  { id: 'Religion', label: 'Religion' },
  { id: 'Gothra', label: 'Gothra' },
  { id: 'MotherTongue', label: 'Mother Tongue' },
  { id: 'Moonsign', label: 'Moonsign (Rasi)' },
  { id: 'Star', label: 'Star (Nakshatram)' },
  { id: 'Pada', label: 'Pada (Quarter)' },
  { id: 'Complexion', label: 'Complexion' },
  { id: 'Education', label: 'Highest Qualification' },
  { id: 'Income', label: 'Annual Income' },
  { id: 'Sector', label: 'Employment Sector' },
  { id: 'Designation', label: 'Current Designation' },
  { id: 'MaritalStatus', label: 'Marital Status' },
  { id: 'Height', label: 'Height' },
  { id: 'Diet', label: 'Dietary Preference' }
];

const ITEMS_PER_PAGE = 12; 

const AdminMasterDataManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('Country'); 
  const [activeTab, setActiveTab] = useState('create'); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [deletingId, setDeletingId] = useState({ id: null, subName: null });
  const [existingItems, setExistingItems] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [mainInput, setMainInput] = useState(''); 
  const [subInput, setSubInput] = useState('');
  const [subItemsList, setSubItemsList] = useState([]);

  const [parentOptions, setParentOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');

  // Mobile Scroll Indicator State
  const [showMainScroll, setShowMainScroll] = useState(false);

  const getAuthToken = () => localStorage.getItem('adminToken'); 
  const API_BASE = 'https://kalyanashobha-back.vercel.app';

  const getParentCategory = (cat) => {
    if (cat === 'State') return 'Country';
    if (cat === 'City') return 'State';
    return null;
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      let url = selectedCategory === 'Community' 
        ? `${API_BASE}/api/public/get-all-communities`
        : `${API_BASE}/api/public/master-data/${selectedCategory}`;

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
    setCurrentPage(1); 
    setSelectedParent('');

    if (selectedCategory !== 'Community') {
      setActiveTab('create');
    }

    const parentCat = getParentCategory(selectedCategory);
    if (parentCat) {
      fetch(`${API_BASE}/api/public/master-data/${parentCat}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setParentOptions(data.data);
        })
        .catch(() => setParentOptions([]));
    } else {
      setParentOptions([]); 
    }
  }, [selectedCategory]);

  useEffect(() => {
    const maxPage = Math.ceil(existingItems.length / ITEMS_PER_PAGE);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [existingItems.length, currentPage]);

  // Scroll Indicator Logic
  useEffect(() => {
    const checkMainScroll = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        setShowMainScroll(documentHeight > windowHeight + 10 && scrollY + windowHeight < documentHeight - 60);
    };

    const timer = setTimeout(checkMainScroll, 500); 
    window.addEventListener('scroll', checkMainScroll);
    window.addEventListener('resize', checkMainScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', checkMainScroll);
        window.removeEventListener('resize', checkMainScroll);
    };
  }, [existingItems, activeTab, currentPage]);

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
      let url = selectedCategory === 'Community'
        ? (isSubCommunity 
            ? `${API_BASE}/api/admin/community/${parentId}/sub/${encodeURIComponent(subName)}`
            : `${API_BASE}/api/admin/community/${parentId}`)
        : `${API_BASE}/api/admin/master-data/${parentId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(isSubCommunity ? `"${subName}" removed.` : `"${mainName}" deleted successfully.`);
        if (isSubCommunity) {
            setExistingItems(prev => prev.map(item => item._id === parentId ? { ...item, subCommunities: item.subCommunities.filter(s => s !== subName) } : item));
        } else {
            setExistingItems(prev => prev.filter(item => item._id !== parentId));
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

    const parentCat = getParentCategory(selectedCategory);
    if (parentCat && !selectedParent) {
      toast.error(`Please select a parent ${parentCat}`);
      return;
    }

    setLoading(true);
    const token = getAuthToken();
    let url = '';
    let payload = {};

    if (selectedCategory === 'Community') {
      if (activeTab === 'create') {
        url = `${API_BASE}/api/admin/add-community`;
        payload = mainInput.includes(',') ? { community: mainInput.split(',').map(s => s.trim()).filter(s => s) } : { community: mainInput.trim() };
      } else {
        url = `${API_BASE}/api/admin/add-sub-community`;
        if (subItemsList.length === 0) {
          toast.error("Please add at least one sub-community.");
          setLoading(false); return;
        }
        payload = { communityName: mainInput.trim(), subCommunities: subItemsList };
      }
    } else {
      url = `${API_BASE}/api/admin/master-data`;
      payload = { 
        category: selectedCategory, 
        name: mainInput.includes(',') ? mainInput.split(',').map(s => s.trim()).filter(s => s) : mainInput.trim(), 
        subItems: [],
        parentValue: selectedParent || null
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
        setMainInput(''); setSubItemsList([]); setSubInput(''); fetchData(); 
      } else {
        throw new Error(data.message || "Request failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return; 
    if (source.droppableId === destination.droppableId && source.index === destination.index) return; 

    const token = getAuthToken();

    if (type === 'MAIN') {
      const absoluteSourceIndex = indexOfFirstItem + source.index;
      let absoluteDestIndex;
      let targetPage = currentPage;

      if (destination.droppableId === 'main-list') {
         absoluteDestIndex = indexOfFirstItem + destination.index;
      } else if (destination.droppableId.startsWith('page-')) {
         
         if (destination.droppableId === 'page-next') {
            targetPage = currentPage < totalPages ? currentPage + 1 : currentPage;
         } else if (destination.droppableId === 'page-prev') {
            targetPage = currentPage > 1 ? currentPage - 1 : currentPage;
         } else {
            targetPage = parseInt(destination.droppableId.split('-')[1], 10);
         }

         if (targetPage === currentPage) return; 
         absoluteDestIndex = (targetPage - 1) * ITEMS_PER_PAGE;
      } else {
         return;
      }

      const newItems = Array.from(existingItems);
      const [movedItem] = newItems.splice(absoluteSourceIndex, 1);
      newItems.splice(absoluteDestIndex, 0, movedItem);

      setExistingItems(newItems); 

      const payload = newItems.map((item, idx) => ({ _id: item._id, order: idx }));
      const url = selectedCategory === 'Community' 
          ? `${API_BASE}/api/admin/community/reorder`
          : `${API_BASE}/api/admin/master-data/reorder`;

      try {
        await fetch(url, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify({ orderedItems: payload })
        });
        toast.success('Order saved automatically');

        if (targetPage !== currentPage) {
           setCurrentPage(targetPage);
        }

      } catch (err) {
        toast.error('Failed to save new order');
        fetchData(); 
      }
    } 
    
    else if (type === 'SUB') {
      const parentId = source.droppableId;
      const parentIndex = existingItems.findIndex(item => item._id === parentId);
      if (parentIndex === -1) return;

      const newItems = Array.from(existingItems);
      const parent = { ...newItems[parentIndex] };
      const newSubs = Array.from(parent.subCommunities);

      const [movedSub] = newSubs.splice(source.index, 1);
      newSubs.splice(destination.index, 0, movedSub);

      parent.subCommunities = newSubs;
      newItems[parentIndex] = parent;

      setExistingItems(newItems); 

      try {
        await fetch(`${API_BASE}/api/admin/community/${parentId}/reorder-sub`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify({ orderedSubCommunities: newSubs })
        });
        toast.success('Sub-community order saved!');
      } catch (err) {
        toast.error('Failed to save sub order');
        fetchData(); 
      }
    }
  };

  const totalPages = Math.ceil(existingItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = existingItems.slice(indexOfFirstItem, indexOfLastItem);

  const visiblePages = totalPages > 0 ? [currentPage] : [];
  const isCommunity = selectedCategory === 'Community';
  const isBulkMode = activeTab === 'create' && mainInput.includes(',');

  return (
    <div className="sys-cfg-layout">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#fff', borderRadius: '8px' } }} />
      
      <div className="sys-cfg-surface">
        <div className="sys-cfg-controls">
          <div className="sys-cfg-selector-box">
            <label className="sys-cfg-label">Target Data Category</label>
            <div className="sys-cfg-input-row">
              <select className="sys-cfg-dropdown" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {CATEGORIES.map(cat => ( <option key={cat.id} value={cat.id}>{cat.label}</option> ))}
              </select>
              <button onClick={fetchData} className="sys-cfg-refresh" title="Sync Data">
                <FiRefreshCw className={fetching ? 'sys-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
        <div className="sys-cfg-separator"></div>

        {isCommunity && (
          <div className="sys-cfg-tab-group">
            <button className={`sys-cfg-tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => { setActiveTab('create'); setMainInput(''); setSubItemsList([]); }}>
              <FiLayers /> Main Community
            </button>
            <button className={`sys-cfg-tab ${activeTab === 'append' ? 'active' : ''}`} onClick={() => { setActiveTab('append'); setMainInput(''); setSubItemsList([]); }}>
              <FiList /> Sub-Communities
            </button>
          </div>
        )}

        <div className="sys-cfg-form-wrapper">
          <form onSubmit={handleSubmit} className="sys-cfg-form">
            
            {activeTab === 'create' && (
              <>
                {parentOptions.length > 0 && (
                  <div className="sys-cfg-field">
                    <label className="sys-cfg-label">Select Parent {getParentCategory(selectedCategory)}</label>
                    <select 
                      className="sys-cfg-dropdown" 
                      value={selectedParent} 
                      onChange={(e) => setSelectedParent(e.target.value)}
                    >
                      <option value="">-- Choose {getParentCategory(selectedCategory)} --</option>
                      {parentOptions.map((item) => ( 
                        <option key={item._id} value={item.name}>{item.name}</option> 
                      ))}
                    </select>
                  </div>
                )}

                <div className="sys-cfg-field">
                  <label className="sys-cfg-label">{selectedCategory} Identifier(s)</label>
                  <input type="text" className="sys-cfg-input" placeholder={`e.g. Value 1, Value 2`} value={mainInput} onChange={(e) => setMainInput(e.target.value)} autoComplete="off" />
                </div>
              </>
            )}

            {activeTab === 'append' && isCommunity && (
              <>
                <div className="sys-cfg-field">
                  <label className="sys-cfg-label">Parent Community</label>
                  <select className="sys-cfg-dropdown" value={mainInput} onChange={(e) => setMainInput(e.target.value)}>
                    <option value="">-- Assign Parent --</option>
                    {existingItems.map((item) => ( <option key={item._id} value={item.name}>{item.name}</option> ))}
                  </select>
                </div>
                <div className="sys-cfg-field">
                  <label className="sys-cfg-label">Nested Entries</label>
                  <div className="sys-cfg-tag-area">
                    {subItemsList.map((tag, index) => (
                      <span key={index} className="sys-cfg-chip">{tag} <FiX onClick={() => removeTag(tag)} className="sys-cfg-chip-close" /></span>
                    ))}
                    <input type="text" className="sys-cfg-tag-input" placeholder={subItemsList.length > 0 ? "Add next..." : "Press Enter or comma to add"} value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={handleSubKeyDown} disabled={!mainInput} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="sys-cfg-btn-primary" disabled={loading}>
              {loading ? <span className="sys-cfg-loader-ring"></span> : <><FiPlus /> {activeTab === 'create' ? (isBulkMode ? `Execute Bulk Save` : `Commit ${selectedCategory}`) : `Commit Nested Items`}</>}
            </button>
          </form>
        </div>

        <div className="sys-cfg-data-section">
          <div className="sys-cfg-data-header-row">
            <h3 className="sys-cfg-data-title">
              <FiDatabase /> Active Records ({existingItems.length})
            </h3>
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="main-list" type="MAIN">
                {(provided, snapshot) => (
                  <div 
                    className={`sys-cfg-grid ${snapshot.isDraggingOver ? 'sys-cfg-is-dragging-over' : ''}`} 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                  >
                     {currentItems.length === 0 ? (
                         <p className="sys-cfg-empty-state">No records present on this page.</p>
                     ) : (
                         currentItems.map((item, index) => (
                           <Draggable key={item._id} draggableId={item._id} index={index}>
                             {(provided, snapshot) => (
                               <div 
                                 ref={provided.innerRef} 
                                 {...provided.draggableProps} 
                                 {...provided.dragHandleProps} 
                                 className={`sys-cfg-data-card ${snapshot.isDragging ? 'sys-cfg-dragging' : ''}`}
                                 style={{ ...provided.draggableProps.style }}
                               >
                                 <div className="sys-cfg-card-header">
                                     <div className="sys-cfg-data-content">
                                         <div className={`sys-cfg-drag-handle ${snapshot.isDragging ? 'grabbing' : ''}`}>
                                           <FiMenu />
                                         </div>
                                         <span className="sys-cfg-record-name">
                                            {item.name}
                                            {item.parentValue && (
                                              <span className="sys-cfg-parent-badge">
                                                (in {item.parentValue})
                                              </span>
                                            )}
                                         </span>
                                     </div>
                                     <button onClick={() => handleDelete(item._id, item.name, false)} className="sys-cfg-btn-delete" disabled={deletingId.id === item._id && !deletingId.subName} title={`Delete ${item.name}`}>
                                         {deletingId.id === item._id && !deletingId.subName ? <span className="sys-cfg-loader-ring-mini"></span> : <FiTrash2 />}
                                     </button>
                                 </div>

                                 {(isCommunity && item.subCommunities && item.subCommunities.length > 0) && (
                                    <Droppable droppableId={item._id} type="SUB">
                                      {(providedSub, snapshotSub) => (
                                         <div 
                                            ref={providedSub.innerRef} 
                                            {...providedSub.droppableProps}
                                            className={`sys-cfg-sub-container ${snapshotSub.isDraggingOver ? 'sys-cfg-sub-dragging-over' : ''}`}
                                         >
                                             {item.subCommunities.map((sub, subIdx) => (
                                                <Draggable key={`${item._id}-${sub}`} draggableId={`${item._id}-${sub}`} index={subIdx}>
                                                  {(providedDragSub, snapshotDragSub) => (
                                                     <div 
                                                        ref={providedDragSub.innerRef}
                                                        {...providedDragSub.draggableProps}
                                                        {...providedDragSub.dragHandleProps} 
                                                        className={`sys-cfg-sub-item ${snapshotDragSub.isDragging ? 'sys-cfg-sub-dragging' : ''}`}
                                                        style={{ ...providedDragSub.draggableProps.style }}
                                                     >
                                                         <span className="sys-cfg-sub-item-content">
                                                              <FiCornerDownRight className="sys-cfg-sub-icon" /> 
                                                              <div className={`sys-cfg-drag-handle mini ${snapshotDragSub.isDragging ? 'grabbing' : ''}`}>
                                                                  <FiMenu size={14}/>
                                                              </div>
                                                              {sub}
                                                         </span>
                                                         <button onClick={() => handleDelete(item._id, item.name, true, sub)} className="sys-cfg-btn-delete mini" disabled={deletingId.id === item._id && deletingId.subName === sub} title={`Delete ${sub}`}>
                                                             {deletingId.id === item._id && deletingId.subName === sub ? <span className="sys-cfg-loader-ring-mini"></span> : <FiX size={14} />}
                                                         </button>
                                                     </div>
                                                  )}
                                                </Draggable>
                                             ))}
                                             {providedSub.placeholder}
                                         </div>
                                      )}
                                    </Droppable>
                                 )}
                               </div>
                             )}
                           </Draggable>
                         ))
                     )}
                     {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* --- SINGLE PAGE PAGINATION --- */}
              {!fetching && totalPages > 1 && (
                <div className="sys-cfg-pro-pagination">
                  <Droppable droppableId="page-prev" type="MAIN">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="sys-cfg-page-drop-wrapper">
                        <button 
                          className={`sys-cfg-page-btn ${snapshot.isDraggingOver ? 'drag-target' : ''}`} 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                          disabled={currentPage === 1}
                        >
                          <FiChevronLeft /> Prev
                        </button>
                        <div style={{ display: 'none' }}>{provided.placeholder}</div>
                      </div>
                    )}
                  </Droppable>
                  
                  <div className="sys-cfg-page-numbers-strict">
                    {visiblePages.map(pageNum => (
                      <Droppable key={`page-${pageNum}`} droppableId={`page-${pageNum}`} type="MAIN">
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="sys-cfg-page-drop-wrapper">
                            <button 
                              type="button"
                              className={`sys-cfg-page-num ${currentPage === pageNum ? 'active' : ''} ${snapshot.isDraggingOver ? 'drag-target' : ''}`} 
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                            <div style={{ display: 'none' }}>{provided.placeholder}</div>
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>

                  <Droppable droppableId="page-next" type="MAIN">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="sys-cfg-page-drop-wrapper">
                        <button 
                          className={`sys-cfg-page-btn ${snapshot.isDraggingOver ? 'drag-target' : ''}`} 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                          disabled={currentPage === totalPages}
                        >
                          Next <FiChevronRight />
                        </button>
                        <div style={{ display: 'none' }}>{provided.placeholder}</div>
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </DragDropContext>
          )}
        </div>
      </div>
      
      {/* MOBILE SCROLL INDICATOR */}
      {showMainScroll && (
          <div className="sys-cfg-scroll-indicator">
              <FiChevronDown size={18} />
              <span>Scroll for more</span>
          </div>
      )}
    </div>
  );
};

export default AdminMasterDataManager;

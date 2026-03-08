import React, { useState, useEffect } from 'react';
import Navbar from "../../Components/Navbar.jsx";
import toast, { Toaster } from 'react-hot-toast'; 
import './MyProfile.css';

// --- SKELETON LOADER ---
const ProfileSkeleton = () => (
  <div className="mp-container fade-in">
    <div className="mp-profile-sheet skeleton-sheet">
      <div className="mp-sheet-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="mp-header-text">
          <div className="skeleton-line title shimmer"></div>
          <div className="skeleton-line subtitle shimmer"></div>
        </div>
      </div>
      <div className="mp-divider"></div>
      <div className="mp-sheet-body">
        {[1, 2, 3].map((section) => (
          <div key={section} className="mp-section-wrapper">
            <div className="skeleton-line section-title shimmer"></div>
            <div className="mp-details-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="mp-data-field">
                  <div className="skeleton-line label shimmer"></div>
                  <div className="skeleton-line value shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Photo States
  const [existingPhotos, setExistingPhotos] = useState([]); // URLs from backend
  const [newPhotos, setNewPhotos] = useState([]); // New File objects

  const API_BASE = "https://kalyanashobha-back.vercel.app/api/user";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/my-profile`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': token }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        
        setFormData({
            ...data.user,
            astrologyDetails: data.user.astrologyDetails || {},
            familyDetails: data.user.familyDetails || {}
        });
        
        // Initialize existing photos
        setExistingPhotos(data.user.photos || []);
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const toastId = toast.loading("Updating profile and photos...");

    try {
      // 1. Prepare FormData (because we are sending files)
      const submitData = new FormData();

      // Append top-level fields
      Object.keys(formData).forEach(key => {
        if (key === 'photos' || key === 'astrologyDetails' || key === 'familyDetails') return;
        submitData.append(key, formData[key] || '');
      });

      // Append nested objects (Express body-parser friendly format)
      Object.keys(formData.astrologyDetails || {}).forEach(key => {
        submitData.append(`astrologyDetails[${key}]`, formData.astrologyDetails[key]);
      });
      Object.keys(formData.familyDetails || {}).forEach(key => {
        submitData.append(`familyDetails[${key}]`, formData.familyDetails[key]);
      });

      // Append existing photos to KEEP
      existingPhotos.forEach(url => {
        submitData.append('existingPhotos', url);
      });

      // Append NEW photo files
      newPhotos.forEach(file => {
        submitData.append('photos', file);
      });

      // 2. Send Request
      const res = await fetch(`${API_BASE}/update-profile`, {
        method: 'PUT',
        headers: { 'Authorization': token }, // Do NOT set Content-Type here, browser sets boundary automatically for FormData
        body: submitData
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setExistingPhotos(data.user.photos || []);
        setNewPhotos([]); // Clear new photos selection
        setIsEditing(false);
        toast.success("Profile updated successfully!", { id: toastId });
      } else {
        toast.error(data.message || "Update failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error occurred", { id: toastId });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- PHOTO MANAGEMENT HANDLERS ---
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total count limit
    const totalPhotos = existingPhotos.length + newPhotos.length + files.length;
    if (totalPhotos > 2) {
      toast.error("You can only have a maximum of 2 photos.");
      return;
    }

    // Check individual file sizes (Limit to 2MB each)
    const MAX_SIZE_MB = 2;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    
    for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_SIZE_BYTES) {
            toast.error(`Image too large! Please select images under ${MAX_SIZE_MB}MB each.`);
            // Reset the input so they can try again
            e.target.value = null; 
            return; 
        }
    }

    setNewPhotos([...newPhotos, ...files]);
  };

  const removeExistingPhoto = (urlToRemove) => {
    setExistingPhotos(existingPhotos.filter(url => url !== urlToRemove));
  };

  const removeNewPhoto = (indexToRemove) => {
    setNewPhotos(newPhotos.filter((_, index) => index !== indexToRemove));
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    return Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
  };

  return (
    <>
      <Navbar/>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#1F2937' },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#D32F2F', secondary: '#fff' } },
          // Added longer duration for errors so users have time to read the 2MB warning
          error: { duration: 5000 } 
        }}
      />

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="mp-container fade-in">
          <div className="mp-profile-sheet">
            
            {/* 1. Header Section */}
            <div className="mp-sheet-header">
              <div className="mp-avatar-group">
                <img 
                  src={user?.photos?.[0] || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="mp-sheet-avatar" 
                />
                {user?.isPaidMember && (
                  <div className="mp-verified-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mp-header-text">
                <div className="mp-title-row">
                  <h1 className="mp-sheet-name">{user?.firstName} {user?.lastName}</h1>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="mp-icon-btn" title="Edit Profile">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  )}
                </div>
                <div className="mp-meta-info">
                  <span className="mp-meta-item">ID: {user?.uniqueId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mp-divider"></div>

            {/* 2. Body Section */}
            <div className="mp-sheet-body">
              {!isEditing ? (
                /* --- VIEW MODE --- */
                <>
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Photos</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {user?.photos && user.photos.length > 0 ? (
                        user.photos.map((photo, i) => (
                          <img key={i} src={photo} alt={`Profile ${i+1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        ))
                      ) : (
                        <p style={{ color: '#666', fontSize: '14px' }}>No photos uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Basic Information</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Age / DOB</label>
                        <p>{calculateAge(user?.dob)} Years <span className="text-muted">({new Date(user?.dob).toLocaleDateString()})</span></p>
                      </div>
                      <div className="mp-data-field">
                        <label>Gender</label>
                        <p>{user?.gender || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Height</label>
                        <p>{user?.height ? `${user.height} cm` : "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Marital Status</label>
                        <p>{user?.maritalStatus || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Religion</label>
                        <p>{user?.religion || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Community</label>
                        <p>{user?.community || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Gothra</label>
                        <p>{user?.gothra || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Diet</label>
                        <p>{user?.diet || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Astrology Details</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Moonsign / Rasi</label>
                        <p>{user?.astrologyDetails?.moonsign || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Star / Nakshatra</label>
                        <p>{user?.astrologyDetails?.star || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Pada</label>
                        <p>{user?.astrologyDetails?.pada || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Time of Birth</label>
                        <p>{user?.astrologyDetails?.timeOfBirth || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Place of Birth</label>
                        <p>{user?.astrologyDetails?.placeOfBirth || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Family Details</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Father's Name</label>
                        <p>{user?.familyDetails?.fatherName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Father's Occupation</label>
                        <p>{user?.familyDetails?.fatherOccupation || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Mother's Name</label>
                        <p>{user?.familyDetails?.motherName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Mother's Occupation</label>
                        <p>{user?.familyDetails?.motherOccupation || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Brothers</label>
                        <p>{user?.familyDetails?.noOfBrothers || "0"} ({user?.familyDetails?.noOfBrothersMarried || "0"} Married)</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Sisters</label>
                        <p>{user?.familyDetails?.noOfSisters || "0"} ({user?.familyDetails?.noOfSistersMarried || "0"} Married)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Professional & Education</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Qualification</label>
                        <p>{user?.highestQualification || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>College</label>
                        <p>{user?.collegeName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Job Role</label>
                        <p>{user?.jobRole || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Company</label>
                        <p>{user?.companyName || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Annual Income</label>
                        <p>{user?.annualIncome || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Work Type</label>
                        <p>{user?.workType || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Contact & Location</h3>
                    <div className="mp-details-grid">
                      <div className="mp-data-field">
                        <label>Email</label>
                        <p>{user?.email}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Phone</label>
                        <p>{user?.mobileNumber}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Residence</label>
                        <p>{user?.residentsIn || "-"}</p>
                      </div>
                      <div className="mp-data-field">
                        <label>Location</label>
                        <p>{user?.city}, {user?.state}, {user?.country}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* --- EDIT FORM --- */
                <form onSubmit={handleUpdate} className="mp-edit-container">
                  
                  {/* --- PHOTO UPLOAD SECTION --- */}
                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Manage Photos (Max 2)</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      
                      {/* Existing Photos */}
                      {existingPhotos.map((url, i) => (
                        <div key={`existing-${i}`} style={{ position: 'relative' }}>
                          <img src={url} alt="Existing" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                          <button type="button" onClick={() => removeExistingPhoto(url)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}

                      {/* New Photos Preview */}
                      {newPhotos.map((file, i) => (
                        <div key={`new-${i}`} style={{ position: 'relative' }}>
                          <img src={URL.createObjectURL(file)} alt="New Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #059669' }} />
                          <button type="button" onClick={() => removeNewPhoto(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}

                    </div>
                    
                    {existingPhotos.length + newPhotos.length < 2 && (
                      <div className="mp-input-wrap">
                        <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>Upload up to {2 - (existingPhotos.length + newPhotos.length)} more photos (Max 2MB each).</small>
                      </div>
                    )}
                  </div>

                  <div className="mp-divider-subtle"></div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Personal Details</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Marital Status</label>
                        <select name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange}>
                          <option value="Never Married">Never Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div className="mp-input-wrap">
                        <label>Height (cm)</label>
                        <input name="height" type="number" value={formData.height || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Diet</label>
                        <select name="diet" value={formData.diet || ''} onChange={handleChange}>
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Eggetarian">Eggetarian</option>
                        </select>
                      </div>
                      <div className="mp-input-wrap">
                        <label>Gothra</label>
                        <input name="gothra" value={formData.gothra || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Astrology</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Moonsign / Rasi</label>
                        <input name="astrologyDetails.moonsign" value={formData.astrologyDetails?.moonsign || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Star / Nakshatra</label>
                        <input name="astrologyDetails.star" value={formData.astrologyDetails?.star || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Pada</label>
                        <input name="astrologyDetails.pada" value={formData.astrologyDetails?.pada || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Time of Birth</label>
                        <input type="time" name="astrologyDetails.timeOfBirth" value={formData.astrologyDetails?.timeOfBirth || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Place of Birth</label>
                        <input name="astrologyDetails.placeOfBirth" value={formData.astrologyDetails?.placeOfBirth || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Family Details</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Father's Name</label>
                        <input name="familyDetails.fatherName" value={formData.familyDetails?.fatherName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Father's Occupation</label>
                        <input name="familyDetails.fatherOccupation" value={formData.familyDetails?.fatherOccupation || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Mother's Name</label>
                        <input name="familyDetails.motherName" value={formData.familyDetails?.motherName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Mother's Occupation</label>
                        <input name="familyDetails.motherOccupation" value={formData.familyDetails?.motherOccupation || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Total Brothers</label>
                        <input type="number" name="familyDetails.noOfBrothers" value={formData.familyDetails?.noOfBrothers || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Brothers Married</label>
                        <input type="number" name="familyDetails.noOfBrothersMarried" value={formData.familyDetails?.noOfBrothersMarried || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Total Sisters</label>
                        <input type="number" name="familyDetails.noOfSisters" value={formData.familyDetails?.noOfSisters || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Sisters Married</label>
                        <input type="number" name="familyDetails.noOfSistersMarried" value={formData.familyDetails?.noOfSistersMarried || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mp-section-wrapper">
                    <h3 className="mp-sheet-heading">Edit Professional & Location</h3>
                    <div className="mp-edit-grid">
                      <div className="mp-input-wrap">
                        <label>Qualification</label>
                        <input name="highestQualification" value={formData.highestQualification || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>College</label>
                        <input name="collegeName" value={formData.collegeName || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Job Role</label>
                        <input name="jobRole" value={formData.jobRole || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Income</label>
                        <input name="annualIncome" value={formData.annualIncome || ''} onChange={handleChange} />
                      </div>
                      <div className="mp-input-wrap">
                        <label>Residence Type</label>
                        <select name="residentsIn" value={formData.residentsIn || ''} onChange={handleChange}>
                          <option value="">Select...</option>
                          <option value="Own">Own</option>
                          <option value="Rent">Rent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mp-sheet-actions">
                    <button type="button" onClick={() => {
                        setIsEditing(false);
                        setNewPhotos([]); // Reset new photos if cancelled
                        setExistingPhotos(user.photos || []); // Restore original photos
                    }} className="mp-btn-text">Cancel</button>
                    <button type="submit" className="mp-btn-solid">Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;

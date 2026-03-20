import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NetworkTree from '../components/NetworkTree';

const AdminDashboard = () => {
  const [influencers, setInfluencers] = useState([]);
  const [fullTreeData, setFullTreeData] = useState([]);
  
  // --- STATE FOR VIEW MODE ('list', 'nominations', 'tree') ---
  const [viewMode, setViewMode] = useState('list');
  
  // --- STATE FOR INVITE LINK ---
  const [inviteLink, setInviteLink] = useState("");

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --- SEARCH STATE ---
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    referredBy: '',
    status: ''
  });

  // --- SEARCH STATE ---
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAge, setSearchAge] = useState('');
  const [searchGender, setSearchGender] = useState('');
  const [searchReferredBy, setSearchReferredBy] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  // 1. Fetch List
  const fetchInfluencers = async () => {
    try {
      const res = await axios.get(`${__BACKEND_URL__}/api/admin/influencers`);
      setInfluencers(res.data);
    } catch (err) {
      console.error("Error fetching list:", err);
    }
  };

  // 2. Fetch Tree
  const fetchFullTree = async () => {
    try {
        const res = await axios.get(`${__BACKEND_URL__}/api/admin/full-tree`);
        setFullTreeData(res.data);
        setViewMode('tree');
    } catch (err) {
        alert("Error fetching tree");
    }
  };

  // 3. Secure Logout Function
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.replace('/'); 
  };

  // 4. Generate Invite Link Function
  const generateLink = async () => {
    try {
        const res = await axios.post(`${__BACKEND_URL__}/api/admin/generate-invite`);
        setInviteLink(res.data.link);
    } catch (err) {
        alert("Failed to generate link.");
    }
  };

  // 5. Copy to Clipboard Function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Link copied to clipboard!");
  };

  useEffect(() => { fetchInfluencers(); }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${__BACKEND_URL__}/api/admin/influencers/${id}/status`, { status });
    fetchInfluencers();
  };

  // --- CALCULATION FOR NOMINATIONS ---
  // Count how many 'Accepted' referrals each parent has
  const acceptedReferralsCount = {};
  influencers.forEach(inf => {
      // If the user is accepted AND has a referrer
      if (inf.status === 'Accepted' && inf.referredBy && inf.referredBy._id) {
          const parentId = inf.referredBy._id;
          acceptedReferralsCount[parentId] = (acceptedReferralsCount[parentId] || 0) + 1;
      }
  });

  // Find IDs of influencers who have >= 2 accepted referrals
  const nominatedIds = Object.keys(acceptedReferralsCount).filter(id => acceptedReferralsCount[id] >= 2);

  // Filter the list based on the current view mode
  const displayedInfluencers = viewMode === 'nominations' 
      ? influencers.filter(inf => nominatedIds.includes(String(inf._id)))
      : influencers;

  // --- SEARCH FILTERING ---
  const filteredInfluencers = displayedInfluencers.filter(inf => {
    return (
      (searchName === '' || inf.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (searchPhone === '' || inf.phone.includes(searchPhone)) &&
      (searchEmail === '' || inf.email.toLowerCase().includes(searchEmail.toLowerCase())) &&
      (searchAge === '' || inf.age.toString().includes(searchAge)) &&
      (searchGender === '' || inf.gender.toLowerCase().includes(searchGender.toLowerCase())) &&
      (searchReferredBy === '' || (inf.referredBy?.name || 'Direct').toLowerCase().includes(searchReferredBy.toLowerCase())) &&
      (searchStatus === '' || inf.status.toLowerCase().includes(searchStatus.toLowerCase()))
    );
  });

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInfluencers = filteredInfluencers.slice(startIndex, endIndex);

  // Reset to page 1 when view mode changes, items per page changes, or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, itemsPerPage, searchName, searchPhone, searchEmail, searchAge, searchGender, searchReferredBy, searchStatus]);

  return (
    <div className="container" style={{maxWidth: '1200px'}}>
        <style>{`
            .bounce{display:inline-block; will-change:transform; animation: bounce 1.1s cubic-bezier(.28,.84,.42,1) infinite;}
            @keyframes bounce {
                0%,100% { transform: translateY(0); }
                40% { transform: translateY(-8px); }
                60% { transform: translateY(-4px); }
            }
        `}</style>
      
      {/* --- HEADER SECTION --- */}
      <div className="header-dashboard">
          <h2 style={{ color: "white"}}>Admin Dashboard</h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setViewMode('list')}
                style={{ padding:'10px', background: viewMode === 'list' ? '#2c3e50' : '#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}
            >
                All Influencers
            </button>
            <button 
                onClick={() => setViewMode('nominations')}
                style={{ padding:'10px', background: viewMode === 'nominations' ? '#2c3e50' : '#8e44ad', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}
            >
                ⭐ Nominations
            </button>
            <button 
                onClick={fetchFullTree}
                style={{ padding:'10px', background: viewMode === 'tree' ? '#2c3e50' : '#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}
            >
                3D Tree
            </button>

            <button 
                onClick={handleLogout}
                style={{ padding:'10px', background:'#ff4d4d', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight: 'bold' }}
            >
                Logout
            </button>
          </div>
      </div>

      {/* --- INVITE SECTION --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0, color: '#8e44ad' }}>
                <span className="bounce" style={{ marginRight: 0, animationDelay: '0s' }}>🤩</span>
                <span className="bounce" style={{ marginRight: 0, animationDelay: '0.08s' }}>👉</span>
                Invite New Influencer
                <span className="bounce" style={{ marginLeft: 0, animationDelay: '0.16s' }}>👈</span>
                <span className="bounce" style={{ marginLeft: 0, animationDelay: '0.24s' }}>🤩</span>
            </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Generate a secure, one-time use registration link for a new root influencer.</p>
          
          {!inviteLink ? (
              <button onClick={generateLink} style={{ background: '#8e44ad', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize:'16px', fontWeight:'bold' }}>
                  Generate Invite Link
              </button>
          ) : (
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <input readOnly value={inviteLink} style={{ padding: '10px', width: '350px', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9' }} />
                  <button onClick={copyToClipboard} style={{ background: '#27ae60', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Copy Link</button>
                  <button onClick={() => setInviteLink("")} style={{ background: 'transparent', border:'none', color:'#888', cursor:'pointer', textDecoration:'underline', fontSize: '14px' }}>Reset</button>
              </div>
          )}
      </div>

      {/* --- MAIN CONTENT --- */}
      {viewMode === 'tree' ? (
        <div style={{ textAlign: 'center' }}>
            <h3>Full Influencer Network</h3>
            <div style={{ background:'#f9f9f9', padding:'20px', borderRadius:'10px', overflowX: 'auto' }}>
                <NetworkTree 
                    data={fullTreeData}
                    onClose={() => setViewMode('list')} 
                />
            </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.05)', color: '#333', background: 'white', padding: '20px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: viewMode === 'nominations' ? '#8e44ad' : '#333' }}>
                {viewMode === 'nominations' ? '⭐ Nominated Influencers (2+ Accepted Referrals)' : 'All Influencers'}
            </h3>
            
            {/* --- PAGINATION CONTROLS TOP --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '14px', color: '#555' }}>Show:</label>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(e.target.value === 'All' ? displayedInfluencers.length : parseInt(e.target.value))}
                        style={{ padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={displayedInfluencers.length}>All</option>
                    </select>
                    <span style={{ fontSize: '14px', color: '#555' }}>entries</span>
                </div>
                
                <div style={{ fontSize: '14px', color: '#555' }}>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredInfluencers.length)} of {filteredInfluencers.length} entries
                </div>
            </div>
            
            {displayedInfluencers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>No influencers found for this category.</p>
            ) : (
                <>
                    <table border="1" style={{width:'100%', borderCollapse:'collapse', background: 'white', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden', boxShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                        <thead>
                            <tr style={{ background: '#f4f4f4', whiteSpace: 'nowrap' }}>
                                <th style={{ padding: '10px' }}>Sr. No.</th>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Phone</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Age</th>
                                <th style={{ padding: '10px' }}>Gender</th>
                                <th style={{ padding: '10px' }}>IG</th>
                                <th style={{ padding: '10px' }}>YT</th>
                                <th style={{ padding: '10px' }}>Other</th>
                                <th style={{ padding: '10px' }}>Referred By</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Actions</th>
                            </tr>
                            {/* Search Row */}
                            <tr style={{ background: '#fafafa' }}>
                                <td style={{ padding: '5px' }}></td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search name..." 
                                        value={searchName} 
                                        onChange={(e) => setSearchName(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search phone..." 
                                        value={searchPhone} 
                                        onChange={(e) => setSearchPhone(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search email..." 
                                        value={searchEmail} 
                                        onChange={(e) => setSearchEmail(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search age..." 
                                        value={searchAge} 
                                        onChange={(e) => setSearchAge(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search gender..." 
                                        value={searchGender} 
                                        onChange={(e) => setSearchGender(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}></td>
                                <td style={{ padding: '5px' }}></td>
                                <td style={{ padding: '5px' }}></td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search referrer..." 
                                        value={searchReferredBy} 
                                        onChange={(e) => setSearchReferredBy(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search status..." 
                                        value={searchStatus} 
                                        onChange={(e) => setSearchStatus(e.target.value)} 
                                        style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px' }}
                                    />
                                </td>
                                <td style={{ padding: '5px' }}></td>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInfluencers.map((inf, index) => (
                                <tr key={inf._id} style={{ textAlign: 'center' }}>
                                    <td style={{ padding: '10px' }}>{startIndex + index + 1}</td>
                                    <td style={{ padding: '10px' }}>{inf.name}</td>
                                    <td style={{ padding: '10px' }}>{inf.phone}</td>
                                    <td style={{ padding: '10px' }}>{inf.email}</td>
                                    <td style={{ padding: '10px' }}>{inf.age}</td>
                                    <td style={{ padding: '10px' }}>{inf.gender}</td>
                                    
                                    {/* Social Links */}
                                    <td style={{ padding: '10px' }}>
                                        <a href={inf.instagram.startsWith('http') ? inf.instagram : `https://${inf.instagram}`} target="_blank" rel="noopener noreferrer" style={{color: '#E1306C', fontWeight:'bold', textDecoration:'none'}}>View</a>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {inf.youtube ? 
                                            <a href={inf.youtube.startsWith('http') ? inf.youtube : `https://${inf.youtube}`} target="_blank" rel="noopener noreferrer" style={{color: 'red', fontWeight:'bold', textDecoration:'none'}}>View</a> 
                                        : '-'}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {inf.otherLinks ? 
                                            <a href={inf.otherLinks.startsWith('http') ? inf.otherLinks : `https://${inf.otherLinks}`} target="_blank" rel="noopener noreferrer" style={{color: 'blue', textDecoration:'none'}}>View</a> 
                                        : '-'}
                                    </td>

                                    <td style={{ padding: '10px' }}>{inf.referredBy?.name || 'Direct'}</td>
                                    
                                    {/* Status Badge */}
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '5px 10px', borderRadius: '15px', 
                                            background: inf.status === 'Accepted' ? '#d4edda' : inf.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                            color: inf.status === 'Accepted' ? '#155724' : inf.status === 'Rejected' ? '#721c24' : '#856404',
                                            fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase'
                                        }}>
                                            {inf.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                                        {inf.status === 'Pending' && (
                                            <>
                                                <button onClick={() => updateStatus(inf._id, 'Accepted')} style={{background:'green', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer', marginRight:'5px'}}>✓</button>
                                                <button onClick={() => updateStatus(inf._id, 'Rejected')} style={{background:'red', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer'}}>✕</button>
                                            </>
                                        )}
                                        {inf.status === 'Accepted' && <span style={{ color: 'green', fontSize:'18px' }}>✅</span>}
                                        {inf.status === 'Rejected' && <span style={{ color: 'red', fontSize:'18px' }}>❌</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* --- PAGINATION CONTROLS BOTTOM --- */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: '14px', color: '#555' }}>
                                Page {currentPage} of {totalPages}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ 
                                        padding: '8px 12px', 
                                        background: currentPage === 1 ? '#ccc' : '#3498db', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Previous
                                </button>
                                
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{ 
                                        padding: '8px 12px', 
                                        background: currentPage === totalPages ? '#ccc' : '#3498db', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
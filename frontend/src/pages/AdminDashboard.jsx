import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NetworkTree from '../components/NetworkTree';

const AdminDashboard = () => {
  const [influencers, setInfluencers] = useState([]);
  const [showTree, setShowTree] = useState(false);
  const [fullTreeData, setFullTreeData] = useState([]);
  
  // --- NEW STATE FOR INVITE LINK ---
  const [inviteLink, setInviteLink] = useState("");

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
        setShowTree(true);
    } catch (err) {
        alert("Error fetching tree");
    }
  };

  // 3. Secure Logout Function
  const handleLogout = () => {
    localStorage.clear(); // Wipe all data
    window.location.replace('/influencers/login'); // Redirect and replace history
  };

  // 4. Generate Invite Link Function
  const generateLink = async () => {
    try {
        const res = await axios.post(`${__BACKEND_URL__}/api/admin/generate-invite`);
        setInviteLink(res.data.link);
    } catch (err) {
        alert("Failed to generate link. Is the backend running?");
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

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
      {/* --- HEADER SECTION --- */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2>Admin Dashboard</h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => showTree ? setShowTree(false) : fetchFullTree()}
                style={{ padding:'10px', background:'#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}
            >
                {showTree ? "View List" : "View Network Tree"}
            </button>

            <button 
                onClick={handleLogout}
                style={{ 
                    padding:'10px', 
                    background:'#ff4d4d', 
                    color:'white', 
                    border:'none', 
                    borderRadius:'5px', 
                    cursor:'pointer',
                    fontWeight: 'bold'
                }}
            >
                Logout
            </button>
          </div>
      </div>

      {/* --- NEW INVITE SECTION --- */}
      <div style={{ 
          background: 'white', padding: '20px', borderRadius: '10px', 
          marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          textAlign: 'center', border: '1px solid #eee'
      }}>
          <h3 style={{ marginTop: 0 }}>🚀 Invite New Influencer</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Generate a secure, one-time use registration link for a new root influencer.</p>
          
          {!inviteLink ? (
              <button 
                onClick={generateLink} 
                style={{ background: '#8e44ad', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize:'16px', fontWeight:'bold' }}
              >
                  Generate Invite Link
              </button>
          ) : (
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <input 
                    readOnly 
                    value={inviteLink} 
                    style={{ padding: '10px', width: '350px', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9' }}
                  />
                  <button 
                    onClick={copyToClipboard}
                    style={{ background: '#27ae60', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                      Copy Link
                  </button>
                  <button 
                    onClick={() => setInviteLink("")} // Clear to generate another
                    style={{ background: 'transparent', border:'none', color:'#888', cursor:'pointer', textDecoration:'underline', fontSize: '14px' }}
                  >
                      Reset
                  </button>
              </div>
          )}
      </div>

      {/* --- MAIN CONTENT (TREE OR TABLE) --- */}
      {showTree ? (
        <div style={{ textAlign: 'center' }}>
            <h3>Full Influencer Network</h3>
            <div style={{ background:'#f9f9f9', padding:'20px', borderRadius:'10px', overflowX: 'auto' }}>
                <NetworkTree data={fullTreeData} />
            </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
            <table border="1" style={{width:'100%', borderCollapse:'collapse', background: 'white'}}>
                <thead>
                    <tr style={{ background: '#f4f4f4' }}>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Referred By</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {influencers.map(inf => (
                        <tr key={inf._id} style={{ textAlign: 'center' }}>
                            <td style={{ padding: '10px' }}>{inf.name}</td>
                            <td style={{ padding: '10px' }}>{inf.email}</td>
                            <td style={{ padding: '10px' }}>{inf.referredBy?.name || 'Direct'}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ 
                                    padding: '5px 10px', borderRadius: '15px', 
                                    background: inf.status === 'Accepted' ? '#d4edda' : inf.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                    color: inf.status === 'Accepted' ? '#155724' : inf.status === 'Rejected' ? '#721c24' : '#856404',
                                    fontWeight: 'bold', fontSize: '12px'
                                }}>
                                    {inf.status}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                {inf.status === 'Pending' && (
                                    <>
                                        <button onClick={() => updateStatus(inf._id, 'Accepted')} style={{background:'green', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer', marginRight:'5px'}}>Accept</button>
                                        <button onClick={() => updateStatus(inf._id, 'Rejected')} style={{background:'red', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer'}}>Reject</button>
                                    </>
                                )}
                                {inf.status === 'Accepted' && <span style={{ color: 'green' }}>✅</span>}
                                {inf.status === 'Rejected' && <span style={{ color: 'red' }}>❌</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
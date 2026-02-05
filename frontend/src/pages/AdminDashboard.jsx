import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NetworkTree from '../components/NetworkTree';

const AdminDashboard = () => {
  const [influencers, setInfluencers] = useState([]);
  const [showTree, setShowTree] = useState(false);
  const [fullTreeData, setFullTreeData] = useState([]);

  // 1. Fetch List
  const fetchInfluencers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/influencers');
      setInfluencers(res.data);
    } catch (err) {
      console.error("Error fetching list:", err);
    }
  };

  // 2. Fetch Tree
  const fetchFullTree = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/admin/full-tree');
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

  useEffect(() => { fetchInfluencers(); }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/admin/influencers/${id}/status`, { status });
    fetchInfluencers();
  };

  return (
    <div className="container" style={{maxWidth: '1000px'}}>
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

      {showTree ? (
        <div style={{ textAlign: 'center' }}>
            <h3>Full Influencer Network</h3>
            <div style={{ background:'#f9f9f9', padding:'20px', borderRadius:'10px' }}>
                <NetworkTree data={fullTreeData} />
            </div>
        </div>
      ) : (
        <table border="1" style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
                <tr>
                    <th>Name</th><th>Email</th><th>Referred By</th><th>Status</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {influencers.map(inf => (
                    <tr key={inf._id}>
                        <td>{inf.name}</td>
                        <td>{inf.email}</td>
                        <td>{inf.referredBy?.name || 'Direct'}</td>
                        <td>{inf.status}</td>
                        <td>
                            {inf.status === 'Pending' && (
                                <>
                                    <button onClick={() => updateStatus(inf._id, 'Accepted')} style={{background:'green', color:'white', marginRight:'5px'}}>Accept</button>
                                    <button onClick={() => updateStatus(inf._id, 'Rejected')} style={{background:'red', color:'white'}}>Reject</button>
                                </>
                            )}
                            {inf.status === 'Accepted' && <span>✅ Approved</span>}
                            {inf.status === 'Rejected' && <span>❌ Rejected</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
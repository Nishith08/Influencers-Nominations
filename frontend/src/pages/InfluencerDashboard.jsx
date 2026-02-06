import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NetworkTree from '../components/NetworkTree';

// Recursive Tree Component
const TreeNode = ({ node }) => {
  return (
    <div style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
      <p>👤 <strong>{node.name}</strong></p>
      {node.children && node.children.map((child, idx) => (
        <TreeNode key={idx} node={child} />
      ))}
    </div>
  );
};

const InfluencerDashboard = () => {
  const [user, setUser] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/influencers/login'; // Redirect if no token
        return;
      }

      try {
        // 1. Fetch User Profile Live from DB
        const userRes = await axios.get(`${__BACKEND_URL__}/api/influencer/me`, {
          headers: { Authorization: token }
        });
        
        const userData = userRes.data;
        setUser(userData);

        // 2. If Accepted, Fetch Tree Data
        if (userData.status === 'Accepted') {
          const treeRes = await axios.get(`${__BACKEND_URL__}/api/influencer/my-tree`, {
            headers: { Authorization: token }
          });
          setTreeData(treeRes.data);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        localStorage.removeItem('token'); // Clear invalid token
        window.location.href = '/influencers/login';
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/influencers/login'); // Redirects and replaces history
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!user) return <div>Access Denied</div>;

  const referralLink = `${__FRONTEND_URL__}/influencers/${user.referralToken}`;

  return (
    <div className="container">
      {/* Header Section with Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {user.name}</h1>
        <button 
            onClick={handleLogout} 
            style={{
                backgroundColor: '#ff4d4d', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
        >
            Logout
        </button>
      </div>
      
      <div style={{ padding: '20px', background: '#f4f4f4', borderRadius: '8px', marginBottom:'20px' }}>
        <h3>Application Status: 
            <span style={{ 
                color: user.status === 'Accepted' ? 'green' : user.status === 'Rejected' ? 'red' : 'orange', 
                fontWeight:'bold', marginLeft:'10px'
            }}>
                {user.status}
            </span>
        </h3>

        {user.status === 'Accepted' && (
            <>
                <p><strong>Referral Link:</strong> {referralLink}</p>
                <p><em>Share this link to invite up to 2 influencers.</em></p>
            </>
        )}
      </div>

      {/* {user.status === 'Accepted' && (
        <div style={{ marginTop: '20px' }}>
            <h2>My Network Tree</h2>
            {treeData.length === 0 ? <p>No influencers under you yet.</p> : 
                treeData.map((node, i) => <TreeNode key={i} node={node} />)
            }
        </div>
      )} */}
      {user.status === 'Accepted' && (
    <div style={{ marginTop: '20px' }}>
        <h2>My Network Tree</h2>
        <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '10px', overflowX: 'auto' }}>
            <NetworkTree data={treeData} />
        </div>
    </div>
  )}
    </div>
  );
};

export default InfluencerDashboard;
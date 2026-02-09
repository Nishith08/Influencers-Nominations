import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NetworkTree from '../components/NetworkTree';

const InfluencerDashboard = () => {
  const [user, setUser] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NEW STATE FOR DROPDOWN & MODAL ---
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/influencers/login'; 
        return;
      }

      try {
        const userRes = await axios.get(`${__BACKEND_URL__}/api/influencer/me`, {
          headers: { Authorization: token }
        });
        
        const userData = userRes.data;
        setUser(userData);

        if (userData.status === 'Accepted') {
          const treeRes = await axios.get(`${__BACKEND_URL__}/api/influencer/my-tree`, {
            headers: { Authorization: token }
          });
          setTreeData(treeRes.data);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        localStorage.removeItem('token'); 
        window.location.href = '/influencers/login';
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/influencers/login');
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!user) return <div>Access Denied</div>;

  const referralLink = `${__FRONTEND_URL__}/influencers/${user.referralToken}`;

  return (
    <div className="container">
      
      {/* --- HEADER WITH PROFILE DROPDOWN --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
        <h1>Welcome, {user.name}</h1>
        
        {/* Profile Icon Wrapper */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
            width: '50px', height: '50px', borderRadius: '50%', 
            backgroundColor: '#3498db', color: 'white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            overflow: 'hidden', // Crucial: clips square image to circle
            border: '2px solid white'
        }}
    >
        {user.profilePic ? (
            <img 
                src={`${__BACKEND_URL__}/uploads/${user.profilePic}`} 
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { 
                    // Fallback: If image fails to load, hide image and show initial
                    e.target.style.display = 'none'; 
                    e.target.parentElement.innerText = user.name.charAt(0).toUpperCase();
                }} 
            />
        ) : (
            // Fallback: Show Initial if no picture data exists
            <span>{user.name.charAt(0).toUpperCase()}</span>
        )}
    </div>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div style={{
                    position: 'absolute', top: '55px', right: '0',
                    backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '150px', zIndex: 100, overflow: 'hidden',
                    border: '1px solid #eee'
                }}>
                    <div 
                        onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}
                        style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#333' }}
                        onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        👤 View Profile
                    </div>
                    <div 
                        onClick={handleLogout}
                        style={{ padding: '12px 15px', cursor: 'pointer', fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.target.style.background = '#fff5f5'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        🚪 Logout
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* --- STATUS CARD --- */}
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
                <p><strong>Referral Link:</strong> <a href={referralLink}>{referralLink}</a></p>
                <p><em>Share this link to invite up to 2 influencers.</em></p>
            </>
        )}
      </div>

      {/* --- TREE VIEW --- */}
      {user.status === 'Accepted' && (
        <div style={{ marginTop: '20px' }}>
            <h2>My Network Tree</h2>
            <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '10px', overflowX: 'auto' }}>
                <NetworkTree data={treeData} />
            </div>
        </div>
      )}

      {/* --- PROFILE MODAL --- */}
      {showProfileModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '10px',
                width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                <button 
                    onClick={() => setShowProfileModal(false)}
                    style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >✖</button>
                
                <h2 style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>My Profile</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                    <p><strong>Age:</strong> {user.age}</p>
                    <p><strong>Gender:</strong> {user.gender}</p>
                    
                    <hr style={{ width: '100%', border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
                    
                    <p><strong>Instagram:</strong> <a href={user.instagram} target="_blank" rel="noopener noreferrer" style={{color: '#E1306C'}}>View Profile</a></p>
                    
                    {user.youtube && (
                        <p><strong>YouTube:</strong> <a href={user.youtube} target="_blank" rel="noopener noreferrer" style={{color: 'red'}}>View Channel</a></p>
                    )}
                    
                    {user.otherLinks && (
                        <p><strong>Other Links:</strong> <a href={user.otherLinks} target="_blank" rel="noopener noreferrer">View Link</a></p>
                    )}
                </div>

                <button 
                    onClick={() => setShowProfileModal(false)}
                    style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Close
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default InfluencerDashboard;
import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InfluencerRegister = ({ mode }) => { 
  const { token } = useParams(); 
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', age: '', gender: 'Male',
    instagram: '', youtube: '', otherLinks: ''
  });

  const [profilePic, setProfilePic] = useState(null);
  
  // --- NEW STATE FOR SUCCESS MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [generatedPass, setGeneratedPass] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profilePic) {
        alert("Please upload a Profile Picture.");
        return;
    }

    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
      dataToSend.append('profilePic', profilePic);

      if (mode === 'invite') {
          dataToSend.append('inviteToken', token);
      } else {
          dataToSend.append('referralToken', token);
      }
      
      const res = await axios.post(`${__BACKEND_URL__}/api/influencer/register`, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // --- SUCCESS: SHOW MODAL INSTEAD OF ALERT ---
      setGeneratedPass(res.data.generatedPassword);
      setShowModal(true);
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  // --- COPIES PASSWORD TO CLIPBOARD ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPass);
    alert("Password copied to clipboard!"); // Small feedback
  };

  // --- REDIRECTS TO LOGIN ---
  const goToLogin = () => {
    window.location.href = '/influencers/login';
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <h2>Influencer Registration</h2>
      
      {mode === 'invite' ? (
        <p style={{ fontSize: '14px', color: '#8e44ad', fontWeight: 'bold' }}>🚀 Joining via Admin Invite</p>
      ) : (
        <p style={{ fontSize: '14px', color: '#2980b9', fontWeight: 'bold' }}>🔗 Joining via Referral Link</p>
      )}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" required onChange={handleChange} />
        <input name="phone" placeholder="Phone" required onChange={handleChange} />
        <input name="email" placeholder="Email" required onChange={handleChange} />
        <div style={{display:'flex', gap:'10px'}}>
            <input name="age" type="number" placeholder="Age" required onChange={handleChange} />
            <select name="gender" onChange={handleChange}>
                <option>Male</option><option>Female</option>
            </select>
        </div>
        
        <div style={{ margin: '10px 0', textAlign: 'left' }}>
            <label style={{ fontSize: '14px', color: '#555', display: 'block', marginBottom: '5px' }}>
                Profile Picture <span style={{color:'red'}}>*</span>
            </label>
            <input type="file" accept="image/*" required onChange={handleFileChange} style={{ padding: '5px' }} />
        </div>

        <input name="instagram" placeholder="Instagram Link (Required)" required onChange={handleChange} />
        <div style={{display:'flex', gap:'10px'}}>
            <input name="youtube" placeholder="YouTube Link (Optional)" onChange={handleChange} />
            <input name="otherLinks" placeholder="Other Links (Optional)" onChange={handleChange} />
        </div>
        
        <button type="submit" className="pay-btn">Register</button>
      </form>

      {/* --- SUCCESS MODAL OVERLAY --- */}
      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '15px',
                width: '90%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ color: 'green', margin: '0 0 10px 0' }}>Registration Successful!</h3>
                <p style={{ color: '#555', fontSize: '14px' }}>Please save your secure password below to login.</p>
                
                {/* PASSWORD BOX */}
                <div style={{
                    background: '#f4f4f4', padding: '15px', borderRadius: '8px',
                    border: '1px dashed #aaa', margin: '20px 0', fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px'
                }}>
                    {generatedPass}
                </div>

                {/* BUTTONS */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                        onClick={copyToClipboard}
                        style={{ background: '#f39c12', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}
                    >
                        📋 Copy Password
                    </button>
                    
                    <button 
                        onClick={goToLogin}
                        style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}
                    >
                        Login ➡
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default InfluencerRegister;
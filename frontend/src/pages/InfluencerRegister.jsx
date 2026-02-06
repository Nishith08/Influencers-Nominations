import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InfluencerRegister = ({ mode }) => { // <--- Receive 'mode' prop
  const { token } = useParams(); 
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', age: '', gender: 'Male',
    instagram: '', youtube: '', otherLinks: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // DYNAMIC PAYLOAD CREATION
      const payload = { ...formData };

      if (mode === 'invite') {
          payload.inviteToken = token;    // Send as Admin Invite
          payload.referralToken = null;
      } else {
          payload.referralToken = token;  // Send as Peer Referral
          payload.inviteToken = null;
      }
      
      const res = await axios.post(`${__BACKEND_URL__}/api/influencer/register`, payload);
      
      alert(`Registration Successful!\n\nYOUR PASSWORD IS: ${res.data.generatedPassword}\n\nPlease save this password to login.`);
      window.location.href = '/influencers/login';
      
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="container">
      <h2>Influencer Registration</h2>
      
      {/* Visual Feedback based on Mode */}
      {mode === 'invite' ? (
        <p style={{ fontSize: '14px', color: '#8e44ad', fontWeight: 'bold' }}>
           🚀 Joining via Admin Invite
        </p>
      ) : (
        <p style={{ fontSize: '14px', color: '#2980b9', fontWeight: 'bold' }}>
           🔗 Joining via Referral Link
        </p>
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
        <input name="instagram" placeholder="Instagram Link (Required)" required onChange={handleChange} />
        <input name="youtube" placeholder="YouTube Link (Optional)" onChange={handleChange} />
        <input name="otherLinks" placeholder="Other Links (Optional)" onChange={handleChange} />
        
        <button type="submit" className="pay-btn">Register</button>
      </form>
    </div>
  );
};

export default InfluencerRegister;
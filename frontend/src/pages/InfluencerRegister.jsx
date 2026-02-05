import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const InfluencerRegister = () => {
  const { token } = useParams(); // Get token from URL /influencers/:token
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', age: '', gender: 'Male',
    instagram: '', youtube: '', otherLinks: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, referralToken: token || null }; // Attach token if exists
      const res = await axios.post('http://localhost:5000/api/influencer/register', payload);
      
      // Show the generated password
      alert(`Registration Successful!\n\nYOUR PASSWORD IS: ${res.data.generatedPassword}\n\nPlease save this password to login.`);
      window.location.href = '/influencers/login';
      
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="container">
      <h2>Influencer Registration {token && "(Referral Mode)"}</h2>
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
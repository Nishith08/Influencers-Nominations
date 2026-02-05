import React, { useState } from 'react';
import axios from 'axios';

const InfluencerLogin = () => {
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/influencer/login', creds);
      localStorage.setItem('token', res.data.token);
     
      
      // Redirect based on role
      if(res.data.user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/influencers/dashboard';
      }
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="container">
      <h2>Influencer Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={e => setCreds({...creds, email: e.target.value})} />
        <input type="password" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
        <button className="pay-btn">Login</button>
      </form>
    </div>
  );
};

export default InfluencerLogin;
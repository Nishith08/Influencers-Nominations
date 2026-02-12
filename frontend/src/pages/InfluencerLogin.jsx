import React, { useState } from 'react';
import axios from 'axios';

const InfluencerLogin = () => {
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${__BACKEND_URL__}/api/influencer/login`, creds);
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(255,255,255,0.25)',
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/MAHI_LOGO.png" alt="Mahi Logo" style={{ width: 100, marginBottom: 0 }} />
        <h2
          style={{
            fontSize: '2.7rem',
            fontWeight: 800,
            marginBottom: 10,
            marginTop: 10,
            letterSpacing: 2,
            background: 'linear-gradient(90deg, #7d2ae8 0%, #f7971e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 24px rgba(125,42,232,0.13), 0 1px 0 #fff',
            textAlign: 'center',
            borderRadius: 8,
            padding: '6px 0',
          }}
        >
          Influencer Login
        </h2>
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="email"
            placeholder="Email"
            onChange={e => setCreds({ ...creds, email: e.target.value })}
            style={{
              padding: '13px 14px',
              borderRadius: 10,
              border: '2px solid #e9ecef',
              fontSize: '1rem',
              background: 'rgba(255,255,255,0.7)',
              color: '#333',
              marginBottom: 6,
              boxShadow: '0 1px 4px rgba(125,42,232,0.04)',
              outline: 'none',
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setCreds({ ...creds, password: e.target.value })}
            style={{
              padding: '13px 14px',
              borderRadius: 10,
              border: '2px solid #e9ecef',
              fontSize: '1rem',
              background: 'rgba(255,255,255,0.7)',
              color: '#333',
              marginBottom: 6,
              boxShadow: '0 1px 4px rgba(125,42,232,0.04)',
              outline: 'none',
            }}
            required
          />
          <button className="pay-btn" style={{
            marginTop: 10,
            background: 'linear-gradient(90deg, #7d2ae8 0%, #f7971e 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 50,
            padding: '15px 0',
            fontSize: '1.15rem',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(125,42,232,0.10)',
            transition: 'background 0.2s, transform 0.2s',
            width: '100%',
          }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default InfluencerLogin;
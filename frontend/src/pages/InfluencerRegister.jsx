
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
  
  // State for Success Modal
  const [showModal, setShowModal] = useState(false);
  const [generatedPass, setGeneratedPass] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- UPDATED FILE HANDLER WITH VALIDATION ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // 1. If no file selected (user clicked cancel)
    if (!file) return;

    // 2. Validate File Type (MIME check)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert("❌ Invalid File Type! Please upload an image (JPG, PNG, or WEBP).");
        e.target.value = null; // Clear the input
        setProfilePic(null);
        return;
    }

    // 3. Validate File Size (5MB Limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        alert("❌ File too large! Please choose an image less than 5MB.");
        e.target.value = null; // Clear the input
        setProfilePic(null);
        return;
    }

    // 4. If valid, set the state
    setProfilePic(file);
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
      
      setGeneratedPass(res.data.generatedPassword);
      setShowModal(true);
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPass);
    alert("Password copied to clipboard!");
  };

  const goToLogin = () => {
    window.location.href = '/influencers/login';
  };


  return (
    <div className="container influencer-register-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
        <img src="/MAHI_LOGO.png" alt="Mahi Logo" style={{ width: 90, height: 'auto', marginBottom: 0, borderRadius: 12 }} />
      </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
            <h1 className="holi-title">
              <span>H</span><span>o</span><span>l</span><span>i</span><span>&nbsp;</span><span>P</span><span>a</span><span>r</span><span>t</span><span>y</span>
            </h1>
        </div>
      <h2 className="register-title">Influencer Registration</h2>
      {mode === 'invite' ? (
        <p className="register-subtitle invite">Joining via Admin Invite</p>
      ) : (
        <p className="register-subtitle referral">Joining via Referral Link</p>
      )}

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input name="name" placeholder="Name" required onChange={handleChange} />
          <input name="phone" placeholder="Phone" required onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="email" placeholder="Email" required onChange={handleChange} />
        </div>
        <div className="input-group small-group">
          <input name="age" type="number" placeholder="Age" required onChange={handleChange} />
          <select name="gender" onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="profile-pic-upload">
          <label>
            Profile Picture <span className="required">*</span>
          </label>
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            required 
            onChange={handleFileChange}
          />
          <p className="requirement-text">
            ℹ️ <strong>Requirements:</strong> Images only (JPG, PNG). Max Size: <strong>5MB</strong>.
          </p>
        </div>
        <div className="input-group">
          <input name="instagram" placeholder="Instagram Link (Required)" required onChange={handleChange} />
        </div>
        <div className="input-group">
          <input name="youtube" placeholder="YouTube Link (Optional)" onChange={handleChange} />
          <input name="otherLinks" placeholder="Other Links (Optional)" onChange={handleChange} />
        </div>
        <button type="submit" className="pay-btn register-btn">Register</button>
      </form>

      {/* --- SUCCESS MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-emoji">🎉</div>
            <h3 className="modal-title">Registration Successful!</h3>
            <p className="modal-desc">Please save your secure password below to login.</p>
            <div className="modal-password">{generatedPass}</div>
            <div className="modal-btn-group">
              <button onClick={copyToClipboard} className="modal-btn copy-btn">📋 Copy Password</button>
              <button onClick={goToLogin} className="modal-btn login-btn">Login ➡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerRegister;
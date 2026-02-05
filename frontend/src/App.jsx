import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Import Pages
import BookingPage from './pages/BookingPage';
import InfluencerRegister from './pages/InfluencerRegister';
import InfluencerLogin from './pages/InfluencerLogin';
import InfluencerDashboard from './pages/InfluencerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // <--- Import Guard

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BookingPage />} />
        <Route path="/influencers" element={<InfluencerRegister />} />
        <Route path="/influencers/login" element={<InfluencerLogin />} />
        <Route path="/influencers/:token" element={<InfluencerRegister />} />

        {/* Protected Routes (Require Login) */}
        <Route 
          path="/influencers/dashboard" 
          element={
            <ProtectedRoute>
              <InfluencerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
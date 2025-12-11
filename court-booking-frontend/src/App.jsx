import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SlotGrid from './components/SlotGrid';
import BookingHistory from './components/BookingHistory';
import AdminCourts from './pages/AdminCourts';
import AdminEquipment from './pages/AdminEquipment';
import AdminCoaches from './pages/AdminCoaches';
import AdminPricing from './pages/AdminPricing';
import Login from './pages/Login';
import { getToken } from './utils/auth';

export default function App(){
  const token = getToken();
  return (
    <BrowserRouter>
      <div className="p-4 flex gap-4 border-b mb-4">
        <Link to="/">Booking</Link>
        {token ? (
          <>
            <Link to="/admin/courts">Courts</Link>
            <Link to="/admin/equipment">Equipment</Link>
            <Link to="/admin/coaches">Coaches</Link>
            <Link to="/admin/pricing">Pricing</Link>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="ml-auto">Logout</button>
          </>
        ) : (
          <Link to="/login" className="ml-auto">Admin Login</Link>
        )}
      </div>
      <Routes>
        <Route path="/" element={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SlotGrid />
            </div>
            <BookingHistory />
          </div>
        } />

        <Route path="/login" element={<Login />} />
        <Route path="/admin/courts" element={<AdminCourts />} />
        <Route path="/admin/equipment" element={<AdminEquipment />} />
        <Route path="/admin/coaches" element={<AdminCoaches />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
      </Routes>
    </BrowserRouter>
  );
}

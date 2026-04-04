/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import EventDetails from './pages/EventDetails';
import GuestLanding from './pages/GuestLanding';
import Payment from './pages/Payment';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-400/70 tracking-widest uppercase text-sm font-sans">Loading...</div>;
  
  if (!user) return <Navigate to="/" />;

  const isAdmin = user.email === 'dubeyjiinmirzapur@gmail.com';
  
  // If not admin, check profile completion and payment status
  if (!isAdmin) {
    const isProfileComplete = profile?.name && profile?.whatsapp;

    // Force profile completion first
    if (!isProfileComplete && location.pathname !== '/profile') {
      return <Navigate to="/profile" />;
    }

    // Force payment if profile is complete but not approved
    if (isProfileComplete && profile?.paymentStatus !== 'approved' && location.pathname !== '/payment' && location.pathname !== '/profile') {
      return <Navigate to="/payment" />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/events/:eventId" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/e/:eventId" element={<GuestLanding />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


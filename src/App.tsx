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
import Gallery from './pages/Gallery';
import Payment from './pages/Payment';
import AdminPanel from './pages/AdminPanel';

import About from './pages/About';

import { ErrorBoundary } from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, authError, logout } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white/50 tracking-[0.2em] uppercase text-xs font-sans">Loading...</div>;
  
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white font-sans p-6 text-center">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-xl font-serif mb-4 text-red-500">Authentication Error</h2>
          <p className="text-neutral-400 font-light mb-8 text-sm">{authError}</p>
          <button 
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="w-full bg-neutral-100 text-neutral-900 py-4 rounded-full font-medium tracking-wide hover:bg-white transition-colors"
          >
            Sign Out & Return Home
          </button>
        </div>
      </div>
    );
  }

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
    <ErrorBoundary>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/events/:eventId" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/e/:eventId" element={<GuestLanding />} />
          <Route path="/gallery/:eventId" element={<Gallery />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}


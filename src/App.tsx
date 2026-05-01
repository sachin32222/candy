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

import { ErrorBoundary } from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, authError, logout } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-400/70 tracking-widest uppercase text-sm font-sans">Loading...</div>;
  
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white font-sans p-6 text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-serif mb-4 text-red-400">Authentication Error</h2>
          <p className="text-white/70 font-light mb-8">{authError}</p>
          <button 
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="w-full bg-white text-stone-900 py-3 rounded-xl font-medium hover:bg-stone-100 transition-all"
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


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import ProfileSetup from './views/ProfileSetup';
import EventDetails from './views/EventDetails';
import GuestLanding from './views/GuestLanding';
import Gallery from './views/Gallery';
import Payment from './views/Payment';
import AdminPanel from './views/AdminPanel';
import FAQ from './views/FAQ';
import Integrations from './views/Integrations';
import Automations from './views/Automations';
import Blogs from './views/Blogs';
import KnowledgeBase from './views/KnowledgeBase';

import About from './views/About';

import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalSoundListener } from './components/GlobalSoundListener';
import WhatsAppWidget from './components/WhatsAppWidget';
import CursorStardust from './components/CursorStardust';

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
        <GlobalSoundListener />
        <CursorStardust />
        <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/integrations" element={<PrivateRoute><Integrations /></PrivateRoute>} />
          <Route path="/dashboard/automations" element={<PrivateRoute><Automations /></PrivateRoute>} />
          <Route path="/automations" element={<PrivateRoute><Automations /></PrivateRoute>} />
          <Route path="/events/:eventId" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/e/:eventId" element={<GuestLanding />} />
          <Route path="/gallery/:eventId" element={<Gallery />} />
        </Routes>
        <WhatsAppWidget />
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}


import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function KnowledgeBase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans text-white">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#333] sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button 
              onClick={() => navigate('/')}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs tracking-widest uppercase font-medium">Back to Home</span>
            </button>
            <span className="text-xl font-serif text-white tracking-tight">Candei.</span>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight">Knowledge Base</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl font-light">
            Everything you need to know about setting up and using Candei.
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-[#333] bg-[#1a1a1a]/50 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-serif text-white mb-6">How to Sign Up</h2>
            <div className="text-neutral-400 space-y-4 leading-relaxed font-light">
              <p>
                Signing up for Candei is quick and easy. We use secure Google Authentication to get you started immediately.
              </p>
              <ol className="list-decimal list-inside space-y-3 mt-4 text-neutral-300">
                <li>Click the "Access Operating System" button on the homepage.</li>
                <li>You will be prompted to sign in with your Google account.</li>
                <li>After signing in, you will be securely redirected to the Profile Setup page.</li>
                <li>Complete your profile by entering details such as your portfolio link, Instagram handle, and contact information.</li>
                <li>Once your profile is saved, you will gain full access to your personalized Dashboard!</li>
              </ol>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-[#333] bg-[#1a1a1a]/50 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-serif text-white mb-6">How to Create Events and All</h2>
            <div className="text-neutral-400 space-y-4 leading-relaxed font-light">
              <p>
                Creating an event is the core feature of Candei. It allows you to organize your photography sessions, manage leads, and seamlessly share galleries via Google Drive.
              </p>
              <ol className="list-decimal list-inside space-y-3 mt-4 text-neutral-300">
                <li>Navigate to your <strong>Dashboard</strong>.</li>
                <li>Click the prominent <strong>"Create New Event"</strong> button.</li>
                <li>A modal will appear. Enter your event's details: <strong>Event Name</strong> (e.g., "Rohit & Priya's Wedding") and <strong>Venue Location</strong>.</li>
                <li>Click <strong>"Create Event"</strong> to finalize. Candei will automatically generate a dedicated page for your event.</li>
                <li>Inside the event details page, you can <strong>Upload Photos</strong> which syncs automatically with a newly created folder in your Google Drive.</li>
                <li>You will also find a unique <strong>QR Code</strong> for the event. Guests can scan this QR code to view the gallery and submit their contact details, converting them into leads!</li>
              </ol>
              <p className="mt-4">
                <strong>Pro Tip:</strong> Ensure your Google Drive account is linked in your profile settings so Candei can automatically create folders and manage your high-resolution uploads.
              </p>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

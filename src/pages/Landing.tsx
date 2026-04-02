import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Camera } from 'lucide-react';

export default function Landing() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* Image Side */}
      <div className="md:w-1/2 h-64 md:h-auto relative">
        <img 
          src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Professional Photography" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white">
          <h1 className="font-serif text-5xl md:text-7xl mb-4">Candy.</h1>
          <p className="text-lg font-light tracking-widest uppercase text-white/90">Elevate Your Photography Business</p>
        </div>
      </div>
      
      {/* Content Side */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-stone-50">
        <div className="max-w-md w-full text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-8">
            <Camera className="w-10 h-10 text-stone-900" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-6">Capture. Share. Grow.</h2>
          <p className="text-stone-500 mb-12 font-light leading-relaxed">
            The all-in-one event management and lead generation platform designed exclusively for professional photographers. Turn every event into a networking opportunity.
          </p>
          
          <button
            onClick={signIn}
            className="w-full bg-stone-900 text-white py-4 px-6 tracking-widest uppercase text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

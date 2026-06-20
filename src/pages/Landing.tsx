import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Camera, Users, TrendingUp, ExternalLink, ChevronRight, Instagram, Video, VideoOff, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const FLOATING_ELEMENTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5,
}));

export default function Landing() {
  const { user, signIn, authError } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (user) {
      if (user.email === 'dubeyjiinmirzapur@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. If you are using Safari or a mobile browser, try opening the app in a new tab.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isLiveMode]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsLiveMode(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }
        });
        setStream(mediaStream);
        setIsLiveMode(true);
      } catch (err: any) {
        console.error("Camera access denied", err);
        setError("Camera access denied. Please allow camera permissions.");
      }
    }
  };

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode }
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Failed to switch camera", err);
      setError("Failed to switch camera device.");
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row overflow-x-hidden relative ${isLiveMode ? 'bg-black' : 'bg-[#0f0f0f]'}`}>
      
      {/* Background Particles Area / Live Video */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {isLiveMode ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0f0f0f]"></div>
        )}
      </div>

      {/* Left Column: Content */}
      <div className="w-full md:w-[55%] flex flex-col justify-center px-6 sm:px-16 lg:px-24 pt-32 pb-16 md:py-16 relative z-10 min-h-screen md:min-h-0">
        
        {/* Brand/Logo Area */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-8 left-8 sm:top-12 flex items-center gap-3"
        >
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            <Camera className="w-5 h-5 text-neutral-900" />
          </motion.div>
          <span className="bg-gradient-to-r from-neutral-200 via-neutral-600 to-neutral-200 bg-clip-text text-transparent text-[11px] font-bold tracking-[0.3em] uppercase animate-text-gradient">
            Candei OS
          </span>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl mt-32 sm:mt-40 md:mt-20"
        >


          <motion.h1 variants={itemVariants} style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px" }} className="font-normal text-[4.5rem] sm:text-[5.5rem] lg:text-[7rem] leading-[0.9] tracking-normal mb-8 uppercase">
            <span className="bg-gradient-to-r from-[#4A6DE1] via-[#A5BDFC] to-[#4A6DE1] bg-clip-text text-transparent animate-text-gradient block pb-2">Capture.</span>
            <span className="relative inline-block bg-gradient-to-r from-[#4A6DE1] via-white to-[#4A6DE1] bg-clip-text text-transparent animate-text-gradient pb-2">
              Convert.
            </span><br />
            <span className="bg-gradient-to-r from-[#4A6DE1] via-[#A5BDFC] to-[#4A6DE1] bg-clip-text text-transparent animate-text-gradient block pb-2">Dominate.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg font-light leading-relaxed mb-12 max-w-sm bg-gradient-to-r from-neutral-400 via-neutral-100 to-neutral-400 bg-clip-text text-transparent animate-text-gradient">
            An AI-powered operating system for photographers that automatically organizes, searches, delivers, markets, and monetizes event photography using computer vision and generative AI.
          </motion.p>
          
            {/* Action Area */}
          <motion.div variants={itemVariants} className="space-y-6 max-w-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="w-full bg-neutral-100 text-neutral-900 py-4 px-8 rounded-full font-medium tracking-wide hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white via-neutral-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="relative z-10 font-bold">Continue with Google</span>
              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('/#/payment', '_blank')}
              style={{ backgroundColor: '#0D94FB', borderWidth: '0.33333px', borderStyle: 'inset' }}
              className="w-full text-white py-4 px-8 rounded-full font-bold tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-3 group overflow-hidden relative shadow-[0_0_20px_rgba(13,148,251,0.3)]"
            >
              <span className="relative z-10">Pay Now</span>
              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/#/about', '_blank')}
                  style={{ backgroundColor: '#000000', borderStyle: 'groove' }}
                  className="w-full text-white border border-[#333] py-4 px-8 rounded-full font-medium tracking-wide hover:bg-[#252525] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  About Us
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/story.html"
                  target="_blank"
                  style={{ borderStyle: 'groove' }}
                  className="w-full bg-[#1a1a1a] text-white border border-[#9a9d96] py-4 px-8 rounded-full font-medium tracking-wide hover:bg-[#33003b] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Our Story
                </motion.a>
              </div>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/why-candei.html"
                target="_blank"
                style={{ backgroundColor: '#0D94FB', borderWidth: '0.33333px', borderStyle: 'inset' }}
                className="w-full text-white border border-[#9a9d96] py-4 px-8 rounded-full font-medium tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(13,148,251,0.3)]"
              >
                Why Candei
              </motion.a>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                className="p-4 bg-red-950/30 border border-red-900/50 rounded-2xl text-red-500 text-sm flex flex-col items-center gap-3 overflow-hidden"
              >
                <p className="text-center">{error}</p>
                {window !== window.top && (
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 rounded-full text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in New Tab
                  </button>
                )}
              </motion.div>
            )}
            
            <motion.p variants={itemVariants} style={{ color: '#728786', fontSize: '12px', lineHeight: '15px', fontStyle: 'normal' }} className="text-center font-medium uppercase tracking-[0.2em] transition-all duration-300 cursor-default">
              Join 24,000+ elite photographers
            </motion.p>
          </motion.div>

          {/* Feature Grid Mini */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 mt-20 border-t border-[#908888] pt-12 max-w-lg mb-8">
            <motion.div whileHover={{ y: -5 }} className="group">
              <div className="flex items-center gap-2 mb-3 text-white">
                <div className="p-2 rounded-full bg-[#0f0f0f] group-hover:bg-white group-hover:text-neutral-900 transition-colors">
                  <Users className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-bold">Lead Gen</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed font-light transition-colors group-hover:text-neutral-300">Turn attendees into a high-converting pipeline with instant QR captures.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="group">
              <div className="flex items-center gap-2 mb-3 text-white">
                <div className="p-2 rounded-full bg-[#0f0f0f] group-hover:bg-white group-hover:text-neutral-900 transition-colors">
                  <TrendingUp className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-bold">Brand Equity</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed font-light transition-colors group-hover:text-neutral-300">Automate Google reviews, Instagram follows, and long-term client retention.</p>
            </motion.div>
          </motion.div>

          {/* Social Icons & Live Toggle */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 pointer-events-auto w-full"
          >
            <a href="https://www.instagram.com/get_candei?igsh=a3NneHRpYXQ5anln" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity text-white hover:text-fuchsia-400 flex-shrink-0">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://wa.me/919318465272" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity text-white hover:text-emerald-400 flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
            
            <div className="w-px h-6 bg-white/20 mx-1 md:mx-2 hidden sm:block"></div>
            
            {isLiveMode && (
              <button 
                onClick={switchCamera}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all shadow-lg flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
            <button 
              onClick={toggleLiveMode}
              className={`flex items-center justify-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-medium tracking-wide text-xs md:text-sm backdrop-blur-md transition-all shadow-xl border flex-shrink-0 ${
                isLiveMode 
                  ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30 hover:scale-105' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105'
              }`}
            >
              {isLiveMode ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {isLiveMode ? 'Turn Off Live' : 'Live Me'}
            </button>

            <div className="w-px h-6 bg-white/20 mx-1 md:mx-2 hidden lg:block"></div>

            <div className="text-white border border-white/10 backdrop-blur-3xl px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-black/40 shadow-2xl flex-shrink-0 mb-4 sm:mb-0 w-full sm:w-auto flex justify-center sm:block">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  <p className="text-[10px] font-mono tracking-widest uppercase opacity-80" style={{ color: '#006ad6' }}>System Operational</p>
                </div>
                <div className="flex items-center gap-2 opacity-50 ml-[14px] text-[8px] uppercase font-mono tracking-wider">
                  <a href="/terms.html" className="hover:opacity-100 transition-opacity px-1 rounded" style={{ backgroundColor: '#000000', color: 'white' }} target="_blank" rel="noopener noreferrer">Terms</a>
                  <span>/</span>
                  <a href="/privacy.html" className="hover:opacity-100 transition-opacity" target="_blank" rel="noopener noreferrer">Privacy</a>
                  <span>/</span>
                  <a href="/#/faq" className="hover:opacity-100 transition-opacity" target="_blank" rel="noopener noreferrer">FAQ</a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column: Imagery / Video */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className={`flex flex-col items-center justify-center w-full md:w-[45%] relative border-t md:border-t-0 md:border-l border-[#333] p-8 md:px-8 py-16 md:py-8 transition-colors duration-500 z-10 ${isLiveMode ? 'bg-transparent' : 'bg-[#0f0f0f]'}`}
      >
        {/* Subtle vignette/gradient over the edge to blend nicely */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent w-[15%] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-80 h-[20%] mt-auto pointer-events-none z-10"></div>
        
        <div className="w-full relative aspect-video max-w-[1270px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(74,109,225,0.15)] border border-white/5 z-20 bg-black m-auto flex-shrink-0 items-center justify-center">
          {!isVideoPlaying ? (
            <div 
              className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center z-30"
              onClick={() => setIsVideoPlaying(true)}
            >
              <img 
                src="https://img.youtube.com/vi/sHooRInnHvE/hqdefault.jpg" 
                alt="Candei OS Platform Overview" 
                width="1270"
                height="720"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://img.youtube.com/vi/sHooRInnHvE/0.jpg";
                }}
              />
              <div className="relative w-20 h-20 bg-red-600/90 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-red-600 group-hover:scale-105 transition-all duration-300 shadow-2xl">
                <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ) : (
            <iframe
              width="1270"
              height="720"
              src="https://www.youtube.com/embed/sHooRInnHvE?autoplay=1&controls=1&rel=0"
              className="absolute inset-0 w-full h-full border-0 animate-in fade-in duration-500 z-10"
              title="Candei OS Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
        
        {/* Rail Text (Creative touch) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute top-28 right-8 flex items-center justify-center z-40 pointer-events-none"
        >
            <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] uppercase tracking-[0.3em] font-bold text-[forestgreen]">
              <span className="bg-gradient-to-t from-[forestgreen] via-white to-[forestgreen] bg-clip-text text-transparent animate-text-gradient-y">
                Candei OS v2.0
              </span>
            </p>
        </motion.div>
      </motion.div>
      
    </div>
  );
}

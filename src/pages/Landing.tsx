import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Camera, Users, Image as ImageIcon, Zap, QrCode, Smartphone, Share, TrendingUp, Star, Heart, Instagram, Youtube, MessageSquare, Palette, BarChart3, Lock, Globe, HelpCircle } from 'lucide-react';

export default function Landing() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.email === 'dubeyjiinmirzapur@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative font-sans bg-stone-900">
      {/* Fixed Background Image & Effects */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-60" 
          alt="Professional Photography" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/90"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side: Hero Text */}
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-sm font-medium tracking-widest uppercase">Candy Photography</span>
              </div>
              
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.1]">
                Capture. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Share. Dominate.</span>
              </h1>
              
              <p className="text-lg sm:text-xl font-light text-white/80 max-w-xl leading-relaxed">
                The all-in-one event management and lead generation platform designed exclusively for professional photographers. Turn every event into a networking powerhouse.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition-all hover:bg-white/10">
                  <Users className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-white font-medium text-lg mb-2">Lead Generation</h3>
                  <p className="text-white/60 text-sm font-light leading-relaxed">Capture guest details effortlessly via custom QR codes at your events.</p>
                </div>
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition-all hover:bg-white/10">
                  <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="text-white font-medium text-lg mb-2">Social Growth</h3>
                  <p className="text-white/60 text-sm font-light leading-relaxed">Drive Google reviews, Instagram followers, and YouTube subscribers.</p>
                </div>
              </div>
            </div>

            {/* Right Side: Glassmorphism Login Card */}
            <div className="w-full max-w-md mx-auto lg:ml-auto mt-8 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden">
                {/* Card inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur-md">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-3">Get Started</h2>
                    <p className="text-white/70 font-light">Join 10,000+ elite photographers growing their business.</p>
                  </div>

                  <button
                    onClick={signIn}
                    className="w-full bg-white text-stone-900 py-4 px-6 rounded-xl font-medium hover:bg-stone-100 transition-all flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
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
                  
                  <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-white/50 text-xs font-light">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Premium Stats Section */}
        <div className="border-t border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
              <div>
                <div className="text-3xl md:text-4xl font-serif text-white mb-2">10,000+</div>
                <div className="text-xs tracking-widest uppercase text-amber-400/80 font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-white mb-2">5M+</div>
                <div className="text-xs tracking-widest uppercase text-amber-400/80 font-medium">Photos Delivered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-white mb-2">2.5M+</div>
                <div className="text-xs tracking-widest uppercase text-amber-400/80 font-medium">Leads Generated</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-white mb-2">98%</div>
                <div className="text-xs tracking-widest uppercase text-amber-400/80 font-medium">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Beyond Leads Section (New) */}
        <div className="py-24 px-6 sm:px-8 lg:px-12 bg-black/50 backdrop-blur-lg border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">More Than Just Emails</h2>
              <p className="text-white/70 font-light text-lg max-w-2xl mx-auto">Candy doesn't just collect leads. It turns every event guest into a potential follower, subscriber, and brand advocate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <MessageSquare className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Google Reviews</h3>
                <p className="text-white/60 font-light leading-relaxed">Automate 5-star reviews by redirecting happy guests directly to your Google Business page after they access their photos.</p>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <Instagram className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Instagram Growth</h3>
                <p className="text-white/60 font-light leading-relaxed">Turn event guests into loyal followers. Prompt them to follow your Instagram page before accessing their high-res galleries.</p>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <Youtube className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">YouTube Subscribers</h3>
                <p className="text-white/60 font-light leading-relaxed">Growing a channel? Direct traffic to your latest vlog, behind-the-scenes video, or portfolio reel effortlessly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Section */}
        <div className="py-24 px-6 sm:px-8 lg:px-12 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Pro Features Included</h2>
              <p className="text-white/70 font-light text-lg max-w-2xl mx-auto">Everything you need to deliver a premium experience to your clients and their guests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <Palette className="w-8 h-8 text-amber-400 mb-6" />
                <h3 className="text-xl font-medium text-white mb-3">Custom Branding</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">Add your logo and match your brand colors. Make every touchpoint look professionally yours.</p>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <Globe className="w-8 h-8 text-amber-400 mb-6" />
                <h3 className="text-xl font-medium text-white mb-3">No App Required</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">Completely web-based. Guests simply scan and view instantly in their native mobile browser.</p>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <Lock className="w-8 h-8 text-amber-400 mb-6" />
                <h3 className="text-xl font-medium text-white mb-3">Secure Delivery</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">Your photos stay secure in your Google Drive. You control exactly who gets access to what.</p>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 hover:bg-white/10 transition-all">
                <BarChart3 className="w-8 h-8 text-amber-400 mb-6" />
                <h3 className="text-xl font-medium text-white mb-3">Live Analytics</h3>
                <p className="text-white/60 font-light leading-relaxed text-sm">Track QR scans, lead conversions, and social clicks in real-time from your dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 px-6 sm:px-8 lg:px-12 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">How It Works</h2>
              <p className="text-white/70 font-light text-lg max-w-2xl mx-auto">A seamless workflow designed to maximize your networking potential while you focus on capturing the perfect shot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting lines for desktop */}
              <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0"></div>

              <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 text-center hover:bg-white/10 transition-all hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <QrCode className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">1. Create an Event</h3>
                <p className="text-white/60 font-light leading-relaxed">Set up your event in seconds. We automatically generate a unique, scannable QR code for you to display.</p>
              </div>

              <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 text-center hover:bg-white/10 transition-all hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <Smartphone className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">2. Guests Scan</h3>
                <p className="text-white/60 font-light leading-relaxed">Guests scan the code to access the gallery. They enter their contact details to view or download photos.</p>
              </div>

              <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 text-center hover:bg-white/10 transition-all hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                  <Share className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">3. Grow Your Brand</h3>
                <p className="text-white/60 font-light leading-relaxed">Instantly collect verified emails, boost your social following, and drive reviews while you work.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Case Studies / Testimonials Section */}
        <div className="py-24 px-6 sm:px-8 lg:px-12 bg-black/60 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Real Results</h2>
              <p className="text-white/70 font-light text-lg max-w-2xl mx-auto">See how professional photographers are transforming their businesses with Candy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <TrendingUp className="w-24 h-24 text-amber-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-white/90 text-lg font-light leading-relaxed mb-8 italic">
                    "I received over 100 new leads from a single big fat Indian wedding. My booking rate for the next wedding season skyrocketed because I could easily follow up with guests who loved my work."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-700 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Priya S." className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Priya Sharma</h4>
                      <p className="text-white/50 text-sm">Wedding Photographer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Youtube className="w-24 h-24 text-amber-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-white/90 text-lg font-light leading-relaxed mb-8 italic">
                    "We saw 90x growth in our email list in just 3 months. Plus, I linked my YouTube channel on the guest page, and my subscriber count jumped by 40% after just two corporate events!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-700 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Rahul D." className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Rahul Desai</h4>
                      <p className="text-white/50 text-sm">Corporate Event Shooter</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Instagram className="w-24 h-24 text-amber-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-white/90 text-lg font-light leading-relaxed mb-8 italic">
                    "Not only am I getting more leads, but my Google Reviews went from 12 to over 150 in a month. My Instagram followers are growing organically after every single event."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-700 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Ananya P." className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Ananya Patel</h4>
                      <p className="text-white/50 text-sm">Portrait & Event Photographer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 px-6 sm:px-8 lg:px-12 bg-black/50 backdrop-blur-lg border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-white/70 font-light text-lg">Everything you need to know about getting started.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[1.5rem] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Do my guests need to download an app?</h3>
                    <p className="text-white/60 font-light leading-relaxed">Not at all! Candy is 100% web-based. Guests simply scan your QR code using their standard smartphone camera, and the gallery opens instantly in their browser.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[1.5rem] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Can I use my existing Google Drive?</h3>
                    <p className="text-white/60 font-light leading-relaxed">Yes! Candy integrates seamlessly with your existing Google Workspace or personal Google Drive. We don't hold your photos hostage—they stay right where you put them.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[1.5rem] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">What if the venue has bad internet?</h3>
                    <p className="text-white/60 font-light leading-relaxed">You can generate and print your event QR codes ahead of time. Guests can snap a photo of the QR code and scan it later when they have a better connection to access their photos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="py-20 px-6 text-center bg-black/80 backdrop-blur-xl border-t border-white/10">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">Ready to elevate your business?</h2>
          <button
            onClick={signIn}
            className="inline-flex items-center gap-3 bg-white text-stone-900 py-4 px-8 rounded-xl font-medium hover:bg-stone-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Start Growing Today
          </button>
        </div>

        {/* Footer */}
        <footer className="bg-black py-12 px-6 sm:px-8 lg:px-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-3 mb-4">
                <Camera className="w-6 h-6 text-white" />
                <span className="text-xl font-serif text-white tracking-tight">Candy.</span>
              </div>
              <p className="text-white/50 font-light text-sm max-w-sm">
                The all-in-one event management and lead generation platform designed exclusively for professional photographers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/50 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/50 font-light">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs font-light">
              &copy; {new Date().getFullYear()} Candy Photography. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-white/40">
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

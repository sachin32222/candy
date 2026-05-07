import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  Camera, 
  Users, 
  MessageCircle, 
  Clock, 
  Star, 
  Share2, 
  Image as ImageIcon, 
  Phone, 
  BarChart, 
  CheckCircle2, 
  PlayCircle,
  Smartphone,
  ScanFace,
  ImageDown,
  UserPlus
} from 'lucide-react';

export default function About() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartFree = () => {
    if (user) navigate('/dashboard');
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans overflow-x-hidden selection:bg-[#caff00] selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Link to="/" className="text-2xl font-serif tracking-tight">Candei</Link>
        <div className="flex gap-4">
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Home</Link>
          <button onClick={handleStartFree} className="text-sm font-medium text-[#caff00] hover:text-[#e0ff4d] transition-colors">Start Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#333] bg-[#1a1a1a] text-[10px] uppercase tracking-widest text-[#caff00]">
            <span className="w-2 h-2 rounded-full bg-[#caff00] inline-block mr-2 animate-pulse"></span>
            Now Live — The Photographer's Growth Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] tracking-tight">
            Shoot More.<br/>
            <span className="text-[#caff00]">Earn</span> More.<br/>
            <span className="text-[#ff4500]">Grow</span> More.
          </h1>
          <p className="text-xl text-neutral-400 font-light max-w-xl leading-relaxed">
            The all-in-one lead gen and marketing platform that turns your photography events into a client-acquisition machine — AI-powered, beautifully simple, built for photographers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleStartFree} className="bg-[#caff00] text-black px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-[#e0ff4d] transition-colors flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" /> Get Started Free
            </button>
            <button className="border border-[#333] bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-medium tracking-wide hover:bg-[#222] transition-colors flex items-center justify-center gap-2">
              Request a Demo <span className="ml-2">→</span>
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#caff00]/20 to-[#00f0ff]/20 blur-3xl opacity-50 rounded-full"></div>
          {/* Subtle graphic element instead of full image */}
          <div className="relative border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-hidden aspect-square flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                 <Camera className="w-6 h-6 text-white/50" />
               </div>
               <div className="text-xs font-mono text-white/30 uppercase tracking-widest">Candei OS</div>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-1/3 bg-white/10 rounded-full"></div>
              <div className="h-2 w-full bg-white/10 rounded-full"></div>
              <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#caff00] text-black py-4 overflow-hidden whitespace-nowrap flex font-mono uppercase tracking-[0.2em] text-sm *:shrink-0 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center animate-[marquee_20s_linear_infinite]">
            <span>Smart Lead Capture</span>
            <span>✦</span>
            <span>AI Selfie Finder</span>
            <span>✦</span>
            <span>WhatsApp Broadcast</span>
            <span>✦</span>
            <span>Auto-Delete Albums</span>
            <span>✦</span>
          </div>
        ))}
      </div>

      {/* Pitch Section */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center space-y-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#caff00] font-mono">— About Candei</div>
        <h2 className="text-5xl md:text-6xl font-serif">
          Photography's <br/> <span className="text-[#caff00]">Marketing Brain</span>
        </h2>
        <p className="text-xl text-neutral-400 font-light leading-relaxed mx-auto">
          Candei is the all-in-one lead gen and marketing platform that turns your photography events into a client-acquisition machine. While you focus on taking great photos, Candei captures leads, nurtures relationships, and broadcasts to your audience — all automatically.
        </p>
        <button onClick={handleStartFree} className="bg-[#caff00] text-black px-10 py-5 rounded-xl font-medium tracking-wide hover:bg-[#e0ff4d] transition-colors w-full md:w-auto text-lg mt-8 inline-block">
          Start for Free →
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20 text-left">
          <div className="p-6 border border-[#333] bg-[#111] rounded-2xl border-t-[#caff00] border-t-2">
            <div className="text-3xl font-serif mb-2">3×</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Leads</div>
            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">More leads per event vs traditional galleries</p>
          </div>
          <div className="p-6 border border-[#333] bg-[#111] rounded-2xl border-t-[#ff4500] border-t-2">
            <div className="text-3xl font-serif mb-2">AI</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Face-Match</div>
            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">Face-match technology for instant selfie search</p>
          </div>
          <div className="p-6 border border-[#333] bg-[#111] rounded-2xl border-t-[#00f0ff] border-t-2">
            <div className="text-3xl font-serif mb-2">1-tap</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Broadcast</div>
            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">WhatsApp broadcast to your entire leads list</p>
          </div>
          <div className="p-6 border border-[#333] bg-[#111] rounded-2xl border-t-[#b500ff] border-t-2">
            <div className="text-3xl font-serif mb-2">∞</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider font-mono">Platform</div>
            <p className="text-sm text-neutral-400 mt-4 leading-relaxed">Events, albums, portfolios — all on one platform</p>
          </div>
        </div>
      </section>

      {/* Features Outline */}
      <section className="py-24 px-6 bg-[#161616]">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#ff4500] font-mono mb-4">— Platform Features</div>
          <h2 className="text-5xl font-serif mb-16">
            Everything you need.<br/>
            <span className="text-[#ff4500]">Nothing you don't.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ImageIcon className="w-5 h-5 text-[#caff00]"/>}
              title="Smart Event Galleries"
              desc="Create beautiful, branded event galleries in minutes. Control access, gate downloads behind lead capture, and deliver an experience guests remember."
              border="border-[#caff00]"
            />
            <FeatureCard 
              icon={<Users className="w-5 h-5 text-[#ff4500]"/>}
              title="Lead Capture CRM"
              desc="Every gallery visitor's details — name, phone, email — captured automatically. Build your client database while they enjoy their photos."
               border="border-[#ff4500]"
            />
            <FeatureCard 
              icon={<MessageCircle className="w-5 h-5 text-emerald-400"/>}
              title="WhatsApp Broadcast"
              desc="One-click WhatsApp broadcast to all your captured leads. Share promos, new events, or booking links — directly to their inbox."
               border="border-emerald-400"
            />
            <FeatureCard 
              icon={<Clock className="w-5 h-5 text-[#00f0ff]"/>}
              title="Auto-Delete Albums"
              desc="Set expiry timers on galleries to create urgency. Guests rush to download, engage, and share — driving organic growth."
               border="border-[#00f0ff]"
            />
            <FeatureCard 
              icon={<Star className="w-5 h-5 text-[#b500ff]"/>}
              title="Review Generation"
              desc="Prompt clients for reviews at the perfect moment — right after they access their gorgeous photos. Build your 5-star reputation."
               border="border-[#b500ff]"
            />
            <FeatureCard 
              icon={<Share2 className="w-5 h-5 text-[#caff00]"/>}
              title="Social Growth Engine"
              desc="One-tap social follow buttons embedded in every gallery. Every event guest becomes a potential Instagram or YouTube follower."
               border="border-[#caff00]"
            />
            <FeatureCard 
              icon={<Camera className="w-5 h-5 text-red-400"/>}
              title="Photographer Portfolio"
              desc="A stunning, branded portfolio page showcasing your best work. Built to impress, designed to convert visitors into booking enquiries."
               border="border-red-400"
            />
             <FeatureCard 
              icon={<Phone className="w-5 h-5 text-blue-400"/>}
              title="One-Click Contact"
              desc="Call, email, or WhatsApp buttons on every page. Zero friction between a potential client seeing your work and reaching out."
               border="border-blue-400"
            />
            <FeatureCard 
              icon={<BarChart className="w-5 h-5 text-orange-400"/>}
              title="Analytics Dashboard"
              desc="Track views, downloads, leads generated, conversions, and social follows per event. Know your numbers to scale your business."
               border="border-orange-400"
            />
          </div>
        </div>
      </section>

      {/* AI Selfie Finder */}
      <section className="py-32 px-6 max-w-6xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#b500ff] font-mono">— AI Technology</div>
            <h2 className="text-4xl md:text-5xl font-serif">
              The <span className="text-[#b500ff]">AI Selfie Finder</span> guests can't stop talking about
            </h2>
            <p className="text-lg text-neutral-400 font-light leading-relaxed">
              Guests upload one selfie. Our AI scans your entire event gallery and delivers every photo of that person — personalised, instant, magical. While they're wowed, you're capturing their details.
            </p>
            <button className="w-full border border-white/20 bg-white/5 py-4 rounded-xl hover:bg-white/10 transition-colors font-medium">
              See the demo →
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-[#b500ff]/20 blur-[100px] rounded-full"></div>
            <div className="relative space-y-6">
              {[
                { step: "1", title: "Guest uploads a selfie", desc: "No app needed. Works directly in the browser from any phone.", color: "#b500ff" },
                { step: "2", title: "AI scans your gallery", desc: "Face recognition identifies every photo featuring that guest's face.", color: "#00f0ff" },
                { step: "3", title: "Personalised gallery delivered", desc: "They get all their photos. You get their contact details. Win-win.", color: "#caff00" },
                { step: "4", title: "Lead captured automatically", desc: "Every delighted guest enters your CRM — ready for your WhatsApp broadcast.", color: "#ff4500" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start border-b border-[#222] pb-6 last:border-0 border-l border-l-transparent hover:border-l-[length:var(--tw-color)] pl-0 hover:pl-6 transition-all duration-300" style={{'--tw-color': item.color} as any}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-black shrink-0" style={{backgroundColor: item.color}}>{item.step}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Broadcast */}
      <section className="py-24 bg-emerald-950/20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-900/30 text-[10px] uppercase tracking-widest text-emerald-400 mb-4">
              <MessageCircle className="w-3 h-3 inline mr-2"/>
              New — WhatsApp Broadcast
            </div>
            <h2 className="text-5xl font-serif">
              Reach every lead<br/>with <span className="text-emerald-400">one tap</span>
            </h2>
            <p className="text-xl text-neutral-400 font-light leading-relaxed">
              Your captured leads are gold. Now use them. Send promotions, announce new events, share portfolio links, or follow up on bookings — directly to every lead's WhatsApp in a single broadcast.
            </p>

            <div className="bg-[#0a1a10] border border-emerald-900/50 rounded-2xl p-8 max-w-2xl mx-auto text-left space-y-4 shadow-xl">
               {[
                 "One-click broadcast to all your leads",
                 "Personalise messages with names & event details",
                 "Share gallery links, promos, or booking pages",
                 "Track opens and engagement",
                 "Schedule broadcasts in advance"
               ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/>
                    <span className="text-sm text-neutral-300">{text}</span>
                  </div>
               ))}
               <div className="pt-6">
                 <button className="w-full bg-emerald-500 text-black font-medium py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                   <MessageCircle className="w-5 h-5"/> Try WhatsApp Broadcast
                 </button>
               </div>
            </div>
        </div>
      </section>

      {/* Steps to go live */}
      <section className="py-32 px-6 max-w-6xl mx-auto border-t border-[#222]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#00f0ff] font-mono mb-4">— Getting Started</div>
        <h2 className="text-4xl md:text-5xl font-serif mb-16">
          Live in <span className="text-[#00f0ff]">5 steps.</span><br/>
          No tech skills needed.
        </h2>
        
        <div className="space-y-12">
            {[
              { num: "1", title: "Sign Up", desc: "Create your free Candei account and set up your photographer profile with logo, bio, and social links." },
              { num: "2", title: "Create Event", desc: "Upload your photos, name your event, and configure your lead capture gates and gallery settings." },
              { num: "3", title: "Share Link", desc: "Share via WhatsApp, QR code, or social. Guests visit, submit their details, and access their photos." },
              { num: "4", title: "Collect Leads", desc: "Watch your CRM fill up automatically. Every visitor becomes a trackable, contactable lead." },
              { num: "5", title: "Broadcast & Book", desc: "Send a WhatsApp broadcast, convert leads to bookings, and grow your photography business." }
            ].map((step, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#333] flex items-center justify-center font-serif text-xl text-neutral-400 group-hover:border-[#00f0ff] group-hover:text-[#00f0ff] transition-colors bg-[#0f0f0f] z-10 shrink-0">
                    {step.num}
                  </div>
                  {i !== 4 && <div className="w-[1px] h-full bg-[#333] -my-2 group-hover:bg-[#00f0ff] transition-colors"></div>}
                </div>
                <div className="pb-12 pt-2">
                  <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                  <p className="text-neutral-500 font-light max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Niches */}
      <section className="py-24 bg-[#111]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#caff00] font-mono mb-4">— Who it's for</div>
          <h2 className="text-4xl font-serif mb-12">Every shoot. <span className="text-[#caff00]">Every niche.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NicheCard title="Wedding Photography" subtitle="Turn guests into future clients" emoji="💍" color="#caff00" desc="Every wedding has hundreds of guests — all potential clients for their own big day. Candei captures every one of them while they download their photos."/>
            <NicheCard title="Sports & Marathons" subtitle="Athletes find themselves instantly" emoji="🏃" color="#ff4500" desc="With 10,000+ photos per race, AI Selfie Finder is a game-changer. Every runner gets their moment — and discovers your brand in the process."/>
            <NicheCard title="Corporate Events" subtitle="C-suite contacts, captured" emoji="🏢" color="#00f0ff" desc="Deliver stunning corporate galleries while collecting contact details of decision-makers, HR leads, and future event bookers."/>
            <NicheCard title="Schools & Institutions" subtitle="Family networks, fully engaged" emoji="🎓" color="#b500ff" desc="Annual days, graduations, sports meets — share photos with families who become enthusiastic referrers within their social circles."/>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 px-6 max-w-5xl mx-auto border-t border-[#222]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#b500ff] font-mono mb-4 text-center">— Pricing</div>
        <h2 className="text-4xl md:text-5xl font-serif mb-6 text-center">
          Simple pricing.<br/>
          <span className="text-[#b500ff]">Serious results.</span>
        </h2>
        <p className="text-center text-neutral-400 max-w-lg mx-auto mb-16">
          Two straightforward plans. Every feature included. No free trial — because Candei delivers real results from day one.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
           <div className="border border-[#333] bg-[#161616] rounded-3xl p-10 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-neutral-400 mb-6">Semi-Annual Plan</div>
                <div className="text-6xl font-serif mb-2">₹999</div>
                <div className="text-sm text-neutral-500 mb-8">Billed once every 6 months</div>
                
                <div className="space-y-3 mb-10">
                  {['Unlimited Events & Albums', 'AI Selfie Finder', 'WhatsApp Broadcast to Leads', 'Lead Capture CRM', 'Review Generation', 'Social Follow Engine', 'Auto-Delete Albums', 'Photographer Portfolio', 'One-Click Contact Buttons', 'Analytics Dashboard'].map((feature, i) => (
                    <div key={i} className="flex gap-3 text-sm text-neutral-300 items-start">
                      <span className="text-[#caff00] mt-0.5">✦</span> {feature}
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full border border-[#444] bg-[#222] py-4 rounded-xl hover:bg-[#333] transition-colors font-medium text-white">
                Get Started →
              </button>
           </div>

           <div className="border-2 border-[#caff00] bg-[#111600] rounded-3xl p-10 relative flex flex-col justify-between">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#caff00] text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                ⚡ Best Value
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-mono text-[#caff00] mb-6">Annual Plan</div>
                <div className="text-6xl font-serif mb-2">₹899</div>
                <div className="text-sm text-[#caff00]/80 mb-8 font-medium">Billed once every 10 months · Save 10%</div>
                
                <div className="space-y-3 mb-8">
                  {['Everything in Semi-Annual', 'Priority Support', 'Early Access to New Features', 'Custom Branding & Watermarks'].map((feature, i) => (
                    <div key={i} className="flex gap-3 text-sm text-neutral-200 items-start">
                      <span className="text-[#caff00] mt-0.5">✦</span> {feature}
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#caff00]/10 border border-[#caff00]/20 rounded-xl p-4 mb-8">
                  <p className="text-xs text-[#caff00] text-center leading-relaxed">
                    💡 Pay <span className="font-bold text-white">₹8,990</span> for 10 months of full access — just ₹899/month, the smartest investment for your photography business.
                  </p>
                </div>
              </div>

              <button className="w-full bg-[#caff00] text-black py-4 rounded-xl hover:bg-[#e0ff4d] transition-colors font-semibold text-lg shadow-[0_0_20px_rgba(202,255,0,0.2)]">
                Get Best Value →
              </button>
           </div>
        </div>
        <p className="text-center text-xs text-neutral-500 mt-8">All plans include every feature. No hidden fees. No free trial — just real results from day one.</p>
      </section>

      {/* Footer / CTA */}
      <footer className="py-24 border-t border-[#222] bg-[#050505] text-center px-6">
         <h2 className="text-3xl md:text-5xl font-serif mb-6">
           Ready to grow<br/>
           <span className="text-[#caff00]">your photography business?</span>
         </h2>
         <p className="text-neutral-400 mb-12 max-w-lg mx-auto">
           Book a free demo, start for free, or reach out directly. We'd love to show you what Candei can do for your shoots.
         </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-20">
           <a href="https://getcandei.com" target="_blank" rel="noopener noreferrer" className="border border-[#caff00]/30 bg-[#caff00]/5 text-[#caff00] px-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#caff00]/10 transition-colors">
             🌐 getcandei.com
           </a>
           <a href="mailto:info@getcandei.com" className="border border-[#ff4500]/30 bg-[#ff4500]/5 text-[#ff4500] px-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#ff4500]/10 transition-colors">
             ✉️ info@getcandei.com
           </a>
           <a href="tel:+919318465272" className="border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff] px-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#00f0ff]/10 transition-colors">
             📞 +91 9318 465 272
           </a>
           <a href="https://wa.me/919318465272" target="_blank" rel="noopener noreferrer" className="border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 px-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-colors shrink-0">
             <MessageCircle className="w-4 h-4"/> WhatsApp Us
           </a>
         </div>
         <div className="text-xs text-neutral-600 font-mono flex flex-col items-center gap-3">
            <span className="opacity-50">© 2026 Candei · Photography's Growth Engine · getcandei.com</span>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, border }: { icon: React.ReactNode, title: string, desc: string, border: string }) {
  return (
    <div className={`p-8 border border-[#222] bg-[#111] rounded-2xl hover:border-white/20 transition-colors border-t-2 ${border}`}>
      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function NicheCard({ title, subtitle, emoji, color, desc }: { title: string, subtitle: string, emoji: string, color: string, desc: string }) {
  return (
    <div className="p-8 border border-[#222] bg-[#161616] rounded-2xl flex flex-col justify-between h-full group hover:border-[#444] transition-colors">
       <div>
         <div className="text-3xl mb-4 opacity-80 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-500">{emoji}</div>
         <div className="text-[10px] uppercase tracking-wider font-mono mb-2" style={{color}}>{title}</div>
         <h3 className="text-2xl font-serif mb-4">{subtitle}</h3>
         <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

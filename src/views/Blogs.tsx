import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Blogs() {
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
            <BookOpen className="w-6 h-6 text-[#0D94FB]" />
            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight">Blogs</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl font-light">
            Insights, tutorials, and strategies to grow your photography business.
          </p>
        </motion.div>

        <div className="space-y-12">
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-[#333] bg-[#1a1a1a]/50 rounded-3xl p-8 hover:border-[#555] transition-colors"
          >
            <h2 className="text-2xl font-serif text-white mb-4">Google Ads Run Kaise Kare</h2>
            <div className="text-neutral-400 space-y-4 leading-relaxed font-light">
              <p>
                Google Ads ek bahut hi powerful tool hai apni photography services ko promote karne ke liye. Sabse pehle aapko Google Ads par ek account create karna hoga.
              </p>
              <p>
                Account ban banane ke baad, "New Campaign" par click karein. Apna goal select karein (jaise ki "Leads" ya "Website traffic"). Fir campaign type mein "Search" ya "Display" choose karein, jo aapke target audience ke hisaab se best ho.
              </p>
              <p>
                Uske baad apne campaign ki settings configure karein: budget set karein, location target karein (jahan aap apni services dete hain), aur relevant keywords add karein (jaise "wedding photographer near me", "event photography").
              </p>
              <p>
                Ant mein, apne ad ki copy aur creatives design karein. Dhyaan rakhein ki aapka ad copy attractive ho aur usme ek clear Call-to-Action (CTA) ho.
              </p>
            </div>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-[#333] bg-[#1a1a1a]/50 rounded-3xl p-8 hover:border-[#555] transition-colors"
          >
            <h2 className="text-2xl font-serif text-white mb-4">Google Ads Run Kiye Gaye Campaign Manage Kaise Kare</h2>
            <div className="text-neutral-400 space-y-4 leading-relaxed font-light">
              <p>
                Campaign run hone ke kuch din baad uski performance monitor karna bahut zaroori hai. Google Ads dashboard mein aapko impression, clicks, aur conversions jaise metrics milenge.
              </p>
              <p>
                1. <strong>Keyword Performance Check Karein:</strong> Dekhein ki kaun se keywords sabse zyada conversion la rahe hain. Jo keywords achha perform nahi kar rahe, unhe pause karein ya unka bid kam karein.
              </p>
              <p>
                2. <strong>Search Terms Report:</strong> Is report se aapko pata chalega ki log actually kya search kar ke aapke ads dekh rahe hain. Irrelevant searches ko "Negative Keywords" mein add karein taaki aapka budget waste na ho.
              </p>
              <p>
                3. <strong>Ad Copy A/B Testing:</strong> Ek se zyada ad variations banayein aur dekhein ki kis headline ya description pe zyada log click kar rahe hain (Click-Through Rate / CTR).
              </p>
              <p>
                4. <strong>Budget Optimization:</strong> Jo campaigns accha Return on Ad Spend (ROAS) de rahe hain, unka budget increase karein aur underperforming campaigns ko optimize karein.
              </p>
            </div>
          </motion.article>
        </div>
      </main>
    </div>
  );
}

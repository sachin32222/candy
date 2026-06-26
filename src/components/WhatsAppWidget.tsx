import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppWidget() {
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/918130792674?text=${encodeURIComponent("Hi, I need support regarding Candei OS.")}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] transition-all flex items-center justify-center group"
      aria-label="Contact Support on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </motion.button>
  );
}

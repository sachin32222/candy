'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LandingComponent = dynamic(() => import('../src/views/Landing'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      Loading Candei...
    </div>
  ),
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        Loading Candei...
      </div>
    );
  }

  return <LandingComponent />;
}

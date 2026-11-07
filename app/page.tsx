'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const LandingView = dynamic(() => import('@/views/Landing'), {
  ssr: false,
  loading: () => <div className="min-h-screen w-full bg-[#09090b]" />
});

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex flex-col">
      <LandingView />
    </div>
  );
}

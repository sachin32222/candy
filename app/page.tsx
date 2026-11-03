'use client';

import dynamic from 'next/dynamic';

const Landing = dynamic(() => import('../src/views/Landing'), {
  ssr: false,
});

export default function Home() {
  return <Landing />;
}

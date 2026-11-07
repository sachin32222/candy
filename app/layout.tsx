import './globals.css';
import '../src/index.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candy — The Core System for Photographers',
  description:
    'Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.',
  openGraph: {
    title: 'Candy — The Core System for Photographers',
    description:
      'Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.',
    url: 'https://www.getcandei.com/',
    type: 'website',
    images: [{ url: 'https://www.getcandei.com/candei-logo-update.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Candy — The Core System for Photographers',
    description:
      'Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.',
    images: ['https://www.getcandei.com/candei-logo-update.jpg'],
  },
};

const vantaThreePatchScript = `
  if (typeof window !== 'undefined' && window.THREE) {
    if (window.THREE.ExtrudeGeometry) {
      var OrigExtrudeGeometry = window.THREE.ExtrudeGeometry;
      window.THREE.ExtrudeGeometry = function(shapes, options) {
        var safeOptions = Object.assign({}, options);
        if (!safeOptions.curveSegments || safeOptions.curveSegments <= 0) {
          safeOptions.curveSegments = 12;
        }
        return new OrigExtrudeGeometry(shapes, safeOptions);
      };
      window.THREE.ExtrudeGeometry.prototype = OrigExtrudeGeometry.prototype;
    }
    if (window.THREE.BufferGeometry && window.THREE.BufferGeometry.prototype) {
      var origComputeBoundingSphere = window.THREE.BufferGeometry.prototype.computeBoundingSphere;
      window.THREE.BufferGeometry.prototype.computeBoundingSphere = function() {
        var pos = this.attributes && this.attributes.position;
        if (pos && pos.array) {
          for (var i = 0; i < pos.array.length; i++) {
            if (Number.isNaN(pos.array[i])) {
              pos.array[i] = 0;
            }
          }
        }
        try {
          origComputeBoundingSphere.call(this);
          if (this.boundingSphere && Number.isNaN(this.boundingSphere.radius)) {
            this.boundingSphere.radius = 1;
          }
        } catch (e) {}
      };
    }
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#09090b', colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: vantaThreePatchScript }} />
        <script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js"></script>
      </head>
      <body className="min-h-screen w-full bg-[#09090b] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import "../src/index.css";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candy — The Core System for Photographers",
  description:
    "Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.",
  openGraph: {
    title: "Candy — The Core System for Photographers",
    description:
      "Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.",
    url: "https://www.getcandei.com/",
    type: "website",
    images: [{ url: "https://www.getcandei.com/candei-logo-update.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candy — The Core System for Photographers",
    description:
      "Candy helps photographers maximize every event. Instantly capture leads on the spot, create real-time engagement with guests, and deliver professional photos immediately. Seamlessly convert happy attendees into paying clients with automated follow-ups and a delightful guest experience.",
    images: ["https://www.getcandei.com/candei-logo-update.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#09090b] text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" async></script>
      </head>
      <body className="min-h-screen bg-[#09090b] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

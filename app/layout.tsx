import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f0f0f", color: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}

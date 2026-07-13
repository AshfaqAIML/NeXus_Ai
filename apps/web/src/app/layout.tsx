import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus AI - Multi-Model AI Platform',
  description: 'One Platform. Every AI Model. Smarter Context. Lower Cost.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f0f23] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}

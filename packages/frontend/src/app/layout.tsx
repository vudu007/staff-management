import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Staff Management System | Atreos Retail Platform',
  description: 'Comprehensive staff management platform for retail operations — manage staff, attendance, performance, and stores.',
  keywords: ['staff management', 'retail', 'attendance tracking', 'performance reviews'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gray-50/50">
        {children}
      </body>
    </html>
  );
}

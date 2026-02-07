import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Eraser - ERP Visual Designer',
  description: 'Real-time Entity Relationship Diagram Generator with DSL',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

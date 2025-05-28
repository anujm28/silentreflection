import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Encrypted Notes App',
  description: 'A secure way to store and manage your encrypted notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}

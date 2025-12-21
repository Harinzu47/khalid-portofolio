import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Khalid - Fullstack Developer & Data Scientist',
  description: 'Professional portfolio showcasing software engineering projects and data science solutions. Specializing in React, Laravel, Python, and Machine Learning.',
  keywords: ['Fullstack Developer', 'Data Scientist', 'React', 'Laravel', 'Python', 'Machine Learning', 'Next.js', 'TypeScript'],
  authors: [{ name: 'Khalid' }],
  openGraph: {
    title: 'Khalid - Fullstack Developer & Data Scientist',
    description: 'Crafting robust software and data-driven solutions',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

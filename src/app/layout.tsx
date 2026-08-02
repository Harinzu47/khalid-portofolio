import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'hzcode — Network & Infra Engineer → Fullstack Dev',
  description:
    'hzcode.my.id — Portfolio of Khalid Jundullah. Network & Infrastructure Engineer (MTCNA) transitioning into fullstack development. Covering Infrastructure, Networking, Web Dev, and AI.',
  keywords: [
    'hzcode',
    'Khalid Jundullah',
    'Network Engineer',
    'Infrastructure',
    'MikroTik',
    'MTCNA',
    'Docker',
    'Laravel',
    'Next.js',
    'FastAPI',
    'Fullstack Developer',
    'TypeScript',
  ],
  authors: [{ name: 'Khalid Jundullah', url: 'https://hzcode.my.id' }],
  openGraph: {
    title: 'hzcode — Network & Infra → Fullstack Dev',
    description:
      'Personal portfolio covering Infrastructure, Networking, Web Dev, and AI projects.',
    type: 'website',
    url: 'https://hzcode.my.id',
    siteName: 'hzcode',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hzcode — Network & Infra → Fullstack Dev',
    description: 'Personal portfolio of Khalid Jundullah (hzcode.my.id)',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-terminal-bg text-terminal-text-primary">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

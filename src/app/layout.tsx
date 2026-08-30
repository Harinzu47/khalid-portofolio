import type { Metadata } from 'next';
import { Geist, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { A11yAnnouncerProvider } from '@/components/ui/A11yAnnouncer';
import { ThemeProvider } from '@/lib/theme-context';
import { getPersonSchema } from '@/lib/json-ld';

const GlobalCommandPalette = dynamic(
  () => import('@/components/ui/GlobalCommandPalette').then((m) => m.GlobalCommandPalette)
);

const GlobalTerminalModal = dynamic(
  () => import('@/components/terminal/GlobalTerminalModal').then((m) => m.GlobalTerminalModal)
);

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

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
  title: 'HZCODE — Khalid Jundullah | Engineering Portfolio & Knowledge System',
  description:
    'HZCODE — Engineering Systems, Infrastructure & Developer Operating Systems by Khalid Jundullah.',
  keywords: [
    'hzcode',
    'Khalid Jundullah',
    'Systems Engineer',
    'Infrastructure',
    'Fullstack Developer',
    'TypeScript',
    'PostgreSQL',
    'Developer OS',
  ],
  authors: [{ name: 'Khalid Jundullah', url: 'https://hzcode.my.id' }],
  openGraph: {
    title: 'HZCODE — Khalid Jundullah',
    description: 'Engineering Systems, Infrastructure & Developer Operating Systems.',
    type: 'website',
    url: 'https://hzcode.my.id',
    siteName: 'HZCODE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HZCODE — Khalid Jundullah',
    description: 'Engineering Systems, Infrastructure & Developer Operating Systems.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-surface-main text-text-primary min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <A11yAnnouncerProvider>
            <SkipToContent />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonSchema()) }}
            />
            <Navbar />
            <div id="main-content" className="flex-grow">{children}</div>
            <Footer />
            <GlobalCommandPalette />
            <GlobalTerminalModal />
          </A11yAnnouncerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

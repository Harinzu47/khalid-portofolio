import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
        <ThemeProvider>
          <A11yAnnouncerProvider>
            <SkipToContent />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonSchema()) }}
            />
            <Navbar />
            <div id="main-content">{children}</div>
            <Footer />
            <GlobalCommandPalette />
            <GlobalTerminalModal />
          </A11yAnnouncerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

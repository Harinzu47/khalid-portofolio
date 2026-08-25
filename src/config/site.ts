/**
 * Central Site & Platform Configuration
 */

export const siteConfig = {
  name: 'Personal Developer OS',
  shortName: 'hzcode',
  author: 'Khalid Jundullah',
  title: 'hzcode — Network & Infra Engineer → Fullstack Dev',
  description:
    'hzcode.my.id — Personal Developer OS of Khalid Jundullah. Covering Systems, Infrastructure, Web Engineering, and AI.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://hzcode.my.id',
  ogImage: '/images/og-default.png',
  links: {
    github: 'https://github.com/Harinzu47',
    linkedin: 'https://linkedin.com/in/khalid-jundullah',
    twitter: 'https://twitter.com',
  },
  nav: [
    { label: 'About', href: '/#about' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Journal', href: '/#journal' },
    { label: 'Career', href: '/#career' },
    { label: 'Contact', href: '/#contact' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

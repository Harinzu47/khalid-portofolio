import type { Metadata } from 'next';

export interface MetadataGeneratorOptions {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
  image?: string;
}

const SITE_CONFIG = {
  name: 'hzcode',
  url: 'https://hzcode.my.id',
  author: 'Khalid Jundullah',
  description: 'Personal Developer OS & Developer Knowledge Management System (DKMS)',
};

/**
 * Enterprise metadata generator helper for Next.js App Router
 */
export function generateContentMetadata(options: MetadataGeneratorOptions): Metadata {
  const fullTitle = `${options.title} | ${SITE_CONFIG.name}`;
  const canonicalUrl = `${SITE_CONFIG.url}${options.path}`;
  const ogImage = options.image || `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(options.title)}`;

  return {
    title: fullTitle,
    description: options.description,
    authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.url }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: options.description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
      type: options.type || 'website',
      ...(options.publishedTime && { publishedTime: options.publishedTime }),
      ...(options.tags && { tags: options.tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: options.description,
      images: [ogImage],
    },
  };
}

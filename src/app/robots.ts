import type { MetadataRoute } from 'next';

const BASE_URL = 'https://hzcode.my.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

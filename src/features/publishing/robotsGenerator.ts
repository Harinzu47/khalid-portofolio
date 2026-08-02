import { siteConfig } from './config';

/**
 * Enterprise Robots.txt Generator
 */
export class RobotsGenerator {
  public static generateTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteConfig.siteUrl}/sitemap.xml
`;
  }
}

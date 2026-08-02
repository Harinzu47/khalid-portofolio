import { siteConfig } from './config';

/**
 * Enterprise Web App Manifest Generator
 */
export class ManifestGenerator {
  public static generateJson(): Record<string, unknown> {
    return {
      name: siteConfig.siteName,
      short_name: 'hzcode',
      description: siteConfig.defaultDescription,
      start_url: '/',
      display: 'standalone',
      background_color: '#0d1117',
      theme_color: '#0d1117',
      icons: [
        {
          src: '/favicon.ico',
          sizes: 'any',
          type: 'image/x-icon',
        },
      ],
    };
  }
}

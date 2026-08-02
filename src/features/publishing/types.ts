export interface SitePublishingConfig {
  siteName: string;
  siteUrl: string;
  authorName: string;
  authorEmail: string;
  authorJobTitle: string;
  twitterHandle: string;
  githubUrl: string;
  linkedinUrl: string;
  defaultDescription: string;
  defaultOgImage: string;
}

export interface FeedItem {
  title: string;
  description: string;
  url: string;
  guid: string;
  date: string;
  author: string;
  category?: string;
}

export interface BreadcrumbJsonLdItem {
  name: string;
  item: string;
}

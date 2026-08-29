export type SearchMode =
  | 'GLOBAL'
  | 'KNOWLEDGE'
  | 'WORK'
  | 'ENTITY_PICKER'
  | 'RELATIONSHIP_PICKER'
  | 'COMMAND';

export type SearchScope = 'PUBLIC' | 'OWNER';

export type SearchSort =
  | 'RELEVANCE'
  | 'NEWEST'
  | 'OLDEST'
  | 'RECENTLY_UPDATED'
  | 'TITLE';

export const SEARCH_PROJECTION_VERSION = 1;

export const KNOWN_TECHNICAL_TOKENS: readonly string[] = [
  'c++',
  'c#',
  '.net',
  'next.js',
  'node.js',
  'vue.js',
  'react.js',
  'ci/cd',
  'postgresql',
  'postgres',
  'rls',
  'oauth',
  'typescript',
  'javascript',
  'graphql',
  'rest',
  'docker',
  'kubernetes',
  'tailwindcss',
  'drizzle',
  'supabase',
  'redis',
  'nginx',
  'caddy',
  'vitest',
  'jest',
  'linux',
  'aws',
  'gcp',
] as const;

export const SEARCH_FIELD_WEIGHTS = {
  TITLE: 'A',
  TAXONOMY: 'B',
  SUMMARY: 'B',
  TAGS: 'C',
  BODY: 'C',
} as const;

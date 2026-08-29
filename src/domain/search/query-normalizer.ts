import { KNOWN_TECHNICAL_TOKENS } from './search-types';

/**
 * Normalizes text to lowercase and strips extraneous whitespace while preserving symbols for tech tokens.
 */
export function normalizeRawQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

/**
 * Checks if a token matches a recognized technical token (e.g. "c++", "next.js", "ci/cd").
 */
export function isKnownTechnicalToken(token: string): boolean {
  const clean = token.toLowerCase().trim();
  return KNOWN_TECHNICAL_TOKENS.includes(clean);
}

/**
 * Extracts and normalizes technical terms from an entity's title, taxonomy, and content.
 * These are stored in `search_documents.exact_terms` to ensure 100% precision for technical searches.
 */
export function extractExactTerms(
  title: string,
  summary?: string | null,
  taxonomy?: {
    technologies?: string[];
    skills?: string[];
    domains?: string[];
    tags?: string[];
  }
): string[] {
  const termsSet = new Set<string>();

  // 1. Add explicitly linked taxonomy names
  if (taxonomy) {
    for (const tech of taxonomy.technologies || []) {
      const clean = tech.toLowerCase().trim();
      if (clean) termsSet.add(clean);
    }
    for (const skill of taxonomy.skills || []) {
      const clean = skill.toLowerCase().trim();
      if (clean) termsSet.add(clean);
    }
    for (const domain of taxonomy.domains || []) {
      const clean = domain.toLowerCase().trim();
      if (clean) termsSet.add(clean);
    }
    for (const tag of taxonomy.tags || []) {
      const clean = tag.toLowerCase().trim();
      if (clean) termsSet.add(clean);
    }
  }

  // 2. Scan title and summary for known technical tokens
  const textToScan = `${title} ${summary || ''}`.toLowerCase();
  for (const token of KNOWN_TECHNICAL_TOKENS) {
    // Regex for word boundary or symbol boundary
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[^a-z0-9])${escaped}($|\\s|[^a-z0-9])`, 'i');
    if (regex.test(textToScan)) {
      termsSet.add(token);
    }
  }

  return Array.from(termsSet);
}

/**
 * Formats a sanitized prefix tsquery string with 'simple' configuration semantics.
 * Example: "postgr rls" -> "postgr:* & rls:*"
 */
export function formatPrefixTsQuery(rawQuery: string): string | null {
  const cleaned = rawQuery
    .replace(/[^\w\s-]/g, '') // Keep alphanumerics, spaces, hyphens
    .trim();

  if (!cleaned) return null;

  const tokens = cleaned
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((t) => `${t}:*`);

  return tokens.length > 0 ? tokens.join(' & ') : null;
}

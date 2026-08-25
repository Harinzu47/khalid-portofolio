/**
 * Computes estimated reading time in minutes from markdown content.
 * Standard estimation uses 200 words per minute.
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  if (!content || !content.trim()) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Reading time calculation result
 */
export interface ReadingTimeResult {
  text: string;
  minutes: number;
  time: number; // in milliseconds
  words: number;
}

/**
 * Calculates reading time and word count for plain text / markdown content.
 * Standard average reading speed: 200 words per minute.
 */
export function calculateReadingTime(content: string, wpm = 200): ReadingTimeResult {
  // Clean markdown syntax for word count
  const cleanText = content
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/#+\s+/g, '')          // remove headings
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // replace links with link text
    .replace(/[*_~`]/g, '')         // remove emphasis
    .trim();

  const words = cleanText ? cleanText.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  const time = minutes * 60 * 1000;

  return {
    text: `~${minutes} min read`,
    minutes,
    time,
    words,
  };
}

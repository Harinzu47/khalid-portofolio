import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from '@/lib/reading-time';

describe('Reading Time Calculator', () => {
  it('calculates 1 min for short posts', () => {
    const text = 'This is a brief engineering announcement about server migration.';
    const minutes = calculateReadingTime(text);
    expect(minutes).toBe(1);
  });

  it('handles empty content gracefully', () => {
    const minutes = calculateReadingTime('');
    expect(minutes).toBe(1);
  });

  it('calculates multiple minutes for long technical content', () => {
    const words = new Array(500).fill('architecture').join(' ');
    const minutes = calculateReadingTime(words);
    expect(minutes).toBe(3); // 500 / 200 = 2.5 rounded up to 3
  });
});

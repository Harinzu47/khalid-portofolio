import { describe, it, expect } from 'vitest';
import { VIRTUAL_FS, NEOFETCH_ART } from '@/lib/terminal-cli';

describe('Terminal CLI Engine', () => {
  it('contains expected virtual root filesystem hierarchy', () => {
    expect(VIRTUAL_FS.type).toBe('dir');
    expect(VIRTUAL_FS.children).toBeDefined();
    expect(VIRTUAL_FS.children?.['about.txt']).toBeDefined();
    expect(VIRTUAL_FS.children?.['contact.json']).toBeDefined();
    expect(VIRTUAL_FS.children?.['projects']).toBeDefined();
    expect(VIRTUAL_FS.children?.['articles']).toBeDefined();
    expect(VIRTUAL_FS.children?.['journal']).toBeDefined();
    expect(VIRTUAL_FS.children?.['skills']).toBeDefined();
  });

  it('provides valid contact JSON string', () => {
    const contactNode = VIRTUAL_FS.children?.['contact.json'];
    expect(contactNode).toBeDefined();
    expect(contactNode?.content).toBeDefined();

    const parsed = JSON.parse(contactNode!.content!);
    expect(parsed.name).toBe('Khalid Jundullah');
    expect(parsed.website).toBe('https://hzcode.my.id');
  });

  it('renders ASCII neofetch banner containing operator identity', () => {
    expect(NEOFETCH_ART).toContain('khalid@hzcode-os');
    expect(NEOFETCH_ART).toContain('Personal Developer OS');
  });
});

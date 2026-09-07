import { describe, expect, it, vi } from 'vitest';
import { enqueueMermaidRender } from '../mermaid-render-queue';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('Mermaid render scheduling', () => {
  it('skips superseded previews while preserving the newest source and other diagrams', async () => {
    const gate = deferred();
    const started = deferred();
    const active = enqueueMermaidRender(() => true, async () => {
      started.resolve();
      await gate.promise;
      return 'active';
    });
    await started.promise;

    let generation = 1;
    const staleRender = vi.fn(async () => 'old source');
    const stale = enqueueMermaidRender(() => generation === 1, staleRender);
    const otherRender = vi.fn(async () => 'other diagram');
    const other = enqueueMermaidRender(() => true, otherRender);
    generation = 2;
    const latestRender = vi.fn(async () => 'latest source');
    const latest = enqueueMermaidRender(() => generation === 2, latestRender);

    expect(otherRender).not.toHaveBeenCalled();
    expect(latestRender).not.toHaveBeenCalled();
    gate.resolve();
    expect(await Promise.all([active, stale, other, latest])).toEqual([
      'active', undefined, 'other diagram', 'latest source',
    ]);
    expect(staleRender).not.toHaveBeenCalled();
    expect(otherRender).toHaveBeenCalledOnce();
    expect(latestRender).toHaveBeenCalledOnce();
  });

  it('does not render a preview invalidated before its turn', async () => {
    let mounted = true;
    const render = vi.fn(async () => 'svg');
    const job = enqueueMermaidRender(() => mounted, render);
    mounted = false;
    expect(await job).toBeUndefined();
    expect(render).not.toHaveBeenCalled();
  });

  it('continues rendering after a syntax error', async () => {
    const failed = enqueueMermaidRender(() => true, async () => {
      throw new Error('invalid syntax');
    });
    const recovered = enqueueMermaidRender(() => true, async () => 'valid svg');
    await expect(failed).rejects.toThrow('invalid syntax');
    await expect(recovered).resolves.toBe('valid svg');
  });
});

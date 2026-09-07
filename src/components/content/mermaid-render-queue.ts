// Keep work outside Mermaid's internal queue until it can start. This lets us
// skip superseded previews instead of rendering them and discarding their SVG.
let renderTail: Promise<unknown> = Promise.resolve();

export function enqueueMermaidRender<T>(
  isCurrent: () => boolean,
  render: () => Promise<T>,
): Promise<T | undefined> {
  const result = renderTail.then(() => (isCurrent() ? render() : undefined));
  // A malformed diagram must not block subsequent jobs.
  renderTail = result.catch(() => undefined);
  return result;
}

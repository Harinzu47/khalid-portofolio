import React from 'react';
import Image from 'next/image';

export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * ResponsiveImage component — handles images with caption and fallback styling
 */
export function ResponsiveImage({
  src,
  alt = '',
  caption,
  width = 1200,
  height = 675,
  className,
}: ResponsiveImageProps) {
  if (!src) return null;

  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  return (
    <figure className="my-8">
      <div className="border border-terminal-border rounded overflow-hidden bg-terminal-surface">
        {isExternal ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className={`w-full h-auto object-cover max-h-[500px] ${className || ''}`}
            loading="lazy"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={Number(width)}
            height={Number(height)}
            className={`w-full h-auto object-cover max-h-[500px] ${className || ''}`}
          />
        )}
      </div>
      {(caption || alt) && (
        <figcaption className="mt-2 text-center font-mono text-xs text-terminal-text-muted">
          // {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}

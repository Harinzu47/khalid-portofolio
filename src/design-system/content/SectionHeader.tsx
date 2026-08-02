import React from 'react';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';

export interface SectionHeaderProps {
  command: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Enterprise Section Header Component with CLI Command Prefix
 */
export function SectionHeader({ command, title, description, className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <p className="font-mono text-terminal-primary text-xs md:text-sm mb-2 select-none">
        $ {command}
      </p>
      <Heading variant="h1" className="border-b-0 pb-0 mb-3">
        {title}
      </Heading>
      {description && <Text variant="body" className="max-w-2xl">{description}</Text>}
    </div>
  );
}

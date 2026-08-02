import React from 'react';
import { defaultMdxComponents } from './components';

export interface MdxProviderProps {
  components?: Record<string, React.ComponentType<any>>;
  children: React.ReactNode;
}

/**
 * Enterprise MDX Component Provider
 * Provides unified component mapping across all content collections.
 */
export function getMergedMdxComponents(
  customComponents?: Record<string, React.ComponentType<any>>
) {
  return {
    ...defaultMdxComponents,
    ...customComponents,
  };
}

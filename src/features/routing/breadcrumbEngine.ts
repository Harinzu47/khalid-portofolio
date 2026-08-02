import { ContentNode } from '../knowledge/types';
import { BreadcrumbItem } from './types';
import { getRouteByContentType } from './routeRegistry';

/**
 * Enterprise Breadcrumb Generator Engine
 * Automatically constructs hierarchical breadcrumb navigation arrays
 */
export function generateBreadcrumbs(node?: ContentNode, customPath?: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  if (!node && !customPath) return breadcrumbs;

  if (node) {
    const parentRoute = getRouteByContentType(node.type, false);
    if (parentRoute) {
      breadcrumbs.push({
        label: parentRoute.navLabel || parentRoute.title.split('|')[0].trim(),
        href: parentRoute.path,
      });
    }

    // Process nested categories or slug paths for notes
    if (node.type === 'note' && node.slug.includes('/')) {
      const parts = node.slug.split('/');
      let currentPath = parentRoute?.path || '/notes';

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        currentPath += `/${part}`;
        breadcrumbs.push({
          label: part.charAt(0).toUpperCase() + part.slice(1),
          href: currentPath,
        });
      }
    }

    // Detail node title
    breadcrumbs.push({
      label: node.title,
      href: parentRoute ? `${parentRoute.path.replace('[slug]', node.slug).replace('[...slug]', node.slug)}` : `/${node.slug}`,
    });
  }

  return breadcrumbs;
}

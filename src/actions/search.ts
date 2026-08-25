'use server';

import { SearchService, SearchResultItem } from '@/services/search.service';

export async function globalSearchAction(query: string): Promise<SearchResultItem[]> {
  try {
    return await SearchService.search(query, 25);
  } catch (err) {
    console.error('Global search error:', err);
    return [];
  }
}

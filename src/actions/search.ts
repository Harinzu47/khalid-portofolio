'use server';

import { requireOwnerSession } from '@/lib/auth';
import { SearchService, type SearchResultItem } from '@/services/search.service';
import {
  OwnerGlobalSearchSchema,
  CommandPaletteSearchSchema,
  EntityPickerSearchSchema,
  type OwnerGlobalSearchInput,
  type CommandPaletteSearchInput,
  type EntityPickerSearchInput,
} from '@/validations/search';
import type {
  SearchResultDTO,
  SearchResultItemDTO,
  CommandPaletteItemDTO,
  SearchReindexResultDTO,
  SearchHealthDTO,
} from '@/types/dtos/search.dto';
import type { ActionResult } from '@/lib/action-result';

/**
 * Owner Global Search Server Action (CMD+K / Admin Operations)
 */
export async function ownerGlobalSearchAction(
  rawInput: OwnerGlobalSearchInput
): Promise<ActionResult<SearchResultDTO>> {
  const session = await requireOwnerSession();
  const parsed = OwnerGlobalSearchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid search parameters',
    };
  }

  try {
    const result = await SearchService.global(session.userId, parsed.data);
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error('Owner global search error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to execute global search',
    };
  }
}

/**
 * Command Palette Search Server Action (Amendment 29)
 */
export async function commandPaletteSearchAction(
  rawInput: CommandPaletteSearchInput
): Promise<ActionResult<CommandPaletteItemDTO[]>> {
  const session = await requireOwnerSession();
  const parsed = CommandPaletteSearchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid query parameters',
    };
  }

  try {
    const items = await SearchService.commandPalette(session.userId, parsed.data);
    return {
      success: true,
      data: items,
    };
  } catch (err: any) {
    console.error('Command palette error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to search command palette',
    };
  }
}

/**
 * Entity Picker Search Server Action (Amendment 26)
 */
export async function entityPickerSearchAction(
  rawInput: EntityPickerSearchInput
): Promise<ActionResult<SearchResultItemDTO[]>> {
  const session = await requireOwnerSession();
  const parsed = EntityPickerSearchSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid entity picker parameters',
    };
  }

  try {
    const items = await SearchService.entityPicker(session.userId, parsed.data);
    return {
      success: true,
      data: items,
    };
  } catch (err: any) {
    console.error('Entity picker error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to search entity candidates',
    };
  }
}

/**
 * Reindex Corpus Server Action (Amendment 22, 23)
 * Note: ownerId is injected strictly from requireOwnerSession().
 */
export async function reindexSearchCorpusAction(): Promise<ActionResult<SearchReindexResultDTO>> {
  const session = await requireOwnerSession();

  try {
    const result = await SearchService.reindexCorpus(session.userId);
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error('Corpus reindex error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to reindex search corpus',
    };
  }
}

/**
 * Get Search Health Diagnostics Server Action (Amendment 19)
 */
export async function getSearchHealthAction(): Promise<ActionResult<SearchHealthDTO>> {
  const session = await requireOwnerSession();

  try {
    const health = await SearchService.getSearchHealth(session.userId);
    return {
      success: true,
      data: health,
    };
  } catch (err: any) {
    console.error('Search health diagnostics error:', err);
    return {
      success: false,
      error: err?.message || 'Failed to retrieve search health diagnostics',
    };
  }
}

/**
 * Legacy backwards-compatible search action
 */
export async function globalSearchAction(query: string): Promise<SearchResultItem[]> {
  try {
    return await SearchService.search(query, 25);
  } catch (err) {
    console.error('Global search error:', err);
    return [];
  }
}

import { PublicSearchService } from './public-search.service';
import { OwnerSearchService } from './owner-search.service';
import { SearchSyncService } from './search-sync.service';
import { SearchOperationsService } from './search-operations.service';
import { SearchRepositoryService } from './search-repository.service';

export * from './public-search.service';
export * from './owner-search.service';
export * from './search-sync.service';
export * from './search-operations.service';
export * from './search-repository.service';

export interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  href: string;
}

/**
 * Unified Search Service Facade — HZCODE Personal Developer OS
 */
export class SearchService {
  static searchKnowledge = PublicSearchService.searchKnowledge;
  static searchWork = PublicSearchService.searchWork;
  static global = OwnerSearchService.global;
  static commandPalette = OwnerSearchService.commandPalette;
  static entityPicker = OwnerSearchService.entityPicker;
  static relationshipTargets = OwnerSearchService.relationshipTargets;
  static syncArticle = SearchSyncService.syncArticle;
  static syncNote = SearchSyncService.syncNote;
  static syncAdr = SearchSyncService.syncAdr;
  static syncJournal = SearchSyncService.syncJournal;
  static syncProject = SearchSyncService.syncProject;
  static syncCaseStudy = SearchSyncService.syncCaseStudy;
  static syncExperience = SearchSyncService.syncExperience;
  static syncLearningPath = SearchSyncService.syncLearningPath;
  static syncRoadmapItem = SearchSyncService.syncRoadmapItem;
  static syncCertificate = SearchSyncService.syncCertificate;
  static syncSkill = SearchSyncService.syncSkill;
  static syncDomain = SearchSyncService.syncDomain;
  static syncTechnology = SearchSyncService.syncTechnology;
  static syncMedia = SearchSyncService.syncMedia;
  static syncNowEntry = SearchSyncService.syncNowEntry;
  static removeEntity = SearchSyncService.removeEntity;
  static reindexCorpus = SearchOperationsService.reindexCorpus;
  static getSearchHealth = SearchOperationsService.getSearchHealth;
  static searchCandidates = SearchRepositoryService.searchCandidates;
  static upsertDocument = SearchRepositoryService.upsertDocument;
  static deleteDocument = SearchRepositoryService.deleteDocument;


  /**
   * Backwards-compatible search method for legacy callers.
   */
  static async search(query: string, limit = 20): Promise<SearchResultItem[]> {
    const knowledgeResult = await PublicSearchService.searchKnowledge({
      q: query,
      page: 1,
      pageSize: limit,
      sort: 'RELEVANCE',
    });
    return knowledgeResult.items.map((item) => ({
      id: item.entity.id,
      category: item.entity.type.toLowerCase(),
      title: item.entity.title,
      description: item.description,
      href: item.url || '#',
    }));
  }
}

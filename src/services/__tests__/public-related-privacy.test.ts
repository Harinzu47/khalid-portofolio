import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db/client';
import { PublicReadModelsService } from '../public-read-models.service';
import { MediaDeliveryService } from '../media-delivery.service';

vi.mock('@/db/client', () => ({ db: { query: {
  projects: { findMany: vi.fn(), findFirst: vi.fn() },
  notes: { findFirst: vi.fn() },
  knowledgeRelationships: { findMany: vi.fn(async () => []) },
} } }));
vi.mock('../media-delivery.service', () => ({ MediaDeliveryService: {
  resolvePublicDeliveryUrl: vi.fn(async (path: string) => `https://assets.example/${path}`),
} }));

const records = [
  { name: 'Visible', slug: 'visible', visibility: 'public', archivedAt: null },
  { name: 'Secret', slug: 'secret', visibility: 'private', archivedAt: null },
  { name: 'Hidden', slug: 'hidden', visibility: 'unlisted', archivedAt: null },
  { name: 'Retired', slug: 'retired', visibility: 'public', archivedAt: new Date() },
];

function fixture() {
  return {
    id: 'project', title: 'Published project', slug: 'published', visibility: 'public',
    publicationStatus: 'published', publishedAt: new Date(), archivedAt: null,
    caseStudy: null,
    domains: records.map((domain) => ({ domain })),
    technologies: records.map((technology) => ({ technology })),
    skills: records.map((skill) => ({ skill })),
    tags: records.map((tag) => ({ tag })),
    media: [records[1], records[3], records[0]].map((record) => ({
      media: { ...record, path: `${record.slug}.png` }, isCover: true, sortOrder: 0,
    })),
  };
}

describe('Related record privacy in public responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.query.projects.findMany).mockResolvedValue([fixture()] as never);
    vi.mocked(db.query.projects.findFirst).mockResolvedValue(fixture() as never);
    vi.mocked(db.query.notes.findFirst).mockResolvedValue(fixture() as never);
  });

  it('excludes private, unlisted and archived taxonomy from work listings', async () => {
    const [item] = await PublicReadModelsService.getWorkIndex();
    for (const refs of [item.domains, item.technologies, item.skills]) {
      expect(refs.map((ref) => ref.slug)).toEqual(['visible']);
    }
    expect(item.thumbnailUrl).toBe('https://assets.example/visible.png');
    expect(MediaDeliveryService.resolvePublicDeliveryUrl).toHaveBeenCalledTimes(1);
  });

  it('does not reveal private associations through the pillar filter', async () => {
    expect(await PublicReadModelsService.getWorkIndex({ pillar: 'secret' })).toEqual([]);
    expect(await PublicReadModelsService.getWorkIndex({ pillar: 'visible' })).toHaveLength(1);
  });

  it.each(['public', 'unlisted'])('filters taxonomy and media from %s project details', async (visibility) => {
    vi.mocked(db.query.projects.findFirst).mockResolvedValue({ ...fixture(), visibility } as never);
    const item = await PublicReadModelsService.getProjectDetailBySlug('published');
    expect(item).not.toBeNull();
    for (const refs of [item!.domains, item!.technologies, item!.skills, item!.tags]) {
      expect(refs.map((ref) => ref.slug)).toEqual(['visible']);
    }
    expect(item!.media.map((media) => media.url)).toEqual(['https://assets.example/visible.png']);
    expect(MediaDeliveryService.resolvePublicDeliveryUrl).toHaveBeenCalledTimes(1);
  });

  it('uses the same taxonomy privacy rules on note detail responses', async () => {
    const item = await PublicReadModelsService.getNoteBySlug('published');
    for (const refs of [item!.domains, item!.technologies, item!.skills, item!.tags]) {
      expect(refs.map((ref) => ref.slug)).toEqual(['visible']);
    }
  });

  it('returns no thumbnail or media when every linked asset is private', async () => {
    const row = { ...fixture(), media: [{ media: { ...records[1], path: 'secret.png' } }] };
    vi.mocked(db.query.projects.findMany).mockResolvedValue([row] as never);
    vi.mocked(db.query.projects.findFirst).mockResolvedValue(row as never);
    expect((await PublicReadModelsService.getWorkIndex())[0].thumbnailUrl).toBeNull();
    expect((await PublicReadModelsService.getProjectDetailBySlug('published'))!.media).toEqual([]);
    expect(MediaDeliveryService.resolvePublicDeliveryUrl).not.toHaveBeenCalled();
  });
});

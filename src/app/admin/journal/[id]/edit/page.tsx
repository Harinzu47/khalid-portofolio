import { requireOwnerSession } from '@/lib/auth';
import { JournalService } from '@/services/journal.service';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { JournalForm } from '../../JournalForm';
import { EntityConnectionsPanel } from '@/components/admin/relationships/EntityConnectionsPanel';
import { PublicationPanel } from '@/components/admin/publishing/PublicationPanel';
import { notFound } from 'next/navigation';

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  let entry;
  try {
    entry = await JournalService.getJournalEditorById(session.userId, id);
  } catch {
    notFound();
  }

  const [projectsList, domainsList, skillsList, techList, tagsList] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
    TaxonomyService.getTagsSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Journal Log
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update logs, visibility privacy levels, and extract to knowledge artifacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <JournalForm
            mode="edit"
            journalId={id}
            initialData={entry}
            availableProjects={projectsList}
            availableDomains={domainsList}
            availableSkills={skillsList}
            availableTechnologies={techList}
            availableTags={tagsList}
          />
        </div>

        <div className="space-y-6">
          {/* Editorial Lifecycle & Publishing Control */}
          <PublicationPanel
            entityType="JOURNAL_ENTRY"
            entityId={id}
            entityTitle={entry.title || 'Journal Entry'}
            initialVisibility={(entry.visibility || 'private') as any}
            initialPublicationStatus={(entry.publicationStatus || 'draft') as any}
            initialPublishedAt={entry.publishedAt ? new Date(entry.publishedAt).toISOString() : null}
            initialScheduledPublishAt={entry.scheduledPublishAt ? new Date(entry.scheduledPublishAt).toISOString() : null}
            initialArchivedAt={entry.archivedAt ? new Date(entry.archivedAt).toISOString() : null}
          />

          {/* Semantic Knowledge Graph Connections */}
          <EntityConnectionsPanel
            entityType="JOURNAL_ENTRY"
            entityId={id}
            entityTitle={entry.title || 'Journal Entry'}
          />
        </div>
      </div>
    </div>
  );
}

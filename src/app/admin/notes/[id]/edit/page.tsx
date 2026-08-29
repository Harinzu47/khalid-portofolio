import { requireOwnerSession } from '@/lib/auth';
import { TechNoteService } from '@/services/notes.service';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { NoteForm } from '../../NoteForm';
import { EntityConnectionsPanel } from '@/components/admin/relationships/EntityConnectionsPanel';
import { PublicationPanel } from '@/components/admin/publishing/PublicationPanel';
import { notFound } from 'next/navigation';

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  let note;
  try {
    note = await TechNoteService.getTechNoteEditorById(session.userId, id);
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
          Edit Tech Note
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update technical reference, verification quality, and taxonomies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <NoteForm
            mode="edit"
            noteId={id}
            initialData={note}
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
            entityType="TECH_NOTE"
            entityId={id}
            entityTitle={note.title}
            initialVisibility={(note.visibility || 'private') as any}
            initialPublicationStatus={(note.publicationStatus || 'draft') as any}
            initialPublishedAt={note.publishedAt ? new Date(note.publishedAt).toISOString() : null}
            initialScheduledPublishAt={note.scheduledPublishAt ? new Date(note.scheduledPublishAt).toISOString() : null}
            initialArchivedAt={note.archivedAt ? new Date(note.archivedAt).toISOString() : null}
          />

          {/* Semantic Knowledge Graph Connections */}
          <EntityConnectionsPanel
            entityType="TECH_NOTE"
            entityId={id}
            entityTitle={note.title}
          />
        </div>
      </div>
    </div>
  );
}

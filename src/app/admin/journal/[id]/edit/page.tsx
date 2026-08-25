import { JournalService } from '@/services/journal.service';
import { JournalForm } from '../../JournalForm';
import { notFound } from 'next/navigation';

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let entry;
  try {
    entry = await JournalService.getAdminJournalEntryById(id);
  } catch {
    notFound();
  }

  const taxonomy = await JournalService.getTaxonomyOptions();

  const initialData = {
    title: entry.title,
    slug: entry.slug,
    entryDate: entry.entryDate,
    content: entry.content,
    summary: entry.summary,
    status: entry.status as 'draft' | 'review' | 'published' | 'archived',
    visibility: entry.visibility as 'private' | 'unlisted' | 'public',
    reflection: entry.reflection,
    published: entry.publishedAt !== null,
    tagNames: entry.tags.map((jt) => jt.tag.name),
    projectIds: entry.projects.map((jp) => jp.projectId),
    technologyIds: entry.technologies.map((jt) => jt.technologyId),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Journal Log
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update logs, visibility privacy levels, and linked entities.
        </p>
      </div>

      <JournalForm
        mode="edit"
        journalId={id}
        initialData={initialData}
        availableProjects={taxonomy.projects}
        availableTechnologies={taxonomy.technologies}
      />
    </div>
  );
}

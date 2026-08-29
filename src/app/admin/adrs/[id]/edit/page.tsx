import { requireOwnerSession } from '@/lib/auth';
import { ProjectsService } from '@/services/projects.service';
import { ADRService } from '@/services/adrs.service';
import { ADRForm } from '../../ADRForm';
import { EntityConnectionsPanel } from '@/components/admin/relationships/EntityConnectionsPanel';
import { PublicationPanel } from '@/components/admin/publishing/PublicationPanel';
import { notFound } from 'next/navigation';

export default async function EditADRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  let adr;
  try {
    adr = await ADRService.getADREditorById(session.userId, id);
  } catch {
    notFound();
  }

  const [projectsList, adrsResult] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    ADRService.getAdminADRs(session.userId, { page: 1, pageSize: 100 }),
  ]);

  const adrsSelector = adrsResult.data.map((a: any) => ({
    id: a.id,
    name: `ADR-${String(a.number || 0).padStart(3, '0')}: ${a.title}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Architectural Decision Record
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update decision parameters, consequences, or record supersession.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ADRForm
            mode="edit"
            adrId={id}
            initialData={adr}
            availableProjects={projectsList}
            availableADRs={adrsSelector}
          />
        </div>

        <div className="space-y-6">
          {/* Editorial Lifecycle & Publishing Control */}
          <PublicationPanel
            entityType="ADR"
            entityId={id}
            entityTitle={adr.title}
            initialVisibility={(adr.visibility || 'private') as any}
            initialPublicationStatus={(adr.publicationStatus || 'draft') as any}
            initialPublishedAt={adr.publishedAt ? new Date(adr.publishedAt).toISOString() : null}
            initialScheduledPublishAt={adr.scheduledPublishAt ? new Date(adr.scheduledPublishAt).toISOString() : null}
            initialArchivedAt={adr.archivedAt ? new Date(adr.archivedAt).toISOString() : null}
          />

          {/* Semantic Knowledge Graph Connections */}
          <EntityConnectionsPanel
            entityType="ADR"
            entityId={id}
            entityTitle={adr.title}
          />
        </div>
      </div>
    </div>
  );
}

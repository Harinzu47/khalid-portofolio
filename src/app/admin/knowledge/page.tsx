import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { ArticlesService } from '@/services/articles.service';
import { JournalService } from '@/services/journal.service';
import { TechNoteService } from '@/services/notes.service';
import { ADRService } from '@/services/adrs.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FileText, BookOpen, StickyNote, Scale, Plus, ArrowRight, Sparkles } from 'lucide-react';
import type { KnowledgeListItemDTO } from '@/types/dtos';

export default async function AdminKnowledgeHubPage() {
  const session = await requireOwnerSession();

  const [articlesRes, journalRes, notesRes, adrsRes] = await Promise.all([
    ArticlesService.getAdminArticles(session.userId, { page: 1, pageSize: 5 }),
    JournalService.getAdminJournalEntries(session.userId, { page: 1, pageSize: 5 }),
    TechNoteService.getAdminTechNotes(session.userId, { page: 1, pageSize: 5 }),
    ADRService.getAdminADRs(session.userId, { page: 1, pageSize: 5 }),
  ]);

  const recentItems: KnowledgeListItemDTO[] = [
    ...articlesRes.data,
    ...journalRes.data,
    ...notesRes.data,
    ...adrsRes.data,
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);

  return (
    <div className="space-y-8 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-terminal-text-primary flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-terminal-primary" />
            <span>Knowledge Core Hub</span>
          </h1>
          <p className="text-xs text-terminal-text-secondary">
            Unified operational read-model across long-form essays, daily engineering logs, technical references, and architectural decisions.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Articles */}
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-secondary">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Articles</span>
            </div>
            <Link
              href="/admin/articles/new"
              className="p-1 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
              title="New Article"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-2xl font-bold text-terminal-text-primary">
            {articlesRes.meta.totalRecords}
          </div>
          <div className="flex items-center justify-between text-[11px] text-terminal-text-muted pt-1 border-t border-terminal-border">
            <span>Long-form essays</span>
            <Link href="/admin/articles" className="text-terminal-primary hover:underline flex items-center space-x-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2. Journal */}
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-secondary">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Journal</span>
            </div>
            <Link
              href="/admin/journal/new"
              className="p-1 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
              title="New Journal Log"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-2xl font-bold text-terminal-text-primary">
            {journalRes.meta.totalRecords}
          </div>
          <div className="flex items-center justify-between text-[11px] text-terminal-text-muted pt-1 border-t border-terminal-border">
            <span>Continuous logs</span>
            <Link href="/admin/journal" className="text-terminal-primary hover:underline flex items-center space-x-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 3. Tech Notes */}
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-secondary">
              <StickyNote className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Tech Notes</span>
            </div>
            <Link
              href="/admin/notes/new"
              className="p-1 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
              title="New Tech Note"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-2xl font-bold text-terminal-text-primary">
            {notesRes.meta.totalRecords}
          </div>
          <div className="flex items-center justify-between text-[11px] text-terminal-text-muted pt-1 border-t border-terminal-border">
            <span>Technical recipes</span>
            <Link href="/admin/notes" className="text-terminal-primary hover:underline flex items-center space-x-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. ADRs */}
        <div className="p-5 rounded-lg border border-terminal-border bg-terminal-surface space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-terminal-secondary">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">ADRs</span>
            </div>
            <Link
              href="/admin/adrs/new"
              className="p-1 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
              title="New ADR"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-2xl font-bold text-terminal-text-primary">
            {adrsRes.meta.totalRecords}
          </div>
          <div className="flex items-center justify-between text-[11px] text-terminal-text-muted pt-1 border-t border-terminal-border">
            <span>Architecture records</span>
            <Link href="/admin/adrs" className="text-terminal-primary hover:underline flex items-center space-x-0.5">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Knowledge Activity */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider">
          Recent Knowledge Activity (Across All Artifacts)
        </h2>

        {recentItems.length === 0 ? (
          <p className="text-xs text-terminal-text-muted">No knowledge items recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Publication</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentItems.map((item) => (
                <TableRow key={`${item.entityType}-${item.id}`}>
                  <TableCell>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border uppercase text-terminal-text-muted">
                      {item.entityType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={
                        item.entityType === 'article'
                          ? `/admin/articles/${item.id}/edit`
                          : item.entityType === 'journal'
                          ? `/admin/journal/${item.id}/edit`
                          : item.entityType === 'note'
                          ? `/admin/notes/${item.id}/edit`
                          : `/admin/adrs/${item.id}/edit`
                      }
                      className="font-semibold text-terminal-text-primary hover:text-terminal-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.publicationStatus === 'published'
                          ? 'primary'
                          : item.publicationStatus === 'review'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {item.publicationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] text-terminal-text-muted uppercase">
                      {item.visibility}
                    </span>
                  </TableCell>
                  <TableCell className="text-[11px] text-terminal-text-muted">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

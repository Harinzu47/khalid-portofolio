import Link from 'next/link';
import { CareerService } from '@/services/career.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteCareerButton } from './DeleteCareerButton';
import { Plus, Edit, Briefcase, Building2, MapPin } from 'lucide-react';

export default async function AdminCareerPage() {
  const result = await CareerService.getAdminCareerExperiences({ page: 1, pageSize: 50 });
  const careerList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-terminal-primary" />
            <span>Career History & Roles</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage professional experience, organizations, tenure, and engineering leadership roles.
          </p>
        </div>

        <Link
          href="/admin/career/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Experience</span>
        </Link>
      </div>

      {/* Career Data Table */}
      {careerList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No career experiences found in the database.</p>
          <Link
            href="/admin/career/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Record your professional engineering history</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role & Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {careerList.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {exp.position}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-terminal-secondary">
                        <Building2 className="w-3 h-3" />
                        <span>{exp.organization.name}</span>
                      </span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{exp.location}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-secondary">
                  {exp.employmentType || 'Full-time'}
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-muted whitespace-nowrap">
                  <span>{exp.startDate}</span> →{' '}
                  <span>{exp.isCurrent ? 'Present' : exp.endDate || 'N/A'}</span>
                </TableCell>

                <TableCell>
                  {exp.isCurrent ? (
                    <Badge variant="primary">Current Role</Badge>
                  ) : (
                    <Badge variant="default">Completed</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/career/${exp.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Experience"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteCareerButton
                      experienceId={exp.id}
                      positionTitle={exp.position}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

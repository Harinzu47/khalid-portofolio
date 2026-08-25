import Link from 'next/link';
import { TaxonomyService } from '@/services/taxonomy.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteSkillButton } from './DeleteSkillButton';
import { Plus, Edit, Cpu } from 'lucide-react';

export default async function AdminSkillsPage() {
  const skillsList = await TaxonomyService.getSkills();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-terminal-secondary" />
            <span>Skills & Competencies</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage architectural skills, proficiency levels, and core engineering domains.
          </p>
        </div>

        <Link
          href="/admin/skills/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Skill</span>
        </Link>
      </div>

      {/* Skills Data Table */}
      {skillsList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No skills configured in the taxonomy.</p>
          <Link
            href="/admin/skills/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Register your technical skills</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill Name</TableHead>
              <TableHead>Category / Domain</TableHead>
              <TableHead>Proficiency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skillsList.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {skill.name}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted">
                      {skill.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{skill.category}</Badge>
                </TableCell>

                <TableCell>
                  {skill.proficiencyLevel ? (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`w-2 h-2 rounded-full ${
                            lvl <= (skill.proficiencyLevel || 0)
                              ? 'bg-terminal-secondary'
                              : 'bg-terminal-border'
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-mono text-terminal-text-muted ml-1.5">
                        {skill.proficiencyLevel}/5
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-terminal-text-muted">Unrated</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/skills/${skill.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Skill"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteSkillButton
                      skillId={skill.id}
                      skillName={skill.name}
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

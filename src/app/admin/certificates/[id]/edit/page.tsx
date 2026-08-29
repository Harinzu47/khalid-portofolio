import { requireOwnerSession } from '@/lib/auth';
import { CertificatesService } from '@/services/certificates.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { CertificateForm } from '../../CertificateForm';

export const dynamic = 'force-dynamic';

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  const [cert, skills, domains, technologies] = await Promise.all([
    CertificatesService.getCertificateEditorById(session.userId, id),
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Edit Certificate</h1>
        <p className="text-xs text-slate-400 mt-1">
          Update credential verification details and syllabus coverage.
        </p>
      </div>

      <CertificateForm
        initialData={cert}
        skillOptions={skills}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}

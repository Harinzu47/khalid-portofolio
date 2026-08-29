import { requireOwnerSession } from '@/lib/auth';
import { TaxonomyService } from '@/services/taxonomy.service';
import { CertificateForm } from '../CertificateForm';

export const dynamic = 'force-dynamic';

export default async function NewCertificatePage() {
  const session = await requireOwnerSession();

  const [skills, domains, technologies] = await Promise.all([
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Register Certificate</h1>
        <p className="text-xs text-slate-400 mt-1">
          Record verified examination credentials and link supporting skills & technologies.
        </p>
      </div>

      <CertificateForm
        skillOptions={skills}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}

import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin Console — Personal Developer OS',
  description: 'Master administrative workspace for Personal Developer OS.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth('/admin');

  return <AdminShell userEmail={session.email}>{children}</AdminShell>;
}

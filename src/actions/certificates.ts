'use server';

import { requireAuth } from '@/lib/auth';
import { CertificateFormSchema } from '@/validations/certificate';
import { CertificatesService } from '@/services/certificates.service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionResult } from './auth';

export async function createCertificateAction(rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth('/admin/certificates/new');

  const parsed = CertificateFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cert = await CertificatesService.createCertificate(parsed.data, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath('/certificates');
    revalidatePath('/');
    redirect(`/admin/certificates?created=${encodeURIComponent(cert.name)}`);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create certificate.',
    };
  }
}

export async function updateCertificateAction(id: string, rawInput: unknown): Promise<ActionResult> {
  const session = await requireAuth(`/admin/certificates/${id}/edit`);

  const parsed = CertificateFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please correct the validation errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await CertificatesService.updateCertificate(id, parsed.data, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath('/certificates');
    revalidatePath('/');
    redirect('/admin/certificates?updated=true');
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update certificate.',
    };
  }
}

export async function deleteCertificateAction(id: string): Promise<ActionResult> {
  const session = await requireAuth('/admin/certificates');

  try {
    await CertificatesService.deleteCertificate(id, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath('/certificates');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete certificate.',
    };
  }
}

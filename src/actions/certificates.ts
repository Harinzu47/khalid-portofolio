'use server';

import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { CertificatesService } from '@/services/certificates.service';
import {
  CertificateFormSchema,
  type CertificateFormInput,
} from '@/validations/certificate';
import type { ActionResult, CertificateEditorDTO } from '@/types/dtos';

export async function createCertificateAction(
  input: CertificateFormInput
): Promise<ActionResult<CertificateEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = CertificateFormSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await CertificatesService.createCertificate(session.userId, validated.data, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create certificate.',
    };
  }
}

export async function updateCertificateAction(
  id: string,
  input: Partial<CertificateFormInput>
): Promise<ActionResult<CertificateEditorDTO>> {
  const session = await requireOwnerSession();

  const validated = CertificateFormSchema.partial().safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input.',
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const data = await CertificatesService.updateCertificate(session.userId, id, validated.data, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath(`/admin/certificates/${id}/edit`);
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update certificate.',
    };
  }
}

export async function archiveCertificateAction(
  id: string
): Promise<ActionResult<void>> {
  const session = await requireOwnerSession();

  try {
    await CertificatesService.archiveCertificate(session.userId, id, session.userId);
    revalidatePath('/admin/certificates');
    revalidatePath('/admin/learning');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to archive certificate.',
    };
  }
}

/**
 * @deprecated Use archiveCertificateAction instead.
 */
export async function deleteCertificateAction(
  id: string
): Promise<ActionResult<void>> {
  return archiveCertificateAction(id);
}

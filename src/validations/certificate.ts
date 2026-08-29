import { z } from 'zod';

export const CertificateVerificationStatusEnum = z.enum([
  'unverified',
  'verified',
  'expired',
  'revoked',
]);

export const CertificateFormSchema = z
  .object({
    name: z.string().min(2, 'Certificate name must be at least 2 characters long').max(255),
    title: z.string().max(255).optional().nullable(),
    issuer: z.string().min(2, 'Issuer name must be at least 2 characters long').max(200),
    credentialId: z.string().max(200).optional().nullable().or(z.literal('')),
    credentialUrl: z
      .string()
      .url('Invalid credential URL')
      .optional()
      .nullable()
      .or(z.literal('')),
    issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issued date must be in YYYY-MM-DD format'),
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiration date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    certificateMediaId: z.string().uuid().optional().nullable().or(z.literal('')),
    description: z.string().optional().nullable(),
    verificationStatus: CertificateVerificationStatusEnum.default('unverified'),
    visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
    skillIds: z.array(z.string().uuid()).default([]),
    domainIds: z.array(z.string().uuid()).default([]),
    technologyIds: z.array(z.string().uuid()).default([]),
  })
  .refine(
    (data) => {
      if (data.expiresAt && data.issuedAt) {
        return data.expiresAt >= data.issuedAt;
      }
      return true;
    },
    {
      message: 'Expiration date must be after or equal to the issued date.',
      path: ['expiresAt'],
    }
  );

export type CertificateFormInput = z.input<typeof CertificateFormSchema>;
export type CertificateFormParsed = z.infer<typeof CertificateFormSchema>;

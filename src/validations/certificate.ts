import { z } from 'zod';

export const CertificateFormSchema = z
  .object({
    name: z.string().min(2, 'Certificate name must be at least 2 characters long').max(255),
    issuer: z.string().min(2, 'Issuer name must be at least 2 characters long').max(200),
    issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issued date must be in YYYY-MM-DD format'),
    expiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiration date must be in YYYY-MM-DD format')
      .optional()
      .nullable()
      .or(z.literal('')),
    credentialId: z.string().max(200).optional().or(z.literal('')),
    credentialUrl: z.string().url('Invalid credential URL').optional().or(z.literal('')),
    certificateMediaId: z.string().uuid().optional().nullable().or(z.literal('')),
    description: z.string().optional(),
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

export type CertificateFormInput = z.infer<typeof CertificateFormSchema>;

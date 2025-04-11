import { z } from 'zod';

// Base certificate validation schema
export const certificateBaseSchema = z.object({
  learnerId: z.string().uuid('ID học viên không hợp lệ'),
  courseId: z.string().uuid('ID khóa học không hợp lệ'),
  certificateUrl: z.string().url('URL chứng chỉ không hợp lệ'),
});

// Create certificate validation schema
export const createCertificateSchema = certificateBaseSchema;

// Update certificate validation schema
export const updateCertificateSchema = z.object({
  certificateUrl: z.string().url('URL chứng chỉ không hợp lệ'),
}).partial();

// Certificate ID parameter validation
export const certificateIdSchema = z.object({
  certificateId: z.string().uuid('ID chứng chỉ không hợp lệ'),
});

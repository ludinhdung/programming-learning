import { Certificate } from '@prisma/client';

export interface CreateCertificateDto {
  learnerId: string;
  courseId: string;
  certificateUrl: string;
}

export interface UpdateCertificateDto {
  certificateUrl?: string;
}

export type CertificateDto = Certificate;

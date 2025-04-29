import { z } from 'zod';

// Video data validation schema
export const videoDataSchema = z.object({
  url: z.string().url('URL video không hợp lệ').optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  duration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
}).refine(data => data.url || data.videoUrl, {
  message: "Either url or videoUrl must be provided",
  path: ["url"]
});

// Module video info validation schema
export const moduleVideoInfoSchema = z.object({
  videoUrl: z.string().url('URL video không hợp lệ'),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  videoDuration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
});

// Video lesson create validation schema
export const videoLessonCreateSchema = z.object({
  url: z.string().url('URL video không hợp lệ').optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  duration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
}).refine(data => data.url || data.videoUrl, {
  message: "Either url or videoUrl must be provided",
  path: ["url"]
});

// Video lesson update validation schema
export const videoLessonUpdateSchema = z.object({
  url: z.string().url('URL video không hợp lệ').optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  duration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
});
import { z } from 'zod';

// Topic validation schema
export const topicCreateSchema = z.object({
  name: z.string().min(1, 'Tên chủ đề không được để trống'),
  description: z.string().min(1, 'Mô tả chủ đề không được để trống'),
  thumbnail: z.string().min(1, 'URL thumbnail không được để trống'),
});

// Schema for updating topic
export const topicUpdateSchema = z.object({
  name: z.string().min(1, 'Tên chủ đề không được để trống').optional(),
  description: z.string().min(1, 'Mô tả chủ đề không được để trống').optional(),
  thumbnail: z.string().min(1, 'URL thumbnail không được để trống').optional(),
});

// Schema for topic with courses
export const topicWithCoursesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string().url('URL thumbnail không hợp lệ'),
  courses: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      price: z.number(),
      thumbnail: z.string().min(1, 'URL thumbnail không được để trống').optional(),
      instructor: z.object({
        userId: z.string(),
        user: z.object({
          firstName: z.string(),
          lastName: z.string(),
        }),
      }),
      _count: z.object({
        enrollments: z.number(),
      }),
    })
  ).optional(),
});

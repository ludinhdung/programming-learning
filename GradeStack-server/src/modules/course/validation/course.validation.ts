import { z } from 'zod';

// Base course validation schema
export const courseBaseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả khóa học phải có ít nhất 10 ký tự'),
  price: z.number().nonnegative('Giá khóa học không được âm'),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').nullable().optional(),
  isPublished: z.boolean().optional(),
});

// Define lesson schema
const lessonBaseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề bài học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả bài học phải có ít nhất 10 ký tự'),
  lessonType: z.enum(['VIDEO', 'CODING', 'FINAL_TEST'], {
    errorMap: () => ({ message: 'Loại bài học không hợp lệ' }),
  }),
  isPreview: z.boolean().optional().default(false),
  order: z.number().int().nonnegative().optional(),
  // Fields specific to lesson types
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').nullable().optional(),
  videoDuration: z.number().int().nonnegative().optional(),
  // For coding exercise fields
  exerciseContent: z.string().optional(),
  solution: z.string().optional(),
  // For final test fields
  questions: z.array(z.any()).optional(),
});

// Define module schema
const moduleBaseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề module phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả module phải có ít nhất 10 ký tự'),
  order: z.number().int().nonnegative().optional(),
  // Video information fields
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').nullable().optional(),
  videoDuration: z.number().int().nonnegative().optional(),
  // Nested lessons
  lessons: z.array(lessonBaseSchema).optional(),
});

// Create course validation schema
export const createCourseSchema = courseBaseSchema.extend({
  topicIds: z.array(z.string().uuid('ID topic không hợp lệ')).min(1, 'Khóa học phải có ít nhất một chủ đề'),
  modules: z.array(moduleBaseSchema).optional(),
});

// Update course validation schema
export const updateCourseSchema = courseBaseSchema.partial().extend({
  topicIds: z.array(z.string().uuid('ID topic không hợp lệ')).optional(),
  modules: z.array(moduleBaseSchema.partial()).optional(),
});

// Course ID parameter validation
export const courseIdSchema = z.object({
  courseId: z.string().uuid('ID khóa học không hợp lệ'),
});

// Publish/Unpublish course validation
export const publishCourseSchema = z.object({
  isPublished: z.boolean(),
});

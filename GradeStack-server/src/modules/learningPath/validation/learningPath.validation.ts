import { z } from 'zod';

// Base learning path validation schema
export const learningPathBaseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề lộ trình học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả lộ trình học phải có ít nhất 10 ký tự').optional(),
  thumbnail: z.string().url('URL thumbnail không hợp lệ').nullable().optional(),
  estimatedCompletionTime: z.number().int().positive('Thời gian dự kiến phải là số nguyên dương').nullable().optional(),
});

// Create learning path validation schema
export const createLearningPathSchema = learningPathBaseSchema.extend({
  courseIds: z.array(z.string().uuid('ID khóa học không hợp lệ')).min(1, 'Lộ trình học phải có ít nhất một khóa học'),
});

// Update learning path validation schema
export const updateLearningPathSchema = learningPathBaseSchema.partial().extend({
  courseIds: z.array(z.string().uuid('ID khóa học không hợp lệ')).optional(),
});

// Learning path ID parameter validation
export const learningPathIdSchema = z.object({
  learningPathId: z.string().uuid('ID lộ trình học không hợp lệ'),
});

// Learning path course order validation
export const learningPathCourseOrderSchema = z.object({
  courseId: z.string().uuid('ID khóa học không hợp lệ'),
  order: z.number().int().nonnegative('Thứ tự phải là số nguyên không âm'),
});

// Update learning path courses validation
export const updateLearningPathCoursesSchema = z.object({
  courses: z.array(learningPathCourseOrderSchema),
});

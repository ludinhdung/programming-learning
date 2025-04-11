import { z } from 'zod';
import { LessonType, SupportedLanguage } from '@prisma/client';

// Video data validation schema (tương tự như trong instructor.validation.ts)
export const videoDataSchema = z.object({
  url: z.string().url('URL video không hợp lệ').optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  duration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
}).refine(data => data.url || data.videoUrl, {
  message: "Either url or videoUrl must be provided",
  path: ["url"]
});

// Coding exercise data validation schema
export const codingDataSchema = z.object({
  language: z.enum(['PYTHON', 'C', 'JAVA'], {
    errorMap: () => ({ message: 'Ngôn ngữ lập trình không được hỗ trợ' })
  }),
  problem: z.string().min(1, 'Nội dung bài tập không được để trống'),
  solution: z.string().min(1, 'Lời giải không được để trống'),
  hint: z.string().optional(),
  codeSnippet: z.string().optional(),
});

// Answer validation schema
export const answerSchema = z.object({
  content: z.string().min(1, 'Nội dung câu trả lời không được để trống'),
  isCorrect: z.boolean(),
});

// Question validation schema
export const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  order: z.number().int().positive('Thứ tự phải là số dương').optional(),
  answers: z.array(answerSchema).min(2, 'Phải có ít nhất 2 câu trả lời'),
});

// Final test data validation schema
export const finalTestDataSchema = z.object({
  passingScore: z.number().int().min(1, 'Điểm đạt phải là số dương'),
  estimatedDuration: z.number().int().positive('Thời gian làm bài phải là số dương').optional(),
  questions: z.array(questionSchema).min(1, 'Phải có ít nhất 1 câu hỏi'),
});

// Base lesson validation schema
export const lessonBaseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài học không được để trống'),
  description: z.string().min(1, 'Mô tả bài học không được để trống'),
  duration: z.number().int().nonnegative('Thời lượng phải là số không âm').optional(),
  isPreview: z.boolean().optional(),
  order: z.number().int().positive('Thứ tự phải là số dương').optional(),
});

// Video lesson validation schema
export const videoLessonCreateSchema = z.object({
  lessonData: lessonBaseSchema.extend({
    lessonType: z.literal(LessonType.VIDEO),
  }),
  videoData: videoDataSchema,
});

// Coding exercise validation schema
export const codingExerciseCreateSchema = z.object({
  lessonData: lessonBaseSchema.extend({
    lessonType: z.literal(LessonType.CODING),
  }),
  codingData: codingDataSchema,
});

// Final test validation schema
export const finalTestCreateSchema = z.object({
  lessonData: lessonBaseSchema.extend({
    lessonType: z.literal(LessonType.FINAL_TEST),
  }),
  testData: finalTestDataSchema,
});

// Update lesson validation schema
export const lessonUpdateSchema = lessonBaseSchema.partial();

// Update video lesson validation schema
export const videoLessonUpdateSchema = z.object({
  lessonData: lessonUpdateSchema.optional(),
  videoData: videoDataSchema.partial().optional(),
});

// Update coding exercise validation schema
export const codingExerciseUpdateSchema = z.object({
  lessonData: lessonUpdateSchema.optional(),
  codingData: codingDataSchema.partial().optional(),
});

// Update final test validation schema
export const finalTestUpdateSchema = z.object({
  lessonData: lessonUpdateSchema.optional(),
  testData: finalTestDataSchema.partial().optional(),
});

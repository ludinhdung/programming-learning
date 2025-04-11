import { z } from 'zod';

// User validation schema for instructor creation
export const userCreateSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  firstName: z.string().min(1, 'Tên không được để trống'),
  lastName: z.string().min(1, 'Họ không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Instructor validation schema
export const instructorCreateSchema = z.object({
  organization: z.string().min(1, 'Tổ chức không được để trống'),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  socials: z.array(z.string().url('Đường dẫn mạng xã hội không hợp lệ')).optional(),
});

// Combined schema for instructor creation
export const createInstructorSchema = z.object({
  userData: userCreateSchema,
  instructorData: instructorCreateSchema,
});

// Schema for updating instructor profile
export const instructorUpdateSchema = z.object({
  organization: z.string().min(1, 'Tổ chức không được để trống').optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  socials: z.array(z.string().url('Đường dẫn mạng xã hội không hợp lệ')).optional(),
});

// Schema for updating instructor avatar
export const avatarUpdateSchema = z.object({
  avatarUrl: z.string().min(1, 'URL ảnh đại diện không được để trống'),
});

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

// Coding exercise data validation schema
export const codingDataSchema = z.object({
  language: z.enum(['PYTHON', 'C', 'JAVA'], {
    errorMap: () => ({ message: 'Ngôn ngữ lập trình không được hỗ trợ' }),
  }),
  problem: z.string().min(1, 'Nội dung bài tập không được để trống'),
  solution: z.string().min(1, 'Lời giải không được để trống'),
  hint: z.string().optional(),
  codeSnippet: z.string().optional(),
});

// Answer validation schema for final test
export const answerSchema = z.object({
  content: z.string().min(1, 'Nội dung câu trả lời không được để trống'),
  isCorrect: z.boolean(),
});

// Question validation schema for final test
export const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  answers: z.array(answerSchema).min(1, 'Phải có ít nhất một câu trả lời'),
}).refine((data) => data.answers.some(answer => answer.isCorrect), {
  message: 'Phải có ít nhất một câu trả lời đúng',
  path: ['answers'],
});

// Final test data validation schema
export const finalTestDataSchema = z.object({
  questions: z.array(questionSchema).min(1, 'Phải có ít nhất một câu hỏi'),
});

// Lesson validation schema
export const lessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài học không được để trống'),
  description: z.string().min(1, 'Mô tả bài học không được để trống'),
  lessonType: z.enum(['VIDEO', 'CODING', 'FINAL_TEST'], {
    errorMap: () => ({ message: 'Loại bài học không hợp lệ' }),
  }),
  duration: z.number().int().nonnegative('Thời lượng phải là số không âm').optional(),
  isPreview: z.boolean().optional(),
  order: z.number().int().positive('Thứ tự phải là số dương').optional(),
  videoData: videoDataSchema.optional(),
  codingData: codingDataSchema.optional(),
  finalTestData: finalTestDataSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.lessonType === 'VIDEO' && !data.videoData) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dữ liệu video là bắt buộc cho bài học dạng VIDEO',
      path: ['videoData'],
    });
  }
  if (data.lessonType === 'CODING' && !data.codingData) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dữ liệu bài tập lập trình là bắt buộc cho bài học dạng CODING',
      path: ['codingData'],
    });
  }
  if (data.lessonType === 'FINAL_TEST' && !data.finalTestData) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dữ liệu bài kiểm tra là bắt buộc cho bài học dạng FINAL_TEST',
      path: ['finalTestData'],
    });
  }
});

// Module validation schema
export const moduleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề module không được để trống'),
  description: z.string().min(1, 'Mô tả module không được để trống'),
  order: z.number().int().positive('Thứ tự phải là số dương').optional(),
  lessons: z.array(lessonSchema).optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional().nullable(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  videoDuration: z.number().int().positive('Thời lượng video phải là số dương').optional().nullable(),
});

// Course creation validation schema
export const courseCreateSchema = z.object({
  title: z.string().min(1, 'Tiêu đề khóa học không được để trống'),
  description: z.string().min(1, 'Mô tả khóa học không được để trống'),
  price: z.number().nonnegative('Giá khóa học không được âm').optional(),
  duration: z.number().int().nonnegative('Thời lượng khóa học phải là số không âm').optional(),
  isPublished: z.boolean().optional(),
  thumbnail: z.string().optional().nullable(),
  topicIds: z.array(z.string()).optional(),
  modules: z.array(moduleSchema).optional(),
});

// Workshop creation validation schema
export const workshopCreateSchema = z.object({
  title: z.string().min(1, 'Tiêu đề workshop không được để trống'),
  description: z.string().min(1, 'Mô tả workshop không được để trống'),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian lịch trình không hợp lệ',
  }),
  duration: z.number().int().positive('Thời lượng phải là số dương'),
  maxAttendees: z.number().int().positive('Số lượng người tham dự tối đa phải là số dương').optional(),
  price: z.number().nonnegative('Giá workshop không được âm').optional(),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  meetingUrl: z.string().url('URL cuộc họp không hợp lệ').optional(),
});

// Schema for updating video lessons
export const videoLessonUpdateSchema = z.object({
  url: z.string().url('URL video không hợp lệ').optional(),
  videoUrl: z.string().url('URL video không hợp lệ').optional(),
  thumbnailUrl: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
  duration: z.number().int().positive('Thời lượng video phải là số dương').optional(),
}).refine(data => data.url || data.videoUrl, {
  message: "Either url or videoUrl must be provided",
  path: ["url"]
});

// Schema for creating topics
export const topicCreateSchema = z.object({
  name: z.string().min(1, 'Tên chủ đề không được để trống'),
  description: z.string().min(1, 'Mô tả chủ đề không được để trống'),
  thumbnail: z.string().url('URL thumbnail không hợp lệ').optional(),
});

// Schema for updating topics
export const topicUpdateSchema = z.object({
  name: z.string().min(1, 'Tên chủ đề không được để trống').optional(),
  description: z.string().min(1, 'Mô tả chủ đề không được để trống').optional(),
  thumbnail: z.string().url('URL thumbnail không hợp lệ').optional().nullable(),
});

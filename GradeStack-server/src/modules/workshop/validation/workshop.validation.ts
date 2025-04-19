import { z } from 'zod';

/**
 * Schema cơ bản cho workshop
 */
export const workshopBaseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề workshop phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả workshop phải có ít nhất 10 ký tự'),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời gian lên lịch không hợp lệ, vui lòng sử dụng định dạng ISO',
  }),
  duration: z.number().int().positive('Thời lượng workshop phải là số nguyên dương (phút)'),
  type: z.enum(['FRONTEND', 'BACKEND'], {
    errorMap: () => ({ message: 'Loại workshop phải là FRONTEND hoặc BACKEND' }),
  }),
});

/**
 * Schema cho việc tạo workshop mới
 */
export const createWorkshopSchema = workshopBaseSchema;

/**
 * Schema cho việc cập nhật workshop
 */
export const updateWorkshopSchema = workshopBaseSchema.partial();

/**
 * Schema cho việc xác thực ID workshop
 */
export const workshopIdSchema = z.object({
  workshopId: z.string().uuid('ID workshop không hợp lệ'),
});

/**
 * Schema cho việc đăng ký tham gia workshop
 */
export const registerWorkshopSchema = z.object({
  workshopId: z.string().uuid('ID workshop không hợp lệ'),
});

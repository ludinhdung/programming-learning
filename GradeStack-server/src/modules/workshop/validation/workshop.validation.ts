import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../../../shared/middleware/error.middleware";

/**
 * Các schema validation cho các request của workshop
 */
const schemas = {
  createWorkshop: z.object({
    title: z.string({
      required_error: "Tiêu đề workshop là bắt buộc",
    }),
    description: z.string({
      required_error: "Mô tả workshop là bắt buộc",
    }),
    scheduledAt: z.string({
      required_error: "Thời gian workshop là bắt buộc",
    }).datetime({
      message: "Thời gian workshop phải theo định dạng ISO",
    }),
    duration: z.number({
      required_error: "Thời lượng là bắt buộc",
      invalid_type_error: "Thời lượng phải là số",
    }).int({
      message: "Thời lượng phải là số nguyên",
    }).min(1, {
      message: "Thời lượng phải lớn hơn hoặc bằng 1",
    }),
    instructorId: z.string({
      required_error: "ID instructor là bắt buộc",
    }).uuid({
      message: "ID instructor không hợp lệ",
    }),
  }),

  updateWorkshop: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    scheduledAt: z.string()
      .datetime({
        message: "Thời gian workshop phải theo định dạng ISO",
      })
      .optional(),
    duration: z.number({
      invalid_type_error: "Thời lượng phải là số",
    })
      .int({
        message: "Thời lượng phải là số nguyên",
      })
      .min(1, {
        message: "Thời lượng phải lớn hơn hoặc bằng 1",
      })
      .optional(),
    instructorId: z.string()
      .uuid({
        message: "ID instructor không hợp lệ",
      })
      .optional(),
  }),

  registerWorkshop: z.object({
    // Không yêu cầu userId trong body vì sẽ lấy từ req.user
    userId: z.string().uuid({
      message: "ID người dùng không hợp lệ",
    }).optional(),
  }).optional(),

  cancelWorkshopRegistration: z.object({
    // Không yêu cầu userId trong body vì sẽ lấy từ req.user
    userId: z.string().uuid({
      message: "ID người dùng không hợp lệ",
    }).optional(),
  }).optional(),
};

/**
 * Middleware validate request
 * @param schemaName - Tên schema cần validate
 * @returns Middleware function
 */
export const validateRequest = (schemaName: keyof typeof schemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new AppError(`Schema ${schemaName} không tồn tại`, 500));
    }

    try {
      const value = schema.parse(req.body);
      req.body = value;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((detail) => detail.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(new AppError("Lỗi validation không xác định", 400));
    }
  };
};

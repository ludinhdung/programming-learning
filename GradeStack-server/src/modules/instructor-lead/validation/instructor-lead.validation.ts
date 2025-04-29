import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../../../shared/middleware/error.middleware";

/**
 * Các schema validation cho các request của instructor lead
 */
const schemas = {
  /**
   * Schema validate cho login Instructor Lead
   */
  loginInstructorLead: z.object({
    email: z.string({
      required_error: "Email là bắt buộc",
    }).email({
      message: "Email không hợp lệ",
    }),
    password: z.string({
      required_error: "Mật khẩu là bắt buộc",
    }).min(6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),
  }),
  createInstructorLead: z.object({
    userData: z.object({
      email: z.string({
        required_error: "Email là bắt buộc",
      }).email({
        message: "Email không hợp lệ",
      }),
      password: z.string({
        required_error: "Mật khẩu là bắt buộc",
      }).min(6, {
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      }),
      firstName: z.string({
        required_error: "Tên là bắt buộc",
      }),
      lastName: z.string({
        required_error: "Họ là bắt buộc",
      }),
    }),
    instructorData: z.object({
      organization: z.string({
        required_error: "Tổ chức là bắt buộc",
      }),
      avatar: z.union([z.string().url({
        message: "Avatar phải là một URL hợp lệ",
      }), z.null(), z.literal("")]),
      bio: z.union([z.string(), z.null(), z.literal("")]),
      socials: z.array(z.string()).optional(),
    }),
  }),

  updateProfile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    organization: z.string().optional(),
    avatar: z.union([z.string().url({
      message: "Avatar phải là một URL hợp lệ",
    }), z.null(), z.literal("")]).optional(),
    bio: z.union([z.string(), z.null(), z.literal("")]).optional(),
    socials: z.array(z.string()).optional(),
  }),

  createTopic: z.object({
    name: z.string({
      required_error: "Tên topic là bắt buộc",
    }),
    thumbnail: z.union([z.string().url({
      message: "Thumbnail phải là một URL hợp lệ",
    }), z.null(), z.literal("")]).optional(),
    description: z.union([z.string(), z.null(), z.literal("")]).optional(),
    instructorUserId: z.union([z.string().uuid({
      message: "ID instructor không hợp lệ"
    }), z.null(), z.literal("")]).optional(),
  }),

  updateTopic: z.object({
    name: z.string().optional(),
    thumbnail: z.union([z.string().url({
      message: "Thumbnail phải là một URL hợp lệ",
    }), z.null(), z.literal("")]).optional(),
    description: z.union([z.string(), z.null(), z.literal("")]).optional(),
    instructorUserId: z.union([z.string().uuid({
      message: "ID instructor không hợp lệ"
    }), z.null(), z.literal("")]).optional(),
  }),

  createLearningPath: z.object({
    title: z.string({
      required_error: "Tiêu đề learning path là bắt buộc",
    }),
    description: z.union([z.string(), z.null(), z.literal("")]).optional(),
    thumbnail: z.union([z.string().url({
      message: "Thumbnail phải là một URL hợp lệ",
    }), z.null(), z.literal("")]).optional(),
    instructorUserId: z.union([z.string().uuid({
      message: "ID instructor không hợp lệ"
    }), z.null(), z.literal("")]).optional(),
    courses: z.array(
      z.object({
        courseId: z.string({
          required_error: "ID khóa học là bắt buộc"
        }).uuid({
          message: "ID khóa học không hợp lệ"
        }),
        order: z.number({
          required_error: "Thứ tự là bắt buộc",
          invalid_type_error: "Thứ tự phải là số",
        }).int({
          message: "Thứ tự phải là số nguyên",
        }).min(1, {
          message: "Thứ tự phải lớn hơn hoặc bằng 1",
        }),
      })
    ).optional(),
  }),

  updateLearningPath: z.object({
    title: z.string().optional(),
    description: z.union([z.string(), z.null(), z.literal("")]).optional(),
    thumbnail: z.union([z.string().url({
      message: "Thumbnail phải là một URL hợp lệ",
    }), z.null(), z.literal("")]).optional(),
    instructorUserId: z.union([z.string().uuid({
      message: "ID instructor không hợp lệ"
    }), z.null(), z.literal("")]).optional(),
    courses: z.array(
      z.object({
        courseId: z.string({
          required_error: "ID khóa học là bắt buộc"
        }).uuid({
          message: "ID khóa học không hợp lệ"
        }),
        order: z.number({
          required_error: "Thứ tự là bắt buộc",
          invalid_type_error: "Thứ tự phải là số",
        }).int({
          message: "Thứ tự phải là số nguyên",
        }).min(1, {
          message: "Thứ tự phải lớn hơn hoặc bằng 1",
        }),
      })
    ).optional(),
  }),

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
      offset: true,
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
      required_error: "ID instructor là bắt buộc"
    }).uuid({
      message: "ID instructor không hợp lệ"
    }),
  }),

  updateWorkshop: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    scheduledAt: z.string().datetime({
      message: "Thời gian workshop phải theo định dạng ISO",
      offset: true,
    }).optional(),
    duration: z.number({
      invalid_type_error: "Thời lượng phải là số",
    }).int({
      message: "Thời lượng phải là số nguyên",
    }).min(1, {
      message: "Thời lượng phải lớn hơn hoặc bằng 1",
    }).optional(),
    instructorId: z.string().uuid({
      message: "ID instructor không hợp lệ"
    }).optional(),
  }),

  rejectCourse: z.object({
    reason: z.string({
      required_error: "Lý do từ chối là bắt buộc",
    }),
  }),
};

/**
 * Middleware validate request
 * @param {keyof typeof schemas} schemaName - Tên schema cần validate
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Middleware function
 */
export const validateRequest = (schemaName: keyof typeof schemas): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new AppError(`Schema ${schemaName} không tồn tại`, 500));
    }

    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((detail) => detail.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(new AppError("Lỗi validation không xác định", 500));
    }
  };
};

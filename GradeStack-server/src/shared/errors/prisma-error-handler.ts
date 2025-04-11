import { Prisma } from '@prisma/client';
import { ApiError } from './api-error';

export class PrismaErrorHandler {
  static handle(error: any, entityName: string): never {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const field = (error.meta?.target as string[])?.join(', ') || 'unknown';
        throw ApiError.conflict(
          `${entityName} với ${field} này đã tồn tại trong hệ thống.`,
          'UNIQUE_CONSTRAINT_VIOLATION'
        );
      }
      
      // Handle foreign key constraint violations
      if (error.code === 'P2003') {
        const field = error.meta?.field_name || 'unknown';
        throw ApiError.badRequest(
          `Không thể thực hiện thao tác vì tham chiếu đến ${field} không tồn tại.`,
          'FOREIGN_KEY_CONSTRAINT_VIOLATION'
        );
      }
      
      // Handle record not found
      if (error.code === 'P2001' || error.code === 'P2018' || error.code === 'P2025') {
        throw ApiError.notFound(
          `Không tìm thấy ${entityName} với thông tin đã cung cấp.`,
          'RECORD_NOT_FOUND'
        );
      }
      
      // Handle required field constraint violations
      if (error.code === 'P2011') {
        const field = error.meta?.target || 'unknown';
        throw ApiError.badRequest(
          `Trường ${field} là bắt buộc cho ${entityName}.`,
          'REQUIRED_FIELD_MISSING'
        );
      }
    }
    
    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw ApiError.validationError(
        `Dữ liệu không hợp lệ cho ${entityName}: ${error.message}`,
        'VALIDATION_ERROR'
      );
    }
    
    // Handle other Prisma errors
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw ApiError.internalError(
        `Lỗi nghiêm trọng khi xử lý ${entityName}. Vui lòng liên hệ quản trị viên.`,
        'DATABASE_PANIC'
      );
    }
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw ApiError.internalError(
        `Lỗi khởi tạo cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.`,
        'DATABASE_INITIALIZATION_ERROR'
      );
    }
    
    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For any other errors
    throw ApiError.internalError(
      `Lỗi không xác định khi xử lý ${entityName}: ${error.message || 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}

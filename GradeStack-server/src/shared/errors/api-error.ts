export class ApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    
    // This is necessary for proper error handling in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  
  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(message, 400, code);
  }
  
  static unauthorized(message: string = 'Không được phép truy cập', code?: string): ApiError {
    return new ApiError(message, 401, code);
  }
  
  static forbidden(message: string = 'Truy cập bị từ chối', code?: string): ApiError {
    return new ApiError(message, 403, code);
  }
  
  static notFound(message: string = 'Không tìm thấy tài nguyên', code?: string): ApiError {
    return new ApiError(message, 404, code);
  }
  
  static conflict(message: string, code?: string): ApiError {
    return new ApiError(message, 409, code);
  }
  
  static validationError(message: string, code?: string): ApiError {
    return new ApiError(message, 422, code);
  }
  
  static internalError(message: string = 'Lỗi máy chủ nội bộ', code?: string): ApiError {
    return new ApiError(message, 500, code);
  }
}

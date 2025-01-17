export interface RegisterDTO {
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

// Thêm type cho blacklisted tokens
export interface BlacklistedToken {
  token: string;
  expiresAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDTO {
  email?: string;
}

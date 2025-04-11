// DTOs for Module module

// DTO for creating a module
export interface CreateModuleDto {
    title: string;
    description: string;
    order?: number;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
    videoDuration?: number | null;
}

// DTO for updating a module
export interface UpdateModuleDto {
    title?: string;
    description?: string;
    order?: number;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
    videoDuration?: number | null;
}

// DTO for module video information
export interface ModuleVideoDto {
    videoUrl: string;
    thumbnailUrl?: string | null;
    videoDuration?: number | null;
}

// DTO for module response
export interface ModuleResponseDto {
    id: string;
    title: string;
    description: string;
    order: number;
    courseId: string;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    videoDuration: number | null;
    createdAt: Date;
    updatedAt: Date;
}

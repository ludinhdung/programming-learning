import { z } from 'zod';

// Schema for creating a new module
export const createModuleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    order: z.number().optional(),
    videoUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    videoDuration: z.number().optional().nullable()
});

// Schema for updating a module
export const updateModuleSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    order: z.number().optional(),
    videoUrl: z.string().url().optional().nullable(),
    thumbnailUrl: z.string().url().optional().nullable(),
    videoDuration: z.number().optional().nullable()
});

// Schema for updating module video information
export const updateModuleVideoSchema = z.object({
    videoUrl: z.string().url("Video URL must be a valid URL"),
    thumbnailUrl: z.string().url("Thumbnail URL must be a valid URL").optional().nullable(),
    videoDuration: z.number().optional().nullable()
});

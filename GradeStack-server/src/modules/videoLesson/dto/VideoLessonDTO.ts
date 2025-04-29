export interface VideoLessonCreateDTO {
  url?: string;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}

export interface VideoLessonUpdateDTO {
  url?: string;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}

export interface ModuleVideoInfoDTO {
  videoUrl: string;
  thumbnailUrl?: string | null;
  videoDuration?: number | null;
}
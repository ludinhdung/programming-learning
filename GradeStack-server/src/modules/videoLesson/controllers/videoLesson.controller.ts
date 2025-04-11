import { Request, Response } from 'express';
import { VideoLessonService } from '../services/videoLesson.service';
import { r2StorageService, UploadedFile } from '../../../shared/services/r2-storage.service';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class VideoLessonController {
    private videoLessonService: VideoLessonService;

    constructor() {
        this.videoLessonService = new VideoLessonService();
    }

    /**
     * Helper method to handle errors
     */
    private handleError(res: Response, error: any): void {
        console.error('Error:', error);
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ message });
    }

    /**
     * Get video lesson by lesson ID
     */
    public getVideoLessonByLessonId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const videoLesson = await this.videoLessonService.getVideoLessonByLessonId(lessonId);
            res.status(200).json(videoLesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a video lesson
     */
    public createVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const videoData = req.body;
            
            // Validate required fields
            if (!videoData?.url && !videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }
            
            // Normalize video data
            const normalizedVideoData = {
                url: videoData.videoUrl || videoData.url,
                thumbnailUrl: videoData.thumbnailUrl || null,
                duration: videoData.duration || null
            };
            
            const videoLesson = await this.videoLessonService.createVideoLesson(lessonId, normalizedVideoData);
            res.status(201).json(videoLesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a video lesson with automatic duration extraction
     */
    public createVideoLessonWithDuration = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            
            // Check if file exists in the request
            if (!req.file) {
                res.status(400).json({ message: 'No video file uploaded' });
                return;
            }
            
            const file = req.file as unknown as UploadedFile;
            
            // Upload the video to Cloudflare R2
            const uploadResult = await r2StorageService.uploadVideo(file, 'lesson-videos');
            
            // Create a temporary file for ffprobe to analyze
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `temp_video_${Date.now()}.mp4`);
            fs.writeFileSync(tempFilePath, file.buffer);
            
            // Create video lesson with automatic duration extraction
            const videoLesson = await this.videoLessonService.createVideoLessonWithDuration(
                lessonId,
                tempFilePath,
                {
                    url: uploadResult.videoUrl,
                    thumbnailUrl: uploadResult.thumbnailUrl
                }
            );
            
            // Delete the temporary file after processing
            try {
                fs.unlinkSync(tempFilePath);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
            
            res.status(201).json({
                ...videoLesson,
                videoUrl: uploadResult.videoUrl,
                thumbnailUrl: uploadResult.thumbnailUrl
            });
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a video lesson
     */
    public updateVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const videoData = req.body;
            
            // Normalize video data
            const normalizedVideoData = {
                url: videoData.videoUrl || videoData.url,
                thumbnailUrl: videoData.thumbnailUrl,
                duration: videoData.duration
            };
            
            const videoLesson = await this.videoLessonService.updateVideoLesson(lessonId, normalizedVideoData);
            res.status(200).json(videoLesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Delete a video lesson
     */
    public deleteVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            await this.videoLessonService.deleteVideoLesson(lessonId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update module video information
     * This method supports the newer approach of storing video info directly on modules
     */
    public updateModuleVideoInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const videoData = req.body;
            
            // Validate required fields
            if (!videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }
            
            const module = await this.videoLessonService.updateModuleVideoInfo(moduleId, videoData);
            res.status(200).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };
    
    /**
     * Update module video with automatic duration extraction
     * This method supports the newer approach of storing video info directly on modules
     */
    public updateModuleVideoWithDuration = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            
            // Check if file exists in the request
            if (!req.file) {
                res.status(400).json({ message: 'No video file uploaded' });
                return;
            }
            
            const file = req.file as unknown as UploadedFile;
            
            // Upload the video to Cloudflare R2
            const uploadResult = await r2StorageService.uploadVideo(file, 'module-videos');
            
            // Create a temporary file for ffprobe to analyze
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `temp_video_${Date.now()}.mp4`);
            fs.writeFileSync(tempFilePath, file.buffer);
            
            // Update module with video information and automatic duration extraction
            const module = await this.videoLessonService.updateModuleVideoWithDuration(
                moduleId,
                tempFilePath,
                {
                    videoUrl: uploadResult.videoUrl,
                    thumbnailUrl: uploadResult.thumbnailUrl
                }
            );
            
            // Delete the temporary file after processing
            try {
                fs.unlinkSync(tempFilePath);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
            
            res.status(200).json({
                ...module,
                videoUrl: uploadResult.videoUrl,
                thumbnailUrl: uploadResult.thumbnailUrl
            });
        } catch (error) {
            this.handleError(res, error);
        }
    };
}

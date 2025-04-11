import { PrismaClient, VideoLesson, Lesson, LessonType, Module } from '@prisma/client';
import { VideoLessonBaseService, VideoLessonWithRelations } from '../../../shared/base/domain-services/videoLesson-base.service';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export class VideoLessonService extends VideoLessonBaseService {
    protected get model() {
        return prisma.videoLesson;
    }

    protected getModelName(): string {
        return 'VideoLesson';
    }

    /**
     * Get video lesson by lesson ID
     */
    async getVideoLessonByLessonId(lessonId: string): Promise<VideoLessonWithRelations | null> {
        return this.findByLessonId(lessonId);
    }
    
    /**
     * Create a video lesson
     */
    async createVideoLesson(lessonId: string, videoData: { url: string, thumbnailUrl?: string | null, duration?: number | null }): Promise<VideoLesson> {
        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        // Update lesson type to video
        await prisma.lesson.update({
            where: { id: lessonId },
            data: { lessonType: LessonType.VIDEO }
        });
        
        // Create video lesson
        return this.create({
            url: videoData.url,
            thumbnailUrl: videoData.thumbnailUrl || null,
            duration: videoData.duration !== null && videoData.duration !== undefined ? videoData.duration : 0,
            lesson: {
                connect: { id: lessonId }
            }
        });
    }
    
    /**
     * Update a video lesson
     */
    async updateVideoLesson(lessonId: string, videoData: { url?: string, thumbnailUrl?: string | null, duration?: number | null }): Promise<VideoLesson> {
        // Verify video lesson exists
        const videoLesson = await this.findByLessonId(lessonId);
        
        if (!videoLesson) {
            throw { status: 404, message: `Video lesson with lesson id ${lessonId} not found` };
        }
        
        // Update video lesson
        return this.update(videoLesson.id, {
            url: videoData.url || videoLesson.url,
            thumbnailUrl: videoData.thumbnailUrl !== undefined ? videoData.thumbnailUrl : videoLesson.thumbnailUrl,
            duration: videoData.duration !== null && videoData.duration !== undefined ? videoData.duration : videoLesson.duration
        });
    }
    
    /**
     * Delete a video lesson
     */
    async deleteVideoLesson(lessonId: string): Promise<void> {
        // Verify video lesson exists
        const videoLesson = await this.findByLessonId(lessonId);
        
        if (!videoLesson) {
            throw { status: 404, message: `Video lesson with lesson id ${lessonId} not found` };
        }
        
        // Delete video lesson
        await this.remove(videoLesson.id);
    }
    
    /**
     * Extract video duration from an MP4 file
     */
    async extractVideoDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const ffprobe = spawn('ffprobe', [
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                filePath
            ]);
            
            let output = '';
            
            ffprobe.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            ffprobe.stderr.on('data', (data) => {
                console.error(`ffprobe stderr: ${data}`);
            });
            
            ffprobe.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`ffprobe process exited with code ${code}`));
                    return;
                }
                
                const duration = parseFloat(output.trim());
                resolve(duration);
            });
        });
    }
    
    /**
     * Update module video information
     * This method supports the newer approach of storing video info directly on modules
     */
    async updateModuleVideoInfo(moduleId: string, videoData: { videoUrl: string, thumbnailUrl?: string | null, videoDuration?: number | null }): Promise<Module> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });
        
        if (!module) {
            throw { status: 404, message: `Module with id ${moduleId} not found` };
        }
        
        // Update module with video information
        return prisma.module.update({
            where: { id: moduleId },
            data: {
                videoUrl: videoData.videoUrl,
                thumbnailUrl: videoData.thumbnailUrl || null,
                videoDuration: videoData.videoDuration !== null && videoData.videoDuration !== undefined 
                    ? videoData.videoDuration 
                    : module.videoDuration
            }
        });
    }
    
    /**
     * Create a video lesson with automatic duration extraction
     */
    async createVideoLessonWithDuration(lessonId: string, videoPath: string, videoData: { url: string, thumbnailUrl?: string | null }): Promise<VideoLesson> {
        try {
            // Extract video duration
            const duration = await this.extractVideoDuration(videoPath);
            
            // Create video lesson with extracted duration
            return this.createVideoLesson(lessonId, {
                ...videoData,
                duration
            });
        } catch (error) {
            console.error('Error extracting video duration:', error);
            
            // Create video lesson without duration if extraction fails
            return this.createVideoLesson(lessonId, videoData);
        }
    }
    
    /**
     * Update module video with automatic duration extraction
     */
    async updateModuleVideoWithDuration(moduleId: string, videoPath: string, videoData: { videoUrl: string, thumbnailUrl?: string | null }): Promise<Module> {
        try {
            // Extract video duration
            const videoDuration = await this.extractVideoDuration(videoPath);
            
            // Update module with video information including extracted duration
            return this.updateModuleVideoInfo(moduleId, {
                ...videoData,
                videoDuration
            });
        } catch (error) {
            console.error('Error extracting video duration:', error);
            
            // Update module without duration if extraction fails
            return this.updateModuleVideoInfo(moduleId, videoData);
        }
    }
}

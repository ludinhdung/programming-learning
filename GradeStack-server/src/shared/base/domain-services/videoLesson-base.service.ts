import { BaseService } from '../base.service';
import { VideoLesson, Prisma, Lesson } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type VideoLessonWithRelations = VideoLesson & {
    lesson?: Lesson;
};

export abstract class VideoLessonBaseService<
    T = VideoLessonWithRelations, 
    C = Prisma.VideoLessonCreateInput, 
    U = Prisma.VideoLessonUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // VideoLesson-specific common methods
    async findByLessonId(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { lessonId }
        });
    }

    async findWithLesson(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { lessonId },
            include: { 
                lesson: true
            }
        });
    }

    async findComplete(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { lessonId },
            include: { 
                lesson: {
                    include: {
                        module: {
                            include: {
                                course: {
                                    include: {
                                        instructor: {
                                            include: {
                                                user: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Phương thức để cập nhật thông tin video cho module
    // Lưu ý: Dựa trên memory, hệ thống đã cập nhật để lưu trữ thông tin video trực tiếp trên Module
    async updateModuleVideoInfo(moduleId: string, videoData: { 
        videoUrl: string, 
        thumbnailUrl?: string | null, 
        videoDuration?: number | null 
    }): Promise<any> {
        // Kiểm tra xem module có tồn tại không
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });
        
        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }
        
        // Cập nhật thông tin video cho module
        return prisma.module.update({
            where: { id: moduleId },
            data: {
                videoUrl: videoData.videoUrl,
                thumbnailUrl: videoData.thumbnailUrl || null,
                videoDuration: videoData.videoDuration || null
            }
        });
    }
    
    // Phương thức để trích xuất thời lượng video từ file MP4
    async extractVideoDuration(filePath: string): Promise<number> {
        // Triển khai logic trích xuất thời lượng video
        // Đây là một phương thức trừu tượng, các lớp con sẽ triển khai chi tiết
        throw new Error('Method not implemented');
    }
}

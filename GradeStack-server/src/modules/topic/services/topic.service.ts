import { PrismaClient, Topic, Prisma, Role } from '@prisma/client';
import { TopicBaseService, TopicWithRelations } from '../../../shared/base/domain-services/topic-base.service';
import { topicCreateSchema, topicUpdateSchema } from '../validation/topic.validation';
import { TopicCreateDTO, TopicUpdateDTO } from '../dto/TopicDTO';
import { PrismaErrorHandler } from '../../../shared/errors/prisma-error-handler';
import { ApiError } from '../../../shared/errors/api-error';

const prisma = new PrismaClient();

export class TopicService extends TopicBaseService {
    protected get model() {
        return prisma.topic;
    }

    protected getModelName(): string {
        return 'Topic';
    }
    
    /**
     * Tạo một chủ đề mới - Chỉ INSTRUCTOR_LEAD mới có quyền
     */
    async createTopic(instructorId: string, topicData: TopicCreateDTO): Promise<Topic> {
        try {
            // Validate input data
            const validatedData = topicCreateSchema.parse(topicData);
            
            // Kiểm tra xem instructor có tồn tại không và có phải là INSTRUCTOR_LEAD không
            const instructor = await prisma.instructor.findUnique({
                where: { userId: instructorId },
                include: {
                    user: {
                        select: {
                            role: true
                        }
                    }
                }
            });
            
            if (!instructor) {
                throw ApiError.notFound(`Instructor with id ${instructorId} not found`);
            }

            if (instructor.user.role !== Role.INSTRUCTOR_LEAD) {
                throw ApiError.forbidden('Only INSTRUCTOR_LEAD can create topics');
            }
            
            return prisma.topic.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                    thumbnail: validatedData.thumbnail,
                    Instructor: {
                        connect: { userId: instructorId }
                    }
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw PrismaErrorHandler.handle(error, 'Topic');
            }
            throw error;
        }
    }
    
    /**
     * Lấy tất cả các chủ đề - Tất cả các role đều có quyền xem
     */
    async getAllTopics(): Promise<TopicWithRelations[]> {
        return this.findAll({
            include: {
                Instructor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Lấy chủ đề theo ID - Tất cả các role đều có quyền xem
     */
    async getTopicById(topicId: string): Promise<TopicWithRelations | null> {
        return this.findComplete(topicId);
    }
    
    /**
     * Lấy các chủ đề của một instructor - Tất cả các role đều có quyền xem
     */
    async getTopicsByInstructor(instructorId: string): Promise<TopicWithRelations[]> {
        return this.findByInstructorId(instructorId);
    }
    
    /**
     * Lấy các chủ đề kèm theo các khóa học - Tất cả các role đều có quyền xem
     */
    async getTopicsWithCourses(): Promise<TopicWithRelations[]> {
        return this.findTopicsWithCourses();
    }
    
    /**
     * Cập nhật một chủ đề - Chỉ INSTRUCTOR_LEAD mới có quyền
     */
    async updateTopic(instructorId: string, topicId: string, topicData: TopicUpdateDTO): Promise<Topic> {
        try {
            // Validate input data
            const validatedData = topicUpdateSchema.parse(topicData);
            
            // Kiểm tra quyền INSTRUCTOR_LEAD
            const instructor = await prisma.instructor.findUnique({
                where: { userId: instructorId },
                include: {
                    user: {
                        select: {
                            role: true
                        }
                    }
                }
            });

            if (!instructor) {
                throw ApiError.notFound(`Instructor with id ${instructorId} not found`);
            }

            if (instructor.user.role !== Role.INSTRUCTOR_LEAD) {
                throw ApiError.forbidden('Only INSTRUCTOR_LEAD can update topics');
            }

            // Kiểm tra quyền sở hữu topic
            const topic = await this.findWithInstructor(topicId);
            if (!topic) {
                throw ApiError.notFound(`Topic with id ${topicId} not found`);
            }

            if (topic.instructor?.userId !== instructorId) {
                throw ApiError.forbidden('You do not have permission to update this topic');
            }
            
            return this.update(topicId, {
                name: validatedData.name,
                description: validatedData.description,
                thumbnail: validatedData.thumbnail
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw PrismaErrorHandler.handle(error, 'Topic');
            }
            throw error;
        }
    }
    
    /**
     * Xóa một chủ đề - Chỉ INSTRUCTOR_LEAD mới có quyền
     */
    async deleteTopic(instructorId: string, topicId: string): Promise<Topic> {
        try {
            // Kiểm tra quyền INSTRUCTOR_LEAD
            const instructor = await prisma.instructor.findUnique({
                where: { userId: instructorId },
                include: {
                    user: {
                        select: {
                            role: true
                        }
                    }
                }
            });

            if (!instructor) {
                throw ApiError.notFound(`Instructor with id ${instructorId} not found`);
            }

            if (instructor.user.role !== Role.INSTRUCTOR_LEAD) {
                throw ApiError.forbidden('Only INSTRUCTOR_LEAD can delete topics');
            }

            // Kiểm tra topic có tồn tại và quyền sở hữu
            const topic = await this.findWithCourses(topicId);
            if (!topic) {
                throw ApiError.notFound(`Topic with id ${topicId} not found`);
            }

            if (topic.instructor?.userId !== instructorId) {
                throw ApiError.forbidden('You do not have permission to delete this topic');
            }
            
            // Xóa các liên kết với khóa học
            if (topic.courses && topic.courses.length > 0) {
                await prisma.courseTopic.deleteMany({
                    where: { topicId }
                });
            }
            
            // Xóa chủ đề
            return this.remove(topicId);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw PrismaErrorHandler.handle(error, 'Topic');
            }
            throw error;
        }
    }
}

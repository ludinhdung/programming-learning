import { PrismaClient, Topic, Prisma } from '@prisma/client';
import { TopicBaseService, TopicWithRelations } from '../../../shared/base/domain-services/topic-base.service';
import { topicCreateSchema, topicUpdateSchema } from '../validation/topic.validation';
import { TopicCreateDTO, TopicUpdateDTO } from '../dto/TopicDTO';
import { PrismaErrorHandler } from '../../../shared/errors/prisma-error-handler';

const prisma = new PrismaClient();

export class TopicService extends TopicBaseService {
    protected get model() {
        return prisma.topic;
    }

    protected getModelName(): string {
        return 'Topic';
    }
    
    /**
     * Tạo một chủ đề mới
     */
    async createTopic(instructorId: string, topicData: TopicCreateDTO): Promise<Topic> {
        try {
            // Validate input data
            const validatedData = topicCreateSchema.parse(topicData);
            
            // Kiểm tra xem instructor có tồn tại không
            const instructor = await prisma.instructor.findUnique({
                where: { userId: instructorId }
            });
            
            if (!instructor) {
                throw new Error(`Instructor with id ${instructorId} not found`);
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
     * Lấy tất cả các chủ đề
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
     * Lấy chủ đề theo ID
     */
    async getTopicById(topicId: string): Promise<TopicWithRelations | null> {
        return this.findComplete(topicId);
    }
    
    /**
     * Lấy các chủ đề của một instructor
     */
    async getTopicsByInstructor(instructorId: string): Promise<TopicWithRelations[]> {
        return this.findByInstructorId(instructorId);
    }
    
    /**
     * Lấy các chủ đề kèm theo các khóa học
     */
    async getTopicsWithCourses(): Promise<TopicWithRelations[]> {
        return this.findTopicsWithCourses();
    }
    
    /**
     * Cập nhật một chủ đề
     */
    async updateTopic(topicId: string, topicData: TopicUpdateDTO): Promise<Topic> {
        try {
            // Validate input data
            const validatedData = topicUpdateSchema.parse(topicData);
            
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
     * Xóa một chủ đề
     */
    async deleteTopic(topicId: string): Promise<Topic> {
        // Kiểm tra xem topic có tồn tại không
        const topic = await this.findWithCourses(topicId);
        
        if (!topic) {
            throw new Error(`Topic with id ${topicId} not found`);
        }
        
        // Xóa các liên kết với khóa học
        if (topic.courses && topic.courses.length > 0) {
            await prisma.courseTopic.deleteMany({
                where: { topicId }
            });
        }
        
        // Xóa chủ đề
        return this.remove(topicId);
    }
}

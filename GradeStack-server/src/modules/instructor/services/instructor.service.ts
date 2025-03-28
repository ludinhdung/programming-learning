import { InstructorBaseService, InstructorWithRelations } from '../../../shared/base/domain-services/instructor-base.service';
import { Instructor, Prisma, User, Course, Workshop, Role, Topic  } from '@prisma/client';
import { CourseCreateDTO } from './../dto/CourseCreateDTO';
import { PrismaClient } from '@prisma/client';
import { r2StorageService, UploadedFile } from '../../../shared/services/r2-storage.service';

const prisma = new PrismaClient();

export class InstructorService extends InstructorBaseService<
    InstructorWithRelations,
    Prisma.InstructorCreateInput,
    Prisma.InstructorUpdateInput
> {
    protected get model() {
        return prisma.instructor;
    }

    protected getModelName(): string {
        return Role.INSTRUCTOR;
    }
    
    // Instructor-specific business logic
    async createInstructor(userData: Prisma.UserCreateInput, instructorData: Omit<Prisma.InstructorCreateInput, 'user'>): Promise<InstructorWithRelations> {
        // First, create the user with INSTRUCTOR role
        const user = await prisma.user.create({
            data: {
                ...userData,
                role: Role.INSTRUCTOR
            }
        });
        // Then create the instructor profile linked to the user
        const instructor = await this.create({
            user: {
                connect: { id: user.id }
            },
            organization: instructorData.organization,
            avatar: instructorData.avatar || '',
            bio: instructorData.bio || '',
            socials: instructorData.socials || []
        });

        return {
            ...instructor,
            user
        };
    }

    async updateProfile(userId: string, data: Prisma.InstructorUncheckedCreateInput): Promise<Instructor> {
        const instructor = await this.findByUserId(userId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${userId} not found`);
        }   
        return this.model.update({
            where: { userId },
            data
        });
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<Instructor> {
        return this.update(userId, { avatar: avatarUrl });
    }

    async createCourse(instructorId: string, courseData: CourseCreateDTO): Promise<any> {
        // 1. Kiểm tra sự tồn tại của giảng viên
        const instructor = await this.findByUserId(instructorId);
        
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        // Bắt đầu giao dịch để đảm bảo tính nhất quán của dữ liệu
        return prisma.$transaction(async (tx) => {
            // 2. Tạo khóa học
            const course = await this._createCourseBase(tx, courseData, instructor.userId);
            
            // 3. Kết nối khóa học với các chủ đề nếu có
            if (courseData.topicIds && courseData.topicIds.length > 0) {
                await this._connectCourseTopics(tx, course.id, courseData.topicIds);
            }

            // 4. Tạo các module nếu được cung cấp
            if (courseData.modules && courseData.modules.length > 0) {
                await this._createCourseModules(tx, course.id, courseData.modules);
            }

            // Trả về khóa học đã tạo với tất cả các mối quan hệ
            return this._getCourseWithRelations(tx, course.id);
        });
    }

    // Phương thức private để tạo khóa học cơ bản
    private async _createCourseBase(tx: any, courseData: CourseCreateDTO, instructorUserId: string) {
        return tx.course.create({
            data: {
                title: courseData.title,
                description: courseData.description,
                price: courseData.price,
                duration: courseData.duration || 0, // Provide default value if undefined
                isPublished: courseData.isPublished || false,
                instructor: {
                    connect: { userId: instructorUserId }
                }
            }
        });
    }

    // Phương thức private để kết nối khóa học với các chủ đề
    private async _connectCourseTopics(tx: any, courseId: string, topicIds: string[]) {
        const topicConnections = topicIds.map(topicId => {
            return tx.courseTopic.create({
                data: {
                    course: { connect: { id: courseId } },
                    topic: { connect: { id: topicId } }
                }
            });
        });
        
        await Promise.all(topicConnections);
    }

    // Phương thức private để tạo modules cho khóa học
    private async _createCourseModules(tx: any, courseId: string, modules: any[]) {
        for (const [index, moduleData] of modules.entries()) {
            const module = await this._createModule(tx, courseId, moduleData, index);
            
            if (moduleData.lessons && moduleData.lessons.length > 0) {
                await this._createModuleLessons(tx, module.id, moduleData.lessons);
            }
        }
    }

    // Phương thức private để tạo một module
    private async _createModule(tx: any, courseId: string, moduleData: any, index: number) {
        return tx.module.create({
            data: {
                title: moduleData.title,
                description: moduleData.description,
                order: moduleData.order || index + 1,
                course: {
                    connect: { id: courseId }
                }
            }
        });
    }

    // Phương thức private để tạo các bài học cho module
    private async _createModuleLessons(tx: any, moduleId: string, lessons: any[]) {
        for (const [index, lessonData] of lessons.entries()) {
            const lesson = await this._createLesson(tx, moduleId, lessonData);
            
            if (lessonData.lessonType) {
                await this._createLessonContent(tx, lesson.id, lessonData);
            }
        }
    }

    // Phương thức private để tạo một bài học
    private async _createLesson(tx: any, moduleId: string, lessonData: any) {
        return tx.lesson.create({
            data: {
                title: lessonData.title,
                description: lessonData.description,
                lessonType: lessonData.lessonType,
                duration: lessonData.duration || 0,
                isPreview: lessonData.isPreview || false,
                module: {
                    connect: { id: moduleId }
                }
            }
        });
    }

    // Phương thức private để tạo nội dung bài học dựa trên loại
    private async _createLessonContent(tx: any, lessonId: string, lessonData: any) {
        const lessonType = lessonData.lessonType;
        
        if (lessonType === 'VIDEO') {
            if (lessonData.videoData) {
                await this._createVideoLesson(tx, lessonId, lessonData.videoData);
            }
        } 
        else if (lessonType === 'CODING') {
            if (lessonData.codingData) {
                await this._createCodingLesson(tx, lessonId, lessonData.codingData);
            }
        } 
        else if (lessonType === 'FINAL_TEST') {
            if (lessonData.finalTestData) {
                await this._createFinalTestLesson(tx, lessonId, lessonData.finalTestData);
            }
        }
    }

    // Phương thức private để tạo bài học video
    private async _createVideoLesson(tx: any, lessonId: string, videoData: any) {
        // Check if we have a video file to upload
        if (videoData.file) {
            try {
                // Upload video to Cloudflare R2
                const uploadResult = await r2StorageService.uploadVideo(videoData.file, 'course-videos');
                
                // Update videoData with the URLs from R2
                videoData.url = uploadResult.videoUrl;
                videoData.thumbnailUrl = uploadResult.thumbnailUrl;
            } catch (error) {
                console.error('Error uploading video to R2:', error);
                throw new Error(`Failed to upload video: ${(error as Error).message}`);
            }
        }

        // Prepare data object with required fields
        const videoLessonData: any = {
            url: videoData.url,
            duration: videoData.duration || 0,
            lesson: {
                connect: { id: lessonId }
            }
        };
        
        // Only add thumbnailUrl if it exists
        if (videoData.thumbnailUrl) {
            videoLessonData.thumbnailUrl = videoData.thumbnailUrl;
        }
        
        return tx.videoLesson.create({
            data: videoLessonData
        });
    }

    // Phương thức private để tạo bài tập lập trình
    private async _createCodingLesson(tx: any, lessonId: string, codingData: any) {
        return tx.codingExercise.create({
            data: {
                language: codingData.language,
                problem: codingData.problem,
                hint: codingData.hint || '',
                solution: codingData.solution,
                codeSnippet: codingData.codeSnippet || '',
                lesson: {
                    connect: { id: lessonId }
                }
            }
        });
    }

    // Phương thức private để tạo bài kiểm tra cuối cùng
    private async _createFinalTestLesson(tx: any, lessonId: string, finalTestData: any) {
        const finalTest = await tx.finalTestLesson.create({
            data: {
                estimatedDuration: finalTestData.estimatedDuration || 0,
                lesson: {
                    connect: { id: lessonId }
                }
            }
        });

        if (finalTestData.questions && finalTestData.questions.length > 0) {
            await this._createTestQuestions(tx, finalTest.id, finalTestData.questions);
        }
        
        return finalTest;
    }

    // Phương thức private để tạo câu hỏi cho bài kiểm tra
    private async _createTestQuestions(tx: any, testId: string, questions: any[]) {
        for (const [qIndex, questionData] of questions.entries()) {
            const question = await tx.question.create({
                data: {
                    content: questionData.content,
                    order: questionData.order || qIndex + 1,
                    test: {
                        connect: { id: testId }
                    }
                }
            });

            if (questionData.answers && questionData.answers.length > 0) {
                await this._createQuestionAnswers(tx, question.id, questionData.answers);
            }
        }
    }

    // Phương thức private để tạo các câu trả lời cho câu hỏi
    private async _createQuestionAnswers(tx: any, questionId: string, answers: any[]) {
        const answerPromises = answers.map(answerData => {
            return tx.answer.create({
                data: {
                    content: answerData.content,
                    isCorrect: answerData.isCorrect || false,
                    question: {
                        connect: { id: questionId }
                    }
                }
            });
        });
        
        await Promise.all(answerPromises);
    }

    // Phương thức private để lấy khóa học với tất cả các mối quan hệ
    private async _getCourseWithRelations(tx: any, courseId: string) {
        return tx.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                video: true,
                                coding: true,
                                finalTest: {
                                    include: {
                                        questions: {
                                            include: {
                                                answers: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }
    
    async createWorkshop(instructorId: string, workshopData: Omit<Prisma.WorkshopCreateInput, 'instructor'>): Promise<Workshop> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }
        return prisma.workshop.create({
            data: {
                ...workshopData,
                instructor: {
                    connect: { userId: instructor.userId  }
                }
            }
        });
    }
    
    async createTopic(instructorId: string, topicData: Prisma.TopicCreateInput): Promise<Prisma.TopicCreateInput> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }
        return prisma.topic.create({
                data: {
                ...topicData,
                Instructor: {
                    connect: { userId: instructor.userId }
                }
            }
        });
    }

    // Course CRUD operations
    async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        return prisma.course.findMany({
            where: {
                instructorId: instructor.userId
            },
            include: {
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }

    async getFullRelationCourses(instructorId: string): Promise<Course[]> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        return prisma.course.findMany({
            where: {
                instructorId: instructor.userId
            },
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                video: true,
                                coding: true,
                                finalTest: {
                                    include: {
                                        questions: {
                                            include: {
                                                answers: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }
    
    async getCourseById(courseId: string, instructorId: string): Promise<any> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        // Verify course belongs to instructor
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                instructorId: instructor.userId
            },
            include: {
                modules: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        lessons: {
                            include: {
                                video: true,
                                coding: true,
                                finalTest: {
                                    include: {
                                        questions: {
                                            include: {
                                                answers: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            }
        });

        if (!course) {
            throw new Error(`Course with id ${courseId} not found or does not belong to instructor ${instructorId}`);
        }

        return course;
    }

    async updateCourse(instructorId: string, courseId: string, courseData: any): Promise<any> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        // Verify course belongs to instructor
        const existingCourse = await prisma.course.findUnique({
            where: {
                id: courseId,
                instructorId: instructor.userId
            }
        });

        if (!existingCourse) {
            throw new Error(`Course with id ${courseId} not found or does not belong to instructor ${instructorId}`);
        }

        // Update course
        return prisma.$transaction(async (tx) => {
            // Update basic course info
            const updatedCourse = await tx.course.update({
                where: { id: courseId },
                data: {
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    duration: courseData.duration || existingCourse.duration,
                    isPublished: courseData.isPublished !== undefined ? courseData.isPublished : existingCourse.isPublished
                }
            });

            // Update topics if provided
            if (courseData.topicIds && courseData.topicIds.length > 0) {
                // Remove existing topics
                await tx.courseTopic.deleteMany({
                    where: { courseId }
                });

                // Add new topics
                await this._connectCourseTopics(tx, courseId, courseData.topicIds);
            }

            return this._getCourseWithRelations(tx, courseId);
        });
    }

    async deleteCourse(instructorId: string, courseId: string): Promise<void> {
        // Verify instructor exists
        const instructor = await this.findByUserId(instructorId);
        if (!instructor) {
            throw new Error(`Instructor with userId ${instructorId} not found`);
        }

        // Verify course belongs to instructor
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                instructorId: instructor.userId
            }
        });

        if (!course) {
            throw new Error(`Course with id ${courseId} not found or does not belong to instructor ${instructorId}`);
        }

        // Delete course and all related data
        await prisma.$transaction(async (tx) => {
            // Get all modules
            const modules = await tx.module.findMany({
                where: { courseId },
                include: { lessons: true }
            });

            // Delete all lessons and their related content
            for (const module of modules) {
                for (const lesson of module.lessons) {
                    await this._deleteLesson(tx, lesson.id);
                }
                
                // Delete module
                await tx.module.delete({
                    where: { id: module.id }
                });
            }

            // Delete course topics
            await tx.courseTopic.deleteMany({
                where: { courseId }
            });

            // Delete course
            await tx.course.delete({
                where: { id: courseId }
            });
        });
    }

    // Module CRUD operations
    async getModulesByCourse(courseId: string): Promise<any[]> {
        return prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: {
                lessons: {
                    include: {
                        video: true,
                        coding: true,
                        finalTest: true
                    }
                }
            }
        });
    }

    async getModuleById(moduleId: string): Promise<any> {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    include: {
                        video: true,
                        coding: true,
                        finalTest: {
                            include: {
                                questions: {
                                    include: {
                                        answers: true
                                    }
                                }
                            }
                        }
                    }
                },
                course: true
            }
        });

        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }

        return module;
    }

    async createModule(courseId: string, moduleData: any): Promise<any> {
        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new Error(`Course with id ${courseId} not found`);
        }

        // Get the highest order value
        const highestOrderModule = await prisma.module.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' }
        });

        const order = moduleData.order || (highestOrderModule ? highestOrderModule.order + 1 : 1);

        // Create module
        return prisma.module.create({
            data: {
                title: moduleData.title,
                description: moduleData.description,
                order,
                course: {
                    connect: { id: courseId }
                }
            },
            include: {
                lessons: true
            }
        });
    }

    async updateModule(moduleId: string, moduleData: any): Promise<any> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });

        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }

        // Update module
        return prisma.module.update({
            where: { id: moduleId },
            data: {
                title: moduleData.title,
                description: moduleData.description,
                order: moduleData.order || module.order
            },
            include: {
                lessons: {
                    include: {
                        video: true,
                        coding: true,
                        finalTest: true
                    }
                }
            }
        });
    }

    async deleteModule(moduleId: string): Promise<void> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { lessons: true }
        });

        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }

        // Delete module and all related data
        await prisma.$transaction(async (tx) => {
            // Delete all lessons and their related content
            for (const lesson of module.lessons) {
                await this._deleteLesson(tx, lesson.id);
            }
            
            // Delete module
            await tx.module.delete({
                where: { id: moduleId }
            });
        });
    }

    // Lesson CRUD operations
    async getLessonsByModule(moduleId: string): Promise<any[]> {
        return prisma.lesson.findMany({
            where: { moduleId },
            include: {
                video: true,
                coding: true,
                finalTest: {
                    include: {
                        questions: {
                            include: {
                                answers: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getLessonById(lessonId: string): Promise<any> {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                video: true,
                coding: true,
                finalTest: {
                    include: {
                        questions: {
                            include: {
                                answers: true
                            }
                        }
                    }
                },
                module: {
                    include: {
                        course: true
                    }
                }
            }
        });

        if (!lesson) {
            throw new Error(`Lesson with id ${lessonId} not found`);
        }

        return lesson;
    }

    async updateLesson(lessonId: string, lessonData: any): Promise<any> {
        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            throw new Error(`Lesson with id ${lessonId} not found`);
        }

        // Update lesson
        return prisma.lesson.update({
            where: { id: lessonId },
            data: {
                title: lessonData.title,
                description: lessonData.description,
                duration: lessonData.duration || lesson.duration,
                isPreview: lessonData.isPreview !== undefined ? lessonData.isPreview : lesson.isPreview
            },
            include: {
                video: true,
                coding: true,
                finalTest: {
                    include: {
                        questions: {
                            include: {
                                answers: true
                            }
                        }
                    }
                }
            }
        });
    }

    async deleteLesson(lessonId: string): Promise<void> {
        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            throw new Error(`Lesson with id ${lessonId} not found`);
        }

        // Delete lesson and all related data
        await prisma.$transaction(async (tx) => {
            await this._deleteLesson(tx, lessonId);
        });
    }

    // Helper method to delete a lesson and its related content
    private async _deleteLesson(tx: any, lessonId: string): Promise<void> {
        const lesson = await tx.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) return;

        // Delete related content based on lesson type
        if (lesson.lessonType === 'VIDEO') {
            await tx.videoLesson.deleteMany({
                where: { lessonId }
            });
        } else if (lesson.lessonType === 'CODING') {
            await tx.codingExercise.deleteMany({
                where: { lessonId }
            });
        } else if (lesson.lessonType === 'FINAL_TEST') {
            // Delete questions and answers
            const finalTest = await tx.finalTestLesson.findUnique({
                where: { lessonId },
                include: { questions: true }
            });

            if (finalTest) {
                for (const question of finalTest.questions) {
                    await tx.answer.deleteMany({
                        where: { questionId: question.id }
                    });
                }

                await tx.question.deleteMany({
                    where: { finalTestLessonId: finalTest.id }
                });

                await tx.finalTestLesson.delete({
                    where: { id: finalTest.id }
                });
            }
        }

        // Delete comments and notes
        await tx.comment.deleteMany({
            where: { lessonId }
        });

        await tx.note.deleteMany({
            where: { lessonId }
        });

        // Delete lesson
        await tx.lesson.delete({
            where: { id: lessonId }
        });
    }
}
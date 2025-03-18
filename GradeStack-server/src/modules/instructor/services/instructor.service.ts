import { InstructorBaseService, InstructorWithRelations } from '../../../shared/base/domain-services/instructor-base.service';
import { Instructor, Prisma, User, Course, Workshop, Role, Topic  } from '@prisma/client';
import { CourseCreateDTO } from './../dto/CourseCreateDTO';
import { PrismaClient } from '@prisma/client';

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
        return tx.videoLesson.create({
            data: {
                url: videoData.url,
                duration: videoData.duration || 0,
                lesson: {
                    connect: { id: lessonId }
                }
            }
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
}
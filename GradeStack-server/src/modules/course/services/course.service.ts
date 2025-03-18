import { CourseBaseService, CourseWithRelations } from '../../../shared/base/domain-services/course-base.service';
import { Course, Prisma, Module, Lesson, LessonType, Question, Answer } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { Role } from '@prisma/client';

const prisma = new PrismaClient();

export class CourseService extends CourseBaseService<
    CourseWithRelations, 
    Prisma.CourseCreateInput,
    Prisma.CourseUpdateInput
> {
    protected get model() {
        return prisma.course;
    }
    
    protected getModelName(): string {
        return 'Course';
    }
    
    // Course-specific business logic
    async createCourse(instructorId: string, courseData: Omit<Prisma.CourseUncheckedCreateInput, 'instructorId'>): Promise<Course> {
        // Verify instructor exists
        const instructor = await prisma.instructor.findUnique({
            where: { userId: instructorId }
        });
        
        if (!instructor) {
            throw new Error(`Instructor with id ${instructorId} not found`);
        }
        
        return this.create({
            ...courseData,
            instructor: {
                connect: { userId: instructorId }
            }
        });
    }
    
    async publishCourse(courseId: string): Promise<Course> {
        // Kiểm tra xem course có tồn tại không
        // Kiểm tra xem course có đủ điều kiện publish không
        return this.update(courseId, { isPublished: true });
    }
    
    async unpublishCourse(courseId: string): Promise<Course> {
        return this.update(courseId, { isPublished: false });
    }
    
    async addModule(courseId: string, moduleData: Omit<Prisma.ModuleCreateInput, 'course'>): Promise<Module> {
        // Verify course exists
        await this.findOneOrFail(courseId);
        
        // Get the current highest order value
        const highestOrderModule = await prisma.module.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' }
        });
        
        const newOrder = highestOrderModule ? highestOrderModule.order + 1 : 1;
        
        return prisma.module.create({
            data: {
                ...moduleData,
                order: newOrder,
                course: {
                    connect: { id: courseId }
                }
            }
        });
    }
    
    async updateModule(moduleId: string, moduleData: Omit<Prisma.ModuleUpdateInput, 'course'>): Promise<Module> {
        return prisma.module.update({
            where: { id: moduleId },
            data: moduleData
        });
    }
    
    async deleteModule(moduleId: string): Promise<Module> {
        // Kiểm tra xem module có tồn tại không
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { lessons: true }
        });
        
        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }
        
        // Xóa tất cả lesson và dữ liệu liên quan
        if (module.lessons && module.lessons.length > 0) {
            // Xóa các lesson liên quan
            for (const lesson of module.lessons) {
                await this.deleteLesson(lesson.id);
            }
        }
        
        // Xóa module
        return prisma.module.delete({
            where: { id: moduleId }
        });
    }
    
    async reorderModules(courseId: string, moduleOrders: { id: string, order: number }[]): Promise<Module[]> {
        // Verify course exists
        await this.findOneOrFail(courseId);
        
        // Update each module order in a transaction
        const updates = moduleOrders.map(({ id, order }) => 
            prisma.module.update({
                where: { id },
                data: { order }
            })
        );
        
        return prisma.$transaction(updates);
    }
    
    async addLesson(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module'>): Promise<Lesson> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });
        
        if (!module) {
            throw new Error(`Module with id ${moduleId} not found`);
        }
        
        return prisma.lesson.create({
            data: {
                ...lessonData,
                module: {
                    connect: { id: moduleId }
                }
            }
        });
    }
    
    async updateLesson(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module'>): Promise<Lesson> {
        return prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData
        });
    }
    
    async deleteLesson(lessonId: string): Promise<void> {
        // Kiểm tra loại lesson để xóa dữ liệu liên quan
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });
        
        if (!lesson) {
            throw new Error(`Lesson with id ${lessonId} not found`);
        }
        
        // Xóa dữ liệu liên quan dựa trên loại lesson
        switch (lesson.lessonType) {
            case LessonType.VIDEO:
                await prisma.videoLesson.delete({
                    where: { lessonId }
                });
                break;
                
            case LessonType.CODING:
                // Xóa các bài nộp liên quan
                await prisma.submittedCodingExercise.deleteMany({
                    where: { codingExercise: { lessonId } }
                });
                
                // Xóa bài tập
                await prisma.codingExercise.delete({
                    where: { lessonId }
                });
                break;
                
            case LessonType.FINAL_TEST:
                const finalTest = await prisma.finalTestLesson.findUnique({
                    where: { lessonId },
                    include: { questions: true }
                });
                
                if (finalTest) {
                    // Xóa các bài nộp final test
                    await prisma.submittedFinalTest.deleteMany({
                        where: { finalTestId: finalTest.id }
                    });
                    
                    // Xóa các câu trả lời và câu hỏi
                    for (const question of finalTest.questions) {
                        await prisma.answer.deleteMany({
                            where: { questionId: question.id }
                        });
                    }
                    
                    // Xóa các câu hỏi
                    await prisma.question.deleteMany({
                        where: { testId: finalTest.id }
                    });
                    
                    // Xóa bài kiểm tra
                    await prisma.finalTestLesson.delete({
                        where: { lessonId }
                    });
                }
                break;
        }
        
        // Xóa các ghi chú liên quan đến bài học
        await prisma.note.deleteMany({
            where: { lessonId }
        });
        
        // Xóa các bình luận liên quan đến bài học
        await prisma.comment.deleteMany({
            where: { lessonId }
        });
        
        // Xóa bài học
        await prisma.lesson.delete({
            where: { id: lessonId }
        });
    }
    
    async addVideoLesson(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, videoData: Omit<Prisma.VideoLessonCreateInput, 'lesson'>): Promise<Lesson> {
        // Create the lesson
        const lesson = await this.addLesson(moduleId, {
            ...lessonData,
            lessonType: LessonType.VIDEO
        });
        
        // Create the video lesson
        await prisma.videoLesson.create({
            data: {
                ...videoData,
                lesson: {
                    connect: { id: lesson.id }
                }
            }
        });
        
        return lesson;
    }
    
    async updateVideoLesson(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, videoData: Omit<Prisma.VideoLessonUpdateInput, 'lesson'>): Promise<Lesson> {
        // Update the lesson
        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData
        });
        
        // Update the video lesson
        await prisma.videoLesson.update({
            where: { lessonId },
            data: videoData
        });
        
        return lesson;
    }
    
    async addCodingExercise(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, codingData: Omit<Prisma.CodingExerciseCreateInput, 'lesson'>): Promise<Lesson> {
        // Create the lesson
        const lesson = await this.addLesson(moduleId, {
            ...lessonData,
            lessonType: LessonType.CODING
        });
        
        // Create the coding exercise
        await prisma.codingExercise.create({
            data: {
                ...codingData,
                lesson: {
                    connect: { id: lesson.id }
                }
            }
        });
        
        return lesson;
    }
    
    async updateCodingExercise(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, codingData: Omit<Prisma.CodingExerciseUpdateInput, 'lesson'>): Promise<Lesson> {
        // Update the lesson
        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData
        });
        
        // Update the coding exercise
        await prisma.codingExercise.update({
            where: { lessonId },
            data: codingData
        });
        
        return lesson;
    }
    
    async addFinalTest(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, testData: Omit<Prisma.FinalTestLessonCreateInput, 'lesson'>): Promise<Lesson> {
        // Create the lesson
        const lesson = await this.addLesson(moduleId, {
            ...lessonData,
            lessonType: LessonType.FINAL_TEST
        });
        
        // Create the final test
        await prisma.finalTestLesson.create({
            data: {
                ...testData,
                lesson: {
                    connect: { id: lesson.id }
                }
            }
        });
        
        return lesson;
    }
    
    async updateFinalTest(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, testData: Omit<Prisma.FinalTestLessonUpdateInput, 'lesson'>): Promise<Lesson> {
        // Update the lesson
        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData
        });
        
        // Update the final test
        await prisma.finalTestLesson.update({
            where: { lessonId },
            data: testData
        });
        
        return lesson;
    }
    
    async addQuestion(finalTestId: string, questionData: Omit<Prisma.QuestionCreateInput, 'test'>, answers: Omit<Prisma.AnswerCreateInput, 'question'>[]): Promise<Question> {
        // Verify final test exists
        const finalTest = await prisma.finalTestLesson.findUnique({
            where: { id: finalTestId }
        });
        
        if (!finalTest) {
            throw new Error(`Final test with id ${finalTestId} not found`);
        }
        
        // Get highest question order
        const highestOrderQuestion = await prisma.question.findFirst({
            where: { testId: finalTestId },
            orderBy: { order: 'desc' }
        });
        
        const newOrder = highestOrderQuestion ? highestOrderQuestion.order + 1 : 1;
        
        // Create question with its answers in a transaction
        return prisma.$transaction(async (tx) => {
            // Create the question
            const question = await tx.question.create({
                data: {
                    ...questionData,
                    order: newOrder,
                    test: {
                        connect: { id: finalTestId }
                    }
                }
            });
            
            // Create the answers
            if (answers && answers.length > 0) {
                for (const answerData of answers) {
                    await tx.answer.create({
                        data: {
                            ...answerData,
                            question: {
                                connect: { id: question.id }
                            }
                        }
                    });
                }
            }
            
            return question;
        });
    }
    
    async updateQuestion(questionId: string, questionData: Omit<Prisma.QuestionUpdateInput, 'test'>): Promise<Question> {
        return prisma.question.update({
            where: { id: questionId },
            data: questionData
        });
    }
    
    async deleteQuestion(questionId: string): Promise<void> {
        
    }
    
    
}
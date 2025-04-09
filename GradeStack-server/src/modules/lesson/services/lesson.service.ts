import { PrismaClient, Lesson, LessonType, Prisma, Question } from '@prisma/client';
import { LessonBaseService, LessonWithRelations } from '../../../shared/base/domain-services/lesson-base.service';
import { withTransaction } from '../../../shared/utils/transaction.utils';

const prisma = new PrismaClient();

export class LessonService extends LessonBaseService {
    protected get model() {
        return prisma.lesson;
    }

    protected getModelName(): string {
        return 'Lesson';
    }

    /**
     * Get all lessons for a module
     */
    async getLessonsByModule(moduleId: string): Promise<LessonWithRelations[]> {
        return this.findAll({
            where: { moduleId },
            orderBy: { createdAt: 'asc' },
            include: {
                video: true,
                coding: {
                    include: {
                        question: true,
                        answers: true
                    }
                },
                finalTest: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                question: true,
                                answers: true
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Get a lesson by ID
     */
    async getLessonById(lessonId: string): Promise<LessonWithRelations | null> {
        const lesson = await this.findWithRelatedContent(lessonId);
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        return lesson;
    }
    
    /**
     * Create a new lesson
     */
    async createLesson(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module'>): Promise<Lesson> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });
        
        if (!module) {
            throw { status: 404, message: `Module with id ${moduleId} not found` };
        }
        
        return withTransaction(async (tx) => {
            return tx.lesson.create({
                data: {
                    ...lessonData,
                    module: {
                        connect: { id: moduleId }
                    }
                }
            });
        });
    }
    
    /**
     * Update a lesson
     */
    async updateLesson(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module'>): Promise<Lesson> {
        // Verify lesson exists
        await this.findOneOrFail(lessonId);
        
        return withTransaction(async (tx) => {
            return tx.lesson.update({
                where: { id: lessonId },
                data: lessonData
            });
        });
    }
    
    /**
     * Delete a lesson and all related content
     */
    async deleteLesson(lessonId: string): Promise<void> {
        // Find the lesson to determine its type
        const lesson = await this.findOne(lessonId, {
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
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        // Delete related content based on lesson type
        await withTransaction(async (tx) => {
            // Delete type-specific content
            switch (lesson.lessonType) {
                case LessonType.VIDEO:
                    if (lesson.videoLesson) {
                        await tx.videoLesson.delete({
                            where: { id: lesson.videoLesson.id }
                        });
                    }
                    break;
                    
                case LessonType.CODING:
                    if (lesson.codingExercise) {
                        // Delete submitted exercises
                        await tx.submittedCodingExercise.deleteMany({
                            where: { codingExerciseId: lesson.codingExercise.id }
                        });
                        
                        // Delete coding exercise
                        await tx.codingExercise.delete({
                            where: { id: lesson.codingExercise.id }
                        });
                    }
                    break;
                    
                case LessonType.FINAL_TEST:
                    if (lesson.finalTestLesson) {
                        // Delete submitted tests
                        await tx.submittedFinalTest.deleteMany({
                            where: { finalTestId: lesson.finalTestLesson.id }
                        });
                        
                        // Delete answers for all questions
                        for (const question of lesson.finalTestLesson.questions || []) {
                            await tx.answer.deleteMany({
                                where: { questionId: question.id }
                            });
                        }
                        
                        // Delete questions
                        await tx.question.deleteMany({
                            where: { testId: lesson.finalTestLesson.id }
                        });
                        
                        // Delete final test
                        await tx.finalTestLesson.delete({
                            where: { id: lesson.finalTestLesson.id }
                        });
                    }
                    break;
            }
            
            // Delete notes and comments
            await tx.note.deleteMany({
                where: { lessonId }
            });
            
            await tx.comment.deleteMany({
                where: { lessonId }
            });
            
            // Delete the lesson itself
            await tx.lesson.delete({
                where: { id: lessonId }
            });
        });
    }
    
    /**
     * Create a video lesson
     */
    async createVideoLesson(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, videoData: Omit<Prisma.VideoLessonCreateInput, 'lesson'>): Promise<Lesson> {
        return withTransaction(async (tx) => {
            // Create the lesson
            const lesson = await tx.lesson.create({
                data: {
                    ...lessonData,
                    lessonType: LessonType.VIDEO,
                    module: {
                        connect: { id: moduleId }
                    }
                }
            });
            
            // Create the video lesson
            await tx.videoLesson.create({
                data: {
                    ...videoData,
                    lesson: {
                        connect: { id: lesson.id }
                    }
                }
            });
            
            return lesson;
        });
    }
    
    /**
     * Update a video lesson
     */
    async updateVideoLesson(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, videoData: Omit<Prisma.VideoLessonUpdateInput, 'lesson'>): Promise<Lesson> {
        // Verify lesson exists and is a video lesson
        const lesson = await this.findOne(lessonId);
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        if (lesson.lessonType !== LessonType.VIDEO) {
            throw { status: 400, message: `Lesson with id ${lessonId} is not a video lesson` };
        }
        
        // Update in a transaction
        return withTransaction(async (tx) => {
            // Update the lesson
            const updatedLesson = await tx.lesson.update({
                where: { id: lessonId },
                data: lessonData
            });
            
            // Update the video lesson
            await tx.videoLesson.update({
                where: { lessonId },
                data: videoData
            });
            
            return updatedLesson;
        });
    }
    
    /**
     * Create a coding exercise
     */
    async createCodingExercise(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, codingData: Omit<Prisma.CodingExerciseCreateInput, 'lesson'>): Promise<Lesson> {
        return withTransaction(async (tx) => {
            // Create the lesson
            const lesson = await tx.lesson.create({
                data: {
                    ...lessonData,
                    lessonType: LessonType.CODING,
                    module: {
                        connect: { id: moduleId }
                    }
                }
            });
            
            // Create the coding exercise
            await tx.codingExercise.create({
                data: {
                    ...codingData,
                    lesson: {
                        connect: { id: lesson.id }
                    }
                }
            });
            
            return lesson;
        });
    }
    
    /**
     * Update a coding exercise
     */
    async updateCodingExercise(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, codingData: Omit<Prisma.CodingExerciseUpdateInput, 'lesson'>): Promise<Lesson> {
        // Verify lesson exists and is a coding exercise
        const lesson = await this.findOne(lessonId);
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        if (lesson.lessonType !== LessonType.CODING) {
            throw { status: 400, message: `Lesson with id ${lessonId} is not a coding exercise` };
        }
        
        // Update in a transaction
        return withTransaction(async (tx) => {
            // Update the lesson
            const updatedLesson = await tx.lesson.update({
                where: { id: lessonId },
                data: lessonData
            });
            
            // Update the coding exercise
            await tx.codingExercise.update({
                where: { lessonId },
                data: codingData
            });
            
            return updatedLesson;
        });
    }
    
    /**
     * Create a final test
     */
    async createFinalTest(moduleId: string, lessonData: Omit<Prisma.LessonCreateInput, 'module' | 'lessonType'>, testData: Omit<Prisma.FinalTestLessonCreateInput, 'lesson'>): Promise<Lesson> {
        return withTransaction(async (tx) => {
            // Create the lesson
            const lesson = await tx.lesson.create({
                data: {
                    ...lessonData,
                    lessonType: LessonType.FINAL_TEST,
                    module: {
                        connect: { id: moduleId }
                    }
                }
            });
            
            // Extract questions from testData if they exist
            const { questions, ...testDataWithoutQuestions } = testData as any;
            
            // Create the final test
            await tx.finalTestLesson.create({
                data: {
                    ...testDataWithoutQuestions,
                    lesson: {
                        connect: { id: lesson.id }
                    },
                    // Format questions correctly for Prisma's nested create
                    ...(questions ? {
                        questions: {
                            create: questions.map((question: any) => ({
                                content: question.content,
                                order: question.order,
                                answers: {
                                    create: question.answers.map((answer: any) => ({
                                        content: answer.content,
                                        isCorrect: answer.isCorrect
                                    }))
                                }
                            }))
                        }
                    } : {})
                }
            });
            
            return lesson;
        });
    }
    
    /**
     * Update a final test
     */
    async updateFinalTest(lessonId: string, lessonData: Omit<Prisma.LessonUpdateInput, 'module' | 'lessonType'>, testData: Omit<Prisma.FinalTestLessonUpdateInput, 'lesson'>): Promise<Lesson> {
        // Verify lesson exists and is a final test
        const lesson = await this.findOne(lessonId);
        
        if (!lesson) {
            throw { status: 404, message: `Lesson with id ${lessonId} not found` };
        }
        
        if (lesson.lessonType !== LessonType.FINAL_TEST) {
            throw { status: 400, message: `Lesson with id ${lessonId} is not a final test` };
        }
        
        // Update in a transaction
        return withTransaction(async (tx) => {
            // Update the lesson
            const updatedLesson = await tx.lesson.update({
                where: { id: lessonId },
                data: lessonData
            });
            
            // Get the final test ID
            const finalTest = await tx.finalTestLesson.findUnique({
                where: { lessonId },
                select: { id: true }
            });
            
            if (!finalTest) {
                throw { status: 404, message: `Final test for lesson ${lessonId} not found` };
            }
            
            // Extract questions from testData if they exist
            const { questions, ...testDataWithoutQuestions } = testData as any;
            
            // Update the final test basic data
            await tx.finalTestLesson.update({
                where: { lessonId },
                data: testDataWithoutQuestions
            });
            
            // Handle questions update if provided
            if (questions && Array.isArray(questions)) {
                // Delete existing questions and answers
                const existingQuestions = await tx.question.findMany({
                    where: { testId: finalTest.id },
                    select: { id: true }
                });
                
                // Delete all answers for existing questions
                for (const question of existingQuestions) {
                    await tx.answer.deleteMany({
                        where: { questionId: question.id }
                    });
                }
                
                // Delete all existing questions
                await tx.question.deleteMany({
                    where: { testId: finalTest.id }
                });
                
                // Create new questions and answers
                for (const question of questions) {
                    const newQuestion = await tx.question.create({
                        data: {
                            content: question.content,
                            order: question.order,
                            test: {
                                connect: { id: finalTest.id }
                            }
                        }
                    });
                    
                    // Create answers for this question
                    if (question.answers && Array.isArray(question.answers)) {
                        for (const answer of question.answers) {
                            await tx.answer.create({
                                data: {
                                    content: answer.content,
                                    isCorrect: answer.isCorrect,
                                    question: {
                                        connect: { id: newQuestion.id }
                                    }
                                }
                            });
                        }
                    }
                }
            }
            
            return updatedLesson;
        });
    }
    
    /**
     * Add a question to a final test
     */
    async addQuestion(finalTestId: string, questionData: Omit<Prisma.QuestionCreateInput, 'test'>, answers: Omit<Prisma.AnswerCreateInput, 'question'>[]): Promise<Question> {
        // Verify final test exists
        const finalTest = await prisma.finalTestLesson.findUnique({
            where: { id: finalTestId }
        });
        
        if (!finalTest) {
            throw { status: 404, message: `Final test with id ${finalTestId} not found` };
        }
        
        // Get highest question order
        const highestOrderQuestion = await prisma.question.findFirst({
            where: { testId: finalTestId },
            orderBy: { order: 'desc' }
        });
        
        const newOrder = highestOrderQuestion ? highestOrderQuestion.order + 1 : 1;
        
        // Create question with its answers in a transaction
        return withTransaction(async (tx) => {
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
    
    /**
     * Update a question
     */
    async updateQuestion(questionId: string, questionData: Omit<Prisma.QuestionUpdateInput, 'test'>): Promise<Question> {
        // Verify question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        
        if (!question) {
            throw { status: 404, message: `Question with id ${questionId} not found` };
        }
        
        return withTransaction(async (tx) => {
            return tx.question.update({
                where: { id: questionId },
                data: questionData
            });
        });
    }
    
    /**
     * Delete a question and its answers
     */
    async deleteQuestion(questionId: string): Promise<void> {
        // Verify question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { answers: true }
        });
        
        if (!question) {
            throw { status: 404, message: `Question with id ${questionId} not found` };
        }
        
        // Delete in a transaction
        await withTransaction(async (tx) => {
            // Delete answers
            await tx.answer.deleteMany({
                where: { questionId }
            });
            
            // Delete question
            await tx.question.delete({
                where: { id: questionId }
            });
        });
    }
    
    /**
     * Add an answer to a question
     */
    async addAnswer(questionId: string, answerData: Omit<Prisma.AnswerCreateInput, 'question'>): Promise<any> {
        // Verify question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        
        if (!question) {
            throw { status: 404, message: `Question with id ${questionId} not found` };
        }
        
        return withTransaction(async (tx) => {
            return tx.answer.create({
                data: {
                    ...answerData,
                    question: {
                        connect: { id: questionId }
                    }
                }
            });
        });
    }
    
    /**
     * Update an answer
     */
    async updateAnswer(answerId: string, answerData: Omit<Prisma.AnswerUpdateInput, 'question'>): Promise<any> {
        // Verify answer exists
        const answer = await prisma.answer.findUnique({
            where: { id: answerId }
        });
        
        if (!answer) {
            throw { status: 404, message: `Answer with id ${answerId} not found` };
        }
        
        return withTransaction(async (tx) => {
            return tx.answer.update({
                where: { id: answerId },
                data: answerData
            });
        });
    }
    
    /**
     * Delete an answer
     */
    async deleteAnswer(answerId: string): Promise<void> {
        // Verify answer exists
        const answer = await prisma.answer.findUnique({
            where: { id: answerId }
        });
        
        if (!answer) {
            throw { status: 404, message: `Answer with id ${answerId} not found` };
        }
        
        await withTransaction(async (tx) => {
            await tx.answer.delete({
                where: { id: answerId }
            });
        });
    }
    
    /**
     * Find a lesson with all related content
     */
    async findWithRelatedContent(lessonId: string): Promise<any> {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: true,
                video: true,
                coding: true,
                finalTest: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                answers: true
                            }
                        }
                    }
                }
            }
        });
        
        return lesson;
    }
}

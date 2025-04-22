import { PrismaClient } from '@prisma/client';

export class CodingSubmissionService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async submitCode(learnerId: string, lessonId: string, submittedCode: string) {
        try {
            // First check if the coding exercise exists
            const codingExercise = await this.prisma.codingExercise.findUnique({
                where: {
                    lessonId: lessonId
                }
            });

            if (!codingExercise) {
                throw new Error('Coding exercise not found');
            }

            const submission = await this.prisma.submittedCodingExercise.upsert({
                where: {
                    learnerId_codingExerciseId: {
                        learnerId,
                        codingExerciseId: codingExercise.id
                    }
                },
                update: {
                    submittedCode,
                    submittedAt: new Date()
                },
                create: {
                    learnerId,
                    codingExerciseId: codingExercise.id,
                    submittedCode,
                    submittedAt: new Date()
                }
            });

            return submission;
        } catch (error) {
            console.error('Error in submitCode service:', error);
            throw error;
        }
    }

    async getSubmission(learnerId: string, lessonId: string) {
        try {
            // First get the coding exercise
            const codingExercise = await this.prisma.codingExercise.findUnique({
                where: {
                    lessonId: lessonId
                }
            });

            if (!codingExercise) {
                return null;
            }

            const submission = await this.prisma.submittedCodingExercise.findUnique({
                where: {
                    learnerId_codingExerciseId: {
                        learnerId,
                        codingExerciseId: codingExercise.id
                    }
                }
            });

            return submission;
        } catch (error) {
            console.error('Error in getSubmission service:', error);
            throw error;
        }
    }

    async getAllSubmissionsByExercise(lessonId: string) {
        try {
            // First get the coding exercise
            const codingExercise = await this.prisma.codingExercise.findUnique({
                where: {
                    lessonId: lessonId
                }
            });

            if (!codingExercise) {
                return [];
            }

            const submissions = await this.prisma.submittedCodingExercise.findMany({
                where: {
                    codingExerciseId: codingExercise.id
                },
                include: {
                    learner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            return submissions;
        } catch (error) {
            console.error('Error in getAllSubmissionsByExercise service:', error);
            throw error;
        }
    }
} 
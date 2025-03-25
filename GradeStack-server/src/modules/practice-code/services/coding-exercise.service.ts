import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CodingExerciseService {
    async getCodingExerciseByLessonId(lessonId: string) {
        try {
            const codingExercise = await prisma.codingExercise.findUnique({
                where: { lessonId },
                include: {
                    lesson: {
                        select: {
                            title: true,
                            description: true,
                            moduleId: true,
                            module: {
                                select: {
                                    title: true,
                                    courseId: true,
                                    course: {
                                        select: {
                                            title: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!codingExercise) {
                return null;
            }

            return {
                id: codingExercise.id,
                language: codingExercise.language,
                problem: codingExercise.problem,
                hint: codingExercise.hint,
                codeSnippet: codingExercise.codeSnippet,
                solution: codingExercise.solution,
                lesson: {
                    title: codingExercise.lesson.title,
                    description: codingExercise.lesson.description,
                    module: {
                        title: codingExercise.lesson.module.title,
                        course: {
                            title: codingExercise.lesson.module.course.title
                        }
                    }
                }
            };
        } catch (error) {
            console.error('Error fetching coding exercise:', error);
            throw error;
        }
    }

    async getAllCodingExercises() {
        try {
            const codingExercises = await prisma.codingExercise.findMany({
                include: {
                    lesson: {
                        select: {
                            title: true,
                            moduleId: true,
                            module: {
                                select: {
                                    title: true,
                                    courseId: true,
                                    course: {
                                        select: {
                                            title: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    lesson: {
                        module: {
                            order: 'asc'
                        }
                    }
                }
            });

            return codingExercises.map(exercise => ({
                id: exercise.id,
                language: exercise.language,
                lesson: {
                    title: exercise.lesson.title,
                    module: {
                        title: exercise.lesson.module.title,
                        course: {
                            title: exercise.lesson.module.course.title
                        }
                    }
                }
            }));
        } catch (error) {
            console.error('Error fetching all coding exercises:', error);
            throw error;
        }
    }
} 
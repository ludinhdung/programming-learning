import { CourseBaseService, CourseWithRelations } from '../../../shared/base/domain-services/course-base.service';
import { Course, Prisma, PrismaClient, SupportedLanguage } from '@prisma/client';
import { withTransaction } from '../../../shared/utils/transaction.utils';

const prisma = new PrismaClient();

interface FindCoursesParams {
    topicId?: string;
    instructorId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    select?: string;
}
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
    async findCourses({
        topicId,
        instructorId,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
        select
    }: FindCoursesParams) {
        const skip = (page - 1) * limit;

        // Build filter criteria
        const where: any = {
            isPublished: true, // Only return published courses
        };

        if (instructorId) {
            where.instructorId = instructorId;
        }

        if (topicId) {
            where.CourseTopic = {
                some: {
                    topicId
                }
            };
        }

        // Handle search parameter for course title
        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive' // Case insensitive search
            };
        }

        // Get total count for pagination metadata
        const totalCount = await prisma.course.count({ where });

        // Determine what to include based on select parameter
        let includeInstructor = true;
        let includeCourseTopic = true;

        // If select parameter exists, check what fields are requested
        if (select) {
            const fields = select.split(',');
            includeInstructor = fields.some(field => field.startsWith('instructor'));
            includeCourseTopic = fields.some(field => field.startsWith('CourseTopic'));
        }

        // Build include object dynamically
        const include: any = {};

        if (includeInstructor) {
            include.instructor = {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            };
        }

        if (includeCourseTopic) {
            include.CourseTopic = {
                include: {
                    topic: true
                }
            };
        }

        // Fetch courses with filtering and pagination
        const courses = await prisma.course.findMany({
            where,
            include: Object.keys(include).length > 0 ? include : undefined,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            }
        });

        return {
            data: courses,
            meta: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }
    
    // Course-specific business logic
    async createCourse(instructorId: string, validatedData: any): Promise<Course> {
        // 1. Verify instructor exists
        const instructor = await this.verifyInstructorExists(instructorId);
        
        // 2. Extract and validate data
        const { topicIds, modules, thumbnailUrl, ...courseBasicData } = validatedData;
        await this.validateTopics(topicIds);
        
        // 3. Prepare course data
        const courseData: Prisma.CourseUncheckedCreateInput = {
            ...courseBasicData,
            thumbnail: thumbnailUrl,
            instructorId: instructorId
        };
        
        // 4. Create course and related entities in a transaction
        return withTransaction(async (tx) => {
            // Create the course
            const course = await tx.course.create({ data: courseData });
            
            // Create topic connections
            await this.createTopicConnections(tx, course.id, topicIds);
            
            // Create modules and lessons if provided
            if (modules?.length > 0) {
                await this.createModulesAndLessons(tx, course.id, modules);
            }
            return course;
        });
    }
    
    // Helper methods for createCourse
    
    private async verifyInstructorExists(instructorId: string) {
        const instructor = await prisma.instructor.findUnique({
            where: { userId: instructorId }
        });
        
        if (!instructor) {
            throw { status: 404, message: `Instructor with id ${instructorId} not found` };
        }
        
        return instructor;
    }
    
    private async validateTopics(topicIds: string[]) {
        // Verify that topics are provided
        if (!topicIds || topicIds.length === 0) {
            throw { status: 400, message: 'Khóa học phải có ít nhất một chủ đề' };
        }
        
        // Check if all topics exist
        const topicsCount = await prisma.topic.count({
            where: { id: { in: topicIds } }
        });
        
        if (topicsCount !== topicIds.length) {
            throw { status: 400, message: 'Một hoặc nhiều chủ đề không tồn tại' };
        }
    }
    
    private async createTopicConnections(tx: any, courseId: string, topicIds: string[]) {
        if (!topicIds?.length) return;
        
        for (const topicId of topicIds) {
            await tx.courseTopic.create({
                data: {
                    course: { connect: { id: courseId } },
                    topic: { connect: { id: topicId } }
                }
            });
        }
    }
    
    private async createModulesAndLessons(tx: any, courseId: string, modules: any[]) {
        for (const moduleData of modules) {
            const { lessons, ...moduleRestData } = moduleData;
            
            // Create module
            const createdModule = await tx.module.create({
                data: {
                    ...moduleRestData,
                    course: { connect: { id: courseId } }
                }
            });
            
            // Create lessons if provided
            if (lessons?.length > 0) {
                await this.createLessons(tx, createdModule.id, lessons);
            }
        }
    }
    
    private async createLessons(tx: any, moduleId: string, lessons: any[]) {
        for (const lessonData of lessons) {
            // Extract video information
            const { videoUrl, thumbnailUrl, videoDuration } = this.extractVideoInfo(lessonData);
            
            // Prepare lesson data
            const { videoData, videoUrl: _, thumbnailUrl: __, videoDuration: ___, 
                    exerciseContent, solution, language, hint, codeSnippet, questions, 
                    estimatedDuration, passingScore, ...lessonRestData } = lessonData;
            
            // Create the lesson
            const createdLesson = await tx.lesson.create({
                data: {
                    ...lessonRestData,
                    module: { connect: { id: moduleId } }
                }
            });
            
            // Create type-specific content based on lesson type
            await this.createLessonContent(
                tx, 
                createdLesson.id, 
                lessonData.lessonType, 
                { 
                    videoUrl, 
                    thumbnailUrl, 
                    videoDuration, 
                    exerciseContent, 
                    solution, 
                    language: lessonData.language || language, 
                    hint, 
                    codeSnippet, 
                    questions, 
                    estimatedDuration: lessonData.estimatedDuration, 
                    passingScore: lessonData.passingScore 
                }
            );
        }
    }
    
    private extractVideoInfo(lessonData: any) {
        let videoUrl, thumbnailUrl, videoDuration;
        
        if (lessonData.videoData) {
            // Extract from videoData object if provided
            videoUrl = lessonData.videoData.videoUrl;
            thumbnailUrl = lessonData.videoData.thumbnailUrl;
            videoDuration = lessonData.videoData.duration;
        } else {
            // Use direct fields if videoData not provided
            videoUrl = lessonData.videoUrl;
            thumbnailUrl = lessonData.thumbnailUrl;
            videoDuration = lessonData.videoDuration;
        }
        
        return { videoUrl, thumbnailUrl, videoDuration };
    }
    
    private async createLessonContent(
        tx: any, 
        lessonId: string, 
        lessonType: string, 
        content: { 
            videoUrl?: string, 
            thumbnailUrl?: string, 
            videoDuration?: number,
            exerciseContent?: string,
            solution?: string,
            language?: SupportedLanguage,
            hint?: string,
            codeSnippet?: string,
            questions?: any[],
            estimatedDuration?: number,
            passingScore?: number
        }
    ) {
        const { videoUrl, thumbnailUrl, videoDuration, exerciseContent, solution, language, hint, codeSnippet, questions, estimatedDuration, passingScore } = content;
        
        if (lessonType === 'VIDEO' && videoUrl) {
            await this.createVideoLesson(tx, lessonId, videoUrl, thumbnailUrl, videoDuration);
        } else if (lessonType === 'CODING' && exerciseContent) {
            await this.createCodingExercise(tx, lessonId, exerciseContent, solution, language, hint, codeSnippet);
        } else if (lessonType === 'FINAL_TEST' && questions) {
            await this.createFinalTest(tx, lessonId, questions, estimatedDuration, passingScore);
        }
    }
    
    private async createVideoLesson(tx: any, lessonId: string, videoUrl: string, thumbnailUrl?: string, videoDuration?: number) {
        await tx.videoLesson.create({
            data: {
                url: videoUrl,
                thumbnailUrl: thumbnailUrl || null,
                duration: videoDuration || 0,
                lesson: { connect: { id: lessonId } }
            }
        });
    }
    
    private async createCodingExercise(tx: any, lessonId: string, exerciseContent: string, solution?: string, language?: SupportedLanguage, hint?: string, codeSnippet?: string) {
        if (!language) {
            // Set a default language if none provided
            language = 'PYTHON';
        }
        
        await tx.codingExercise.create({
            data: {
                problem: exerciseContent,
                language: language,
                solution: solution || '',
                hint: hint || '',
                codeSnippet: codeSnippet || '',
                lesson: { connect: { id: lessonId } }
            }
        });
    }
    
    private async createFinalTest(tx: any, lessonId: string, questions: any[], estimatedDuration?: number, passingScore?: number) {
        // Create the final test
        const finalTest = await tx.finalTestLesson.create({
            data: {
                estimatedDuration: estimatedDuration || 30,
                passingScore: passingScore || 70,
                lesson: { connect: { id: lessonId } }
            }
        });
        
        // Create questions for the test if provided
        if (Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const questionData = questions[i];
                const order = questionData.order || i + 1;
                
                // Create the question
                const question = await tx.question.create({
                    data: {
                        content: questionData.content,
                        order: order,
                        test: { connect: { id: finalTest.id } }
                    }
                });
                
                // Create answers for the question if provided
                if (Array.isArray(questionData.answers)) {
                    for (const answerData of questionData.answers) {
                        await tx.answer.create({
                            data: {
                                content: answerData.content,
                                isCorrect: answerData.isCorrect || false,
                                question: { connect: { id: question.id } }
                            }
                        });
                    }
                }
            }
        }
    }
    
    async publishCourse(courseId: string): Promise<Course> {
        return this.update(courseId, { isPublished: true });
    }
    
    async unpublishCourse(courseId: string): Promise<Course> {
        return this.update(courseId, { isPublished: false });
    }
    
    async getCoursesByInstructor(instructorId: string) {
        return prisma.course.findMany({
            where: {
                instructor: {
                    userId: instructorId
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                CourseTopic: {
                    include: {
                        topic: true
                    }
                },
                instructor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        EnrolledCourse: true
                    }
                }
            }
        });
    }
    
    async getCourseById(courseId: string, instructorId: string) {
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                instructor: {
                    userId: instructorId
                }
            },
            include: {
                instructor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                },
                modules: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        lessons: {
                            orderBy: {
                                createdAt: 'asc'
                            },
                            include: {
                                video: true,
                                coding: true,
                                finalTest: {
                                    include: {
                                        questions: {
                                            orderBy: {
                                                order: 'asc'
                                            },
                                            include: {
                                                answers: true
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
        
        if (!course) {
            throw { status: 404, message: `Course with id ${courseId} not found or you don't have permission to access it` };
        }
        
        return course;
    }
    
    async updateCourse(instructorId: string, courseId: string, courseData: any) {
        // Verify course exists and belongs to instructor
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                instructor: {
                    userId: instructorId
                }
            }
        });
        
        if (!course) {
            throw { status: 404, message: `Course with id ${courseId} not found or you don't have permission to update it` };
        }
        
        // Extract topicIds data if provided
        const { topicIds, ...restData } = courseData;
        
        // Update course with transaction if topicIds are provided
        if (topicIds) {
            // Verify that all topics exist
            if (topicIds.length > 0) {
                const topicsCount = await prisma.topic.count({
                    where: {
                        id: {
                            in: topicIds
                        }
                    }
                });
                
                if (topicsCount !== topicIds.length) {
                    throw { status: 400, message: 'Một hoặc nhiều chủ đề không tồn tại' };
                }
            }
            
            return withTransaction(async (tx) => {
                // Update course basic data
                const updatedCourse = await tx.course.update({
                    where: { id: courseId },
                    data: restData
                });
                
                // Delete existing topic connections
                await tx.courseTopic.deleteMany({
                    where: { courseId }
                });
                
                // Create new topic connections
                if (topicIds.length > 0) {
                    for (const topicId of topicIds) {
                        await tx.courseTopic.create({
                            data: {
                                course: { connect: { id: courseId } },
                                topic: { connect: { id: topicId } }
                            }
                        });
                    }
                }
                
                // Return updated course with relations
                return tx.course.findUnique({
                    where: { id: courseId },
                    include: {
                        CourseTopic: {
                            include: {
                                topic: true
                            }
                        },
                        modules: {
                            orderBy: { order: 'asc' }
                        }
                    }
                });
            });
        } else {
            // Just update course without modifying topics
            return prisma.course.update({
                where: { id: courseId },
                data: restData,
                include: {
                    CourseTopic: {
                        include: {
                            topic: true
                        }
                    },
                    modules: {
                        orderBy: { order: 'asc' }
                    }
                }
            });
        }
    }
    
    async deleteCourse(instructorId: string, courseId: string) {
        // Verify course exists and belongs to instructor
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                instructor: {
                    userId: instructorId
                }
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
                }
            }
        });
        
        if (!course) {
            throw { status: 404, message: `Course with id ${courseId} not found or you don't have permission to delete it` };
        }
        
        // Delete all related data in a transaction
        return withTransaction(async (tx) => {
            // Cascade delete all related entities
            for (const module of course.modules) {
                for (const lesson of module.lessons) {
                    // Delete comments and notes for the lesson
                    await tx.comment.deleteMany({
                        where: { lessonId: lesson.id }
                    });
                    
                    await tx.note.deleteMany({
                        where: { lessonId: lesson.id }
                    });
                    
                    // Delete lesson-specific content
                    if (lesson.video) {
                        await tx.videoLesson.delete({
                            where: { id: lesson.video.id }
                        });
                    }
                    
                    if (lesson.coding) {
                        await tx.submittedCodingExercise.deleteMany({
                            where: { codingExerciseId: lesson.coding.id }
                        });
                        
                        await tx.codingExercise.delete({
                            where: { id: lesson.coding.id }
                        });
                    }
                    
                    if (lesson.finalTest) {
                        // Delete submitted tests
                        await tx.submittedFinalTest.deleteMany({
                            where: { finalTestId: lesson.finalTest.id }
                        });
                        
                        // Delete answers and questions
                        for (const question of lesson.finalTest.questions) {
                            await tx.answer.deleteMany({
                                where: { questionId: question.id }
                            });
                        }
                        
                        await tx.question.deleteMany({
                            where: { testId: lesson.finalTest.id }
                        });
                        
                        await tx.finalTestLesson.delete({
                            where: { id: lesson.finalTest.id }
                        });
                    }
                    
                    // Delete the lesson
                    await tx.lesson.delete({
                        where: { id: lesson.id }
                    });
                }
                
                // Delete the module
                await tx.module.delete({
                    where: { id: module.id }
                });
            }
            
            // Delete course-topic connections
            await tx.courseTopic.deleteMany({
                where: { courseId }
            });
            
            // Delete enrollments, bookmarks, feedback, certificates
            await tx.enrolledCourse.deleteMany({
                where: { courseId }
            });
            
            await tx.bookmark.deleteMany({
                where: { courseId }
            });
            
            await tx.courseFeedback.deleteMany({
                where: { courseId }
            });
            
            await tx.certificate.deleteMany({
                where: { courseId }
            });
            
            await tx.purchaseHistory.deleteMany({
                where: { courseId }
            });
            
            // Finally delete the course
            return tx.course.delete({
                where: { id: courseId }
            });
        });
    }
    
    async getFullRelationCourses(instructorId: string) {
        return prisma.course.findMany({
            where: {
                instructor: {
                    userId: instructorId
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                instructor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                },
                modules: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        lessons: {
                            orderBy: {
                                createdAt: 'desc'
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
                        }
                    }
                },
                _count: {
                    select: {
                        EnrolledCourse: true
                    }
                }
            }
        });
    }
}

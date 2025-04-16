import { PrismaClient, Role, LessonType, SupportedLanguage, TransactionType, TransactionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // Clear existing data
    await clearDatabase();

    // Create users
    const adminUser = await createUser({
        email: 'admin@gradestack.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'admin123',
        role: Role.ADMIN,
        isVerified: true,
    });

    const instructorUser = await createUser({
        email: 'instructor@gradestack.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'instructor123',
        role: Role.INSTRUCTOR,
        isVerified: true,
    });

    const learnerUser = await createUser({
        email: 'learner@gradestack.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'learner123',
        role: Role.LEARNER,
        isVerified: true,
    });

    // Create instructor profile
    const instructor = await createInstructor({
        userId: instructorUser.id,
        organization: 'Tech Academy',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'Experienced software developer with 10+ years of experience in web development.',
        socials: ['https://twitter.com/johndoe', 'https://github.com/johndoe'],
    });

    // Create wallet for instructor
    const wallet = await createWallet({
        instructorId: instructor.userId,
        balance: 1000.00,
    });

    // Create topics
    const topics = await createTopics();

    // Create courses
    const courses = await createCourses(instructor, topics);

    // Create modules and lessons for each course
    for (const course of courses) {
        await createModulesAndLessons(course);
    }

    // Create learning paths
    const learningPaths = await createLearningPaths(instructor, courses);

    // Create workshops
    const workshops = await createWorkshops(instructor);

    // Create enrollments and bookmarks
    await createEnrollmentsAndBookmarks(learnerUser, courses);

    // Create transactions
    await createTransactions(wallet);

    console.log('Seeding completed successfully!');
}

async function clearDatabase() {
    console.log('Clearing existing data...');

    // Delete in reverse order of dependencies
    await prisma.certificate.deleteMany();
    await prisma.submittedFinalTest.deleteMany();
    await prisma.submittedCodingExercise.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.workshop.deleteMany();
    await prisma.learningPathCourse.deleteMany();
    await prisma.learningPath.deleteMany();
    await prisma.courseTopic.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.enrolledCourse.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.courseFeedback.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.purchaseHistory.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.finalTestLesson.deleteMany();
    await prisma.codingExercise.deleteMany();
    await prisma.videoLesson.deleteMany();
    await prisma.note.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.instructor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.order.deleteMany();
}

async function createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: Role;
    isVerified: boolean;
}) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
        },
    });
}

async function createInstructor(data: {
    userId: string;
    organization: string;
    avatar?: string;
    bio?: string;
    socials: string[];
}) {
    return prisma.instructor.create({
        data,
    });
}

async function createWallet(data: {
    instructorId: string;
    balance: number;
}) {
    return prisma.wallet.create({
        data: {
            ...data,
            balance: data.balance,
        },
    });
}

async function createTopics() {
    const topics = [
        { name: 'Web Development', description: 'Learn how to build modern web applications' },
        { name: 'Mobile Development', description: 'Create mobile apps for iOS and Android' },
        { name: 'Data Science', description: 'Analyze data and build machine learning models' },
        { name: 'DevOps', description: 'Learn about continuous integration and deployment' },
        { name: 'Cybersecurity', description: 'Protect systems and data from cyber threats' },
    ];

    const createdTopics = [];
    for (const topic of topics) {
        const createdTopic = await prisma.topic.create({
            data: {
                ...topic,
                thumbnail: `https://source.unsplash.com/random/300x200/?${topic.name.replace(' ', '')}`,
            },
        });
        createdTopics.push(createdTopic);
    }

    return createdTopics;
}

async function createCourses(instructor: any, topics: any[]) {
    const courses = [
        {
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
            price: 49.99,
            duration: 1200, // 20 hours in minutes
            thumbnail: 'https://source.unsplash.com/random/800x600/?webdevelopment',
            isPublished: true,
        },
        {
            title: 'Advanced JavaScript',
            description: 'Master JavaScript with advanced concepts like closures, promises, and async/await.',
            price: 79.99,
            duration: 1800, // 30 hours in minutes
            thumbnail: 'https://source.unsplash.com/random/800x600/?javascript',
            isPublished: true,
        },
        {
            title: 'React Fundamentals',
            description: 'Build modern user interfaces with React.js and Redux.',
            price: 99.99,
            duration: 2400, // 40 hours in minutes
            thumbnail: 'https://source.unsplash.com/random/800x600/?react',
            isPublished: true,
        },
    ];

    const createdCourses = [];
    for (const course of courses) {
        const createdCourse = await prisma.course.create({
            data: {
                ...course,
                instructorId: instructor.userId,
            },
        });

        // Assign random topics to each course
        const randomTopics = topics.sort(() => 0.5 - Math.random()).slice(0, 2);
        for (const topic of randomTopics) {
            await prisma.courseTopic.create({
                data: {
                    courseId: createdCourse.id,
                    topicId: topic.id,
                },
            });
        }

        createdCourses.push(createdCourse);
    }

    return createdCourses;
}

async function createModulesAndLessons(course: any) {
    const modules = [
        {
            title: 'Getting Started',
            description: 'Introduction to the course and basic concepts',
            order: 1,
        },
        {
            title: 'Core Concepts',
            description: 'Learn the fundamental concepts and principles',
            order: 2,
        },
        {
            title: 'Advanced Topics',
            description: 'Explore advanced features and techniques',
            order: 3,
        },
    ];

    for (const moduleData of modules) {
        const createdModule = await prisma.module.create({
            data: {
                ...moduleData,
                courseId: course.id,
                videoUrl: 'https://example.com/video.mp4',
                thumbnailUrl: 'https://source.unsplash.com/random/800x600/?coding',
                videoDuration: 600, // 10 minutes in seconds
            },
        });

        // Create lessons for each module
        await createLessons(createdModule);
    }
}

async function createLessons(module: any) {
    const lessons = [
        {
            title: 'Introduction',
            description: 'Welcome to the course and what you will learn',
            lessonType: LessonType.VIDEO,
            duration: 600, // 10 minutes in seconds
            isPreview: true,
            order: 1,
        },
        {
            title: 'Basic Concepts',
            description: 'Understanding the basic concepts and terminology',
            lessonType: LessonType.VIDEO,
            duration: 900, // 15 minutes in seconds
            isPreview: true,
            order: 2,
        },
        {
            title: 'Hands-on Exercise',
            description: 'Practice what you learned with a coding exercise',
            lessonType: LessonType.CODING,
            duration: 1200, // 20 minutes in seconds
            isPreview: false,
            order: 3,
        },
        {
            title: 'Final Assessment',
            description: 'Test your knowledge with a final assessment',
            lessonType: LessonType.FINAL_TEST,
            duration: 1800, // 30 minutes in seconds
            isPreview: false,
            order: 4,
        },
    ];

    for (const lessonData of lessons) {
        const createdLesson = await prisma.lesson.create({
            data: {
                ...lessonData,
                moduleId: module.id,
            },
        });

        // Create specific lesson type
        if (lessonData.lessonType === LessonType.VIDEO) {
            await createVideoLesson(createdLesson);
        } else if (lessonData.lessonType === LessonType.CODING) {
            await createCodingExercise(createdLesson);
        } else if (lessonData.lessonType === LessonType.FINAL_TEST) {
            await createFinalTest(createdLesson);
        }
    }
}

async function createVideoLesson(lesson: any) {
    await prisma.videoLesson.create({
        data: {
            lessonId: lesson.id,
            url: 'https://example.com/video.mp4',
            thumbnailUrl: 'https://source.unsplash.com/random/800x600/?coding',
            duration: lesson.duration || 600,
        },
    });
}

async function createCodingExercise(lesson: any) {
    const codingExercise = await prisma.codingExercise.create({
        data: {
            lessonId: lesson.id,
            language: SupportedLanguage.JAVA,
            problem: 'Write a function that reverses a string without using the built-in reverse method.',
            hint: 'Think about using a loop to build a new string character by character.',
            solution: 'public String reverseString(String s) {\n  StringBuilder result = new StringBuilder();\n  for (int i = s.length() - 1; i >= 0; i--) {\n    result.append(s.charAt(i));\n  }\n  return result.toString();\n}',
            codeSnippet: 'public String reverseString(String s) {\n  // Your code here\n}',
        },
    });

    return codingExercise;
}

async function createFinalTest(lesson: any) {
    const finalTest = await prisma.finalTestLesson.create({
        data: {
            lessonId: lesson.id,
            estimatedDuration: lesson.duration || 1800,
            passingScore: 70,
        },
    });

    // Create questions for the final test
    const questions = [
        {
            content: 'What is the correct way to declare a variable in JavaScript?',
            order: 1,
            answers: [
                { content: 'var x = 10;', isCorrect: true },
                { content: 'variable x = 10;', isCorrect: false },
                { content: 'x = 10;', isCorrect: false },
                { content: 'const x = 10;', isCorrect: true },
            ],
        },
        {
            content: 'Which of the following is not a JavaScript data type?',
            order: 2,
            answers: [
                { content: 'String', isCorrect: false },
                { content: 'Boolean', isCorrect: false },
                { content: 'Integer', isCorrect: true },
                { content: 'Object', isCorrect: false },
            ],
        },
        {
            content: 'What does the "this" keyword refer to in JavaScript?',
            order: 3,
            answers: [
                { content: 'The function itself', isCorrect: false },
                { content: 'The global object', isCorrect: false },
                { content: 'The object that owns the current code', isCorrect: true },
                { content: 'The parent object', isCorrect: false },
            ],
        },
    ];

    for (const questionData of questions) {
        const { answers, ...questionFields } = questionData;
        const question = await prisma.question.create({
            data: {
                ...questionFields,
                testId: finalTest.id,
            },
        });

        // Create answers for the question
        for (const answerData of answers) {
            await prisma.answer.create({
                data: {
                    ...answerData,
                    questionId: question.id,
                },
            });
        }
    }

    return finalTest;
}

async function createLearningPaths(instructor: any, courses: any[]) {
    const learningPaths = [
        {
            title: 'Web Development Bootcamp',
            description: 'Complete path to become a full-stack web developer',
            thumbnail: 'https://source.unsplash.com/random/800x600/?webdevelopment',
            estimatedCompletionTime: 120, // 120 hours
        },
        {
            title: 'Frontend Developer Path',
            description: 'Master frontend technologies and frameworks',
            thumbnail: 'https://source.unsplash.com/random/800x600/?frontend',
            estimatedCompletionTime: 80, // 80 hours
        },
    ];

    const createdLearningPaths = [];
    for (const learningPathData of learningPaths) {
        const createdLearningPath = await prisma.learningPath.create({
            data: {
                ...learningPathData,
                instructorUserId: instructor.userId,
            },
        });

        // Add courses to the learning path
        for (let i = 0; i < courses.length; i++) {
            await prisma.learningPathCourse.create({
                data: {
                    learningPathId: createdLearningPath.id,
                    courseId: courses[i].id,
                    order: i + 1,
                },
            });
        }

        createdLearningPaths.push(createdLearningPath);
    }

    return createdLearningPaths;
}

async function createWorkshops(instructor: any) {
    const workshops = [
        {
            title: 'Advanced JavaScript Workshop',
            description: 'Deep dive into advanced JavaScript concepts',
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            duration: 120, // 2 hours
        },
        {
            title: 'React Best Practices',
            description: 'Learn the best practices for building React applications',
            scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            duration: 90, // 1.5 hours
        },
    ];

    const createdWorkshops = [];
    for (const workshopData of workshops) {
        const createdWorkshop = await prisma.workshop.create({
            data: {
                ...workshopData,
                instructorId: instructor.userId,
            },
        });
        createdWorkshops.push(createdWorkshop);
    }

    return createdWorkshops;
}

async function createEnrollmentsAndBookmarks(learner: any, courses: any[]) {
    // Enroll the learner in all courses
    for (const course of courses) {
        await prisma.enrolledCourse.create({
            data: {
                learnerId: learner.id,
                courseId: course.id,
                progress: Math.floor(Math.random() * 100),
            },
        });

        // Create a bookmark for some courses
        if (Math.random() > 0.5) {
            await prisma.bookmark.create({
                data: {
                    learnerId: learner.id,
                    courseId: course.id,
                },
            });
        }

        // Create a purchase history for some courses
        if (Math.random() > 0.3) {
            await prisma.purchaseHistory.create({
                data: {
                    learnerId: learner.id,
                    courseId: course.id,
                    price: course.price,
                },
            });
        }

        // Create a course feedback for some courses
        if (Math.random() > 0.4) {
            await prisma.courseFeedback.create({
                data: {
                    learnerId: learner.id,
                    courseId: course.id,
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
                    comment: 'Great course! I learned a lot.',
                },
            });
        }
    }
}

async function createTransactions(wallet: any) {
    const transactions = [
        {
            amount: 500.00,
            type: TransactionType.REVENUE,
            status: TransactionStatus.APPROVED,
        },
        {
            amount: 300.00,
            type: TransactionType.WITHDRAWAL,
            status: TransactionStatus.PENDING,
        },
        {
            amount: 200.00,
            type: TransactionType.REVENUE,
            status: TransactionStatus.APPROVED,
        },
    ];

    for (const transactionData of transactions) {
        await prisma.transaction.create({
            data: {
                ...transactionData,
                walletId: wallet.id,
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 
import { PrismaClient, Role, LessonType, SupportedLanguage, TransactionType, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create users
    const learner = await prisma.user.create({
        data: {
            email: 'learner@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'hashedpassword', // Ensure this is a hashed password
            role: Role.LEARNER,
        },
    });

    const instructor = await prisma.user.create({
        data: {
            email: 'instructor@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            password: 'hashedpassword', // Ensure this is a hashed password
            role: Role.INSTRUCTOR,
        },
    });

    // Create instructor profile
    const instructorProfile = await prisma.instructor.create({
        data: {
            userId: instructor.id,
            organization: 'Tech University',
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Experienced instructor in software development.',
            socials: ['https://twitter.com/instructor'],
        },
    });

    // Create courses
    const course1 = await prisma.course.create({
        data: {
            title: 'Introduction to Programming',
            description: 'Learn the basics of programming.',
            price: 100.00,
            duration: 120,
            thumbnail: 'https://example.com/thumbnail1.jpg',
            isPublished: true,
            instructorId: instructorProfile.userId,
        },
    });

    const course2 = await prisma.course.create({
        data: {
            title: 'Advanced JavaScript',
            description: 'Deep dive into JavaScript.',
            price: 150.00,
            duration: 180,
            thumbnail: 'https://example.com/thumbnail2.jpg',
            isPublished: true,
            instructorId: instructorProfile.userId,
        },
    });

    // Create modules
    const module1 = await prisma.module.create({
        data: {
            title: 'Module 1',
            description: 'Introduction module',
            order: 1,
            courseId: course1.id,
        },
    });

    // Create lessons
    const lesson1 = await prisma.lesson.create({
        data: {
            title: 'Lesson 1',
            description: 'Introduction to programming concepts',
            lessonType: LessonType.VIDEO,
            duration: 30,
            moduleId: module1.id,
        },
    });

    // Create video lesson
    await prisma.videoLesson.create({
        data: {
            lessonId: lesson1.id,
            url: 'https://example.com/video.mp4',
            duration: 30,
        },
    });

    // Create coding exercise
    const codingExercise = await prisma.codingExercise.create({
        data: {
            lessonId: lesson1.id,
            language: SupportedLanguage.PYTHON,
            problem: `<h1>Write a function that adds two numbers</h1>
      
<p>Write a Python function that takes two numbers as input and returns their sum.</p>

<h2>Example:</h2>
<pre>
Input: a = 5, b = 3
Output: 8
</pre>

<h2>Requirements:</h2>
<ul>
  <li>Function name should be 'add_numbers'</li>
  <li>Take two parameters: a and b</li>
  <li>Return the sum of a and b</li>
</ul>`,
            solution: `def add_numbers(a, b):
    return a + b`,
            hint: 'hint'
        },
    });

    // Create final test lesson
    const finalTestLesson = await prisma.finalTestLesson.create({
        data: {
            lessonId: lesson1.id,
            estimatedDuration: 60,
        },
    });

    // Create questions and answers
    const question = await prisma.question.create({
        data: {
            testId: finalTestLesson.id,
            content: 'What is JavaScript?',
            order: 1,
        },
    });

    await prisma.answer.create({
        data: {
            questionId: question.id,
            content: 'A programming language.',
            isCorrect: true,
        },
    });

    // Create purchase history
    await prisma.purchaseHistory.create({
        data: {
            learnerId: learner.id,
            courseId: course1.id,
            price: 100.00,
        },
    });

    // Create wallet and transaction
    const wallet = await prisma.wallet.create({
        data: {
            instructorId: instructorProfile.userId,
            balance: 500.00,
        },
    });

    await prisma.transaction.create({
        data: {
            walletId: wallet.id,
            amount: 100.00,
            type: TransactionType.REVENUE,
            status: TransactionStatus.APPROVED,
        },
    });

    // Create enrollments
    await prisma.enrolledCourse.create({
        data: {
            learnerId: learner.id,
            courseId: course1.id,
            progress: 50, // Example progress value
        },
    });

    await prisma.enrolledCourse.create({
        data: {
            learnerId: learner.id,
            courseId: course2.id,
            progress: 20, // Example progress value
        },
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
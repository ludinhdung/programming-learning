import { fakerVI as faker } from '@faker-js/faker';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Tạo dữ liệu mẫu cho việc kiểm thử INSTRUCTOR_LEAD
 */
async function createMockData(): Promise<void> {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu...');

    // Tạo người dùng INSTRUCTOR_LEAD
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const instructorLeadUser = await prisma.user.create({
      data: {
        email: 'instructorlead@example.com',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        isVerified: true,
        role: Role.INSTRUCTOR_LEAD,
        Instructor: {
          create: {
            organization: faker.company.name(),
            avatar: faker.image.avatar(),
            bio: faker.person.bio(),
            socials: [faker.internet.url(), faker.internet.url()]
          }
        }
      },
      include: {
        Instructor: true
      }
    });

    console.log(`Đã tạo INSTRUCTOR_LEAD với ID: ${instructorLeadUser.id}`);

    // Tạo một số khóa học mẫu
    const courses = [];
    for (let i = 0; i < 3; i++) {
      const course = await prisma.course.create({
        data: {
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          price: faker.number.float({ min: 100000, max: 1000000 }),
          duration: faker.number.int({ min: 10, max: 50 }),
          thumbnail: faker.image.url(),
          instructorId: instructorLeadUser.Instructor!.userId
        }
      });
      courses.push(course);
      console.log(`Đã tạo khóa học với ID: ${course.id}`);
    }

    // Tạo learning path mẫu
    const learningPath = await prisma.learningPath.create({
      data: {
        title: 'Lộ trình học Full-stack Web Development',
        description: 'Học tất cả những gì bạn cần để trở thành một lập trình viên full-stack',
        thumbnail: faker.image.url(),
        estimatedCompletionTime: faker.number.int({ min: 1000, max: 5000 }),
        instructorUserId: instructorLeadUser.Instructor!.userId,
        courses: {
          create: courses.map((course, index) => ({
            courseId: course.id,
            order: index
          }))
        }
      }
    });

    console.log(`Đã tạo Learning Path với ID: ${learningPath.id}`);

    // Tạo workshop mẫu
    const workshop = await prisma.workshop.create({
      data: {
        title: 'Workshop về ReactJS và NextJS',
        description: 'Học cách xây dựng ứng dụng web hiện đại với ReactJS và NextJS',
        scheduledAt: faker.date.future(),
        duration: 120,
        type: 'FRONTEND',
        instructorId: instructorLeadUser.Instructor!.userId
      }
    });

    console.log(`Đã tạo Workshop với ID: ${workshop.id}`);

    // Tạo người dùng LEARNER
    const learnerUser = await prisma.user.create({
      data: {
        email: 'learner1@example.com',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        isVerified: true,
        role: Role.LEARNER
      }
    });

    console.log(`Đã tạo LEARNER với ID: ${learnerUser.id}`);

    // Tạo đăng ký tham dự workshop
    const attendance = await prisma.attendance.create({
      data: {
        userId: learnerUser.id,
        workshopId: workshop.id
      }
    });

    console.log(`Đã tạo đăng ký tham dự workshop với ID: ${attendance.id}`);

    console.log('Đã hoàn thành tạo dữ liệu mẫu!');
    console.log(`
    Thông tin để cập nhật file instructorlead.rest:
    - instructorLeadId = ${instructorLeadUser.id}
    - learningPathId = ${learningPath.id}
    - workshopId = ${workshop.id}
    - courseId1 = ${courses[0].id}
    - courseId2 = ${courses[1].id}
    `);

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Thực thi hàm tạo dữ liệu mẫu
createMockData();

import { fakerVI as faker } from '@faker-js/faker';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Tạo dữ liệu mẫu cho chủ đề (Topics)
 */
async function createTopicMockData(): Promise<void> {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu cho Topics...');

    // Tạo người dùng INSTRUCTOR_LEAD
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Tạo instructor_lead cho topics
    const instructorLeadUser = await prisma.user.create({
      data: {
        email: 'topic.lead@example.com',
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

    // Tạo instructor thường
    const regularInstructorUser = await prisma.user.create({
      data: {
        email: 'regular.instructor@example.com',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        isVerified: true,
        role: Role.INSTRUCTOR,
        Instructor: {
          create: {
            organization: faker.company.name(),
            avatar: faker.image.avatar(),
            bio: faker.person.bio(),
            socials: [faker.internet.url()]
          }
        }
      },
      include: {
        Instructor: true
      }
    });

    console.log(`Đã tạo INSTRUCTOR thường với ID: ${regularInstructorUser.id}`);

    // Tạo các chủ đề mẫu bởi INSTRUCTOR_LEAD
    const topics = [];
    const topicNames = [
      'Lập trình Web Frontend', 
      'JavaScript nâng cao', 
      'React.js', 
      'Node.js', 
      'Database Design'
    ];
    
    for (let i = 0; i < topicNames.length; i++) {
      const topic = await prisma.topic.create({
        data: {
          name: topicNames[i],
          description: faker.lorem.paragraph(),
          thumbnail: faker.image.url(),
          instructorUserId: instructorLeadUser.Instructor!.userId
        }
      });
      topics.push(topic);
      console.log(`Đã tạo chủ đề "${topicNames[i]}" với ID: ${topic.id}`);
    }

    // Tạo khóa học và liên kết với topics
    const coursesByLeadInstructor = [];
    const courseTitles = [
      'React cho người mới bắt đầu', 
      'NodeJS và Express từ cơ bản đến nâng cao',
      'Xây dựng Single Page Application với React'
    ];
    
    for (let i = 0; i < courseTitles.length; i++) {
      const course = await prisma.course.create({
        data: {
          title: courseTitles[i],
          description: faker.lorem.paragraph(),
          price: faker.number.float({ min: 100000, max: 1000000 }),
          duration: faker.number.int({ min: 10, max: 50 }),
          thumbnail: faker.image.url(),
          instructorId: instructorLeadUser.Instructor!.userId
        }
      });
      coursesByLeadInstructor.push(course);
      console.log(`Đã tạo khóa học "${courseTitles[i]}" với ID: ${course.id}`);
      
      // Liên kết khóa học với các chủ đề phù hợp
      // Khóa học React liên quan đến React.js và Frontend
      if (i === 0 || i === 2) {
        await prisma.courseTopic.create({
          data: {
            courseId: course.id,
            topicId: topics[0].id // Frontend
          }
        });
        
        await prisma.courseTopic.create({
          data: {
            courseId: course.id,
            topicId: topics[2].id // React.js
          }
        });
        
        console.log(`Đã liên kết khóa học "${courseTitles[i]}" với chủ đề Frontend và React.js`);
      }
      
      // Khóa học NodeJS liên quan đến Node.js
      if (i === 1) {
        await prisma.courseTopic.create({
          data: {
            courseId: course.id,
            topicId: topics[3].id // Node.js
          }
        });
        
        console.log(`Đã liên kết khóa học "${courseTitles[i]}" với chủ đề Node.js`);
      }
    }

    // Tạo khóa học bởi instructor thường
    const courseByRegularInstructor = await prisma.course.create({
      data: {
        title: 'Thiết kế cơ sở dữ liệu hiệu quả',
        description: faker.lorem.paragraph(),
        price: faker.number.float({ min: 100000, max: 1000000 }),
        duration: faker.number.int({ min: 10, max: 50 }),
        thumbnail: faker.image.url(),
        instructorId: regularInstructorUser.Instructor!.userId
      }
    });
    
    console.log(`Đã tạo khóa học bởi instructor thường với ID: ${courseByRegularInstructor.id}`);
    
    // Liên kết với chủ đề Database Design
    await prisma.courseTopic.create({
      data: {
        courseId: courseByRegularInstructor.id,
        topicId: topics[4].id // Database Design
      }
    });
    
    console.log(`Đã liên kết khóa học của instructor thường với chủ đề Database Design`);

    console.log('Đã hoàn thành tạo dữ liệu mẫu cho Topics!');
    console.log(`
    Thông tin để cập nhật file topic.rest:
    - instructorLeadId = ${instructorLeadUser.id}
    - regularInstructorId = ${regularInstructorUser.Instructor!.userId}
    - topicId1 (Frontend) = ${topics[0].id}
    - topicId2 (JavaScript) = ${topics[1].id}
    - topicId3 (React) = ${topics[2].id}
    - topicId4 (Node) = ${topics[3].id}
    - topicId5 (Database) = ${topics[4].id}
    - courseId1 = ${coursesByLeadInstructor[0].id}
    - courseId2 = ${coursesByLeadInstructor[1].id}
    - courseId3 = ${coursesByLeadInstructor[2].id}
    - regularCourseId = ${courseByRegularInstructor.id}
    `);

  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu cho Topics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Thực thi hàm tạo dữ liệu mẫu
createTopicMockData(); 
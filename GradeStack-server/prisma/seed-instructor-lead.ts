import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * File seed để tạo dữ liệu mẫu cho 2 instructor lead
 */
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu tạo dữ liệu mẫu cho instructor lead...');

  // Tạo instructor lead 1
  const password1 = await bcrypt.hash('password123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'instructorlead1@example.com' },
    update: {},
    create: {
      email: 'instructorlead1@example.com',
      password: password1,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: Role.INSTRUCTOR_LEAD,
      isVerified: true,
      Instructor: {
        create: {
          organization: 'GradeStack Academy',
          bio: 'Instructor lead với hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến',
          socials: ['https://linkedin.com/in/instructorlead1', 'https://twitter.com/instructorlead1']
        }
      }
    },
    include: {
      Instructor: true
    }
  });

  // Tạo instructor lead 2
  const password2 = await bcrypt.hash('password456', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'instructorlead2@example.com' },
    update: {},
    create: {
      email: 'instructorlead2@example.com',
      password: password2,
      firstName: 'Trần',
      lastName: 'Thị B',
      role: Role.INSTRUCTOR_LEAD,
      isVerified: true,
      Instructor: {
        create: {
          organization: 'GradeStack Institute',
          bio: 'Chuyên gia đào tạo với kinh nghiệm phong phú trong việc phát triển chương trình giảng dạy',
          socials: ['https://linkedin.com/in/instructorlead2', 'https://twitter.com/instructorlead2']
        }
      }
    },
    include: {
      Instructor: true
    }
  });

  // Tạo một số topic mẫu
  const topic1 = await prisma.topic.upsert({
    where: { name: 'Lập trình Web' },
    update: {
      instructorUserId: user1.Instructor?.userId
    },
    create: {
      name: 'Lập trình Web',
      description: 'Các khóa học về phát triển web, bao gồm frontend và backend',
      thumbnail: 'https://example.com/thumbnails/web-programming.jpg',
      instructorUserId: user1.Instructor?.userId
    }
  });

  const topic2 = await prisma.topic.upsert({
    where: { name: 'Trí tuệ nhân tạo' },
    update: {
      instructorUserId: user2.Instructor?.userId
    },
    create: {
      name: 'Trí tuệ nhân tạo',
      description: 'Các khóa học về AI, machine learning và deep learning',
      thumbnail: 'https://example.com/thumbnails/ai.jpg',
      instructorUserId: user2.Instructor?.userId
    }
  });

  const topic3 = await prisma.topic.upsert({
    where: { name: 'Phát triển di động' },
    update: {
      instructorUserId: user1.Instructor?.userId
    },
    create: {
      name: 'Phát triển di động',
      description: 'Các khóa học về phát triển ứng dụng di động cho iOS và Android',
      thumbnail: 'https://example.com/thumbnails/mobile-development.jpg',
      instructorUserId: user1.Instructor?.userId
    }
  });

  // Tạo một learning path mẫu
  const learningPath = await prisma.learningPath.upsert({
    where: { id: 'sample-learning-path-1' },
    update: {
      instructorUserId: user1.Instructor?.userId
    },
    create: {
      id: 'sample-learning-path-1',
      title: 'Lộ trình trở thành Full-stack Developer',
      description: 'Lộ trình học tập toàn diện để trở thành một Full-stack Developer chuyên nghiệp',
      thumbnail: 'https://example.com/thumbnails/fullstack-path.jpg',
      instructorUserId: user1.Instructor?.userId
    }
  });

  // Tạo một workshop mẫu
  const workshop = await prisma.workshop.upsert({
    where: { id: 'sample-workshop-1' },
    update: {},
    create: {
      id: 'sample-workshop-1',
      title: 'Workshop về React và NextJS',
      description: 'Workshop thực hành về cách xây dựng ứng dụng web hiện đại với React và NextJS',
      scheduledAt: new Date('2025-05-15T09:00:00Z'),
      duration: 180, // 3 giờ
      instructorId: user2.Instructor?.userId || ''
    }
  });

  console.log('Đã tạo xong dữ liệu mẫu cho instructor lead!');
  console.log(`Đã tạo instructor lead 1: ${user1.email}`);
  console.log(`Đã tạo instructor lead 2: ${user2.email}`);
  console.log(`Đã tạo ${3} topics`);
  console.log(`Đã tạo ${1} learning path`);
  console.log(`Đã tạo ${1} workshop`);
}

main()
  .catch((e) => {
    console.error('Lỗi khi tạo dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

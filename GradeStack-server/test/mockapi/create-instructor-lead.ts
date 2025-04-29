import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Tạo hoặc cập nhật tài khoản instructor-lead
 */
async function createOrUpdateInstructorLead() {
  try {
    const email = "phuduongthanh24112002@gmail.com";
    const password = "phudk123";
    const firstName = "Phú";
    const lastName = "Dương Thanh";
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        Instructor: true
      }
    });

    if (existingUser) {
      console.log("Tìm thấy tài khoản:", existingUser);
      
      // Kiểm tra role của user
      if (existingUser.role !== Role.INSTRUCTOR_LEAD) {
        console.log("Cập nhật role thành INSTRUCTOR_LEAD");
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: Role.INSTRUCTOR_LEAD }
        });
      }
      
      // Kiểm tra xem user đã có profile instructor chưa
      if (existingUser.Instructor) {
        console.log("Tài khoản này đã có profile Instructor:", existingUser.Instructor);
      } else {
        // Tạo instructor profile
        const instructor = await prisma.instructor.create({
          data: {
            userId: existingUser.id,
            organization: "GradeStack",
            avatar: "https://ui-avatars.com/api/?name=Phú+Dương+Thanh&background=random",
            bio: "Instructor Lead tại GradeStack",
            socials: [],
          },
        });
        
        console.log("Đã thêm profile Instructor thành công:", instructor);
      }
      
      console.log("Email:", existingUser.email);
      console.log("Họ tên:", existingUser.firstName, existingUser.lastName);
      console.log("Vai trò:", existingUser.role);
      console.log("ID:", existingUser.id);
      return;
    }

    // Nếu tài khoản chưa tồn tại, tạo mới
    console.log("Tạo tài khoản mới với email:", email);
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo transaction để đảm bảo tính nhất quán dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // Tạo user mới với role INSTRUCTOR_LEAD
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: Role.INSTRUCTOR_LEAD,
          isVerified: true, // Instructor Lead được tạo bởi Admin nên mặc định đã xác thực
        },
      });

      // Tạo instructor profile
      const instructor = await tx.instructor.create({
        data: {
          userId: user.id,
          organization: "GradeStack",
          avatar: "https://ui-avatars.com/api/?name=Phú+Dương+Thanh&background=random",
          bio: "Instructor Lead tại GradeStack",
          socials: [],
        },
      });

      return { user, instructor };
    });

    console.log("Đã tạo tài khoản instructor-lead thành công:");
    console.log("Email:", result.user.email);
    console.log("Họ tên:", result.user.firstName, result.user.lastName);
    console.log("Vai trò:", result.user.role);
    console.log("ID:", result.user.id);
  } catch (error) {
    console.error("Lỗi khi tạo/cập nhật tài khoản instructor-lead:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm
createOrUpdateInstructorLead()
  .then(() => console.log("Hoàn thành"))
  .catch(console.error);

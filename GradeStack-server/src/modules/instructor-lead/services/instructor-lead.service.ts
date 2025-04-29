import { PrismaClient, Role, User, Instructor } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../../shared/middleware/error.middleware";

/**
 * Service xử lý logic nghiệp vụ cho Instructor Lead
 */
export class InstructorLeadService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Tạo mới Instructor Lead
   * @param userData - Thông tin người dùng
   * @param instructorData - Thông tin instructor
   * @returns Thông tin instructor lead đã tạo
   */
  public async createInstructorLead(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    instructorData: {
      organization: string;
      avatar?: string;
      bio?: string;
      socials?: string[];
    }
  ): Promise<{ user: User; instructor: Instructor }> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("Email đã tồn tại", 400);
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Tạo transaction để đảm bảo tính nhất quán dữ liệu
    return await this.prisma.$transaction(async (tx) => {
      // Tạo user mới với role INSTRUCTOR_LEAD
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: Role.INSTRUCTOR_LEAD,
          isVerified: true, // Instructor Lead được tạo bởi Admin nên mặc định đã xác thực
        },
      });

      // Tạo instructor profile
      const instructor = await tx.instructor.create({
        data: {
          userId: user.id,
          organization: instructorData.organization,
          avatar: instructorData.avatar,
          bio: instructorData.bio,
          socials: instructorData.socials || [],
        },
      });

      return { user, instructor };
    });
  }

  /**
   * Tìm người dùng theo ID
   * @param userId - ID người dùng
   * @returns Thông tin người dùng
   */
  public async findByUserId(userId: string): Promise<any> {
    try {
      console.log('findByUserId - Đang tìm người dùng với ID:', userId);
      
      // Tìm người dùng bất kể role nào
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          Instructor: true,
        },
      });

      if (!user) {
        console.error('findByUserId - Không tìm thấy người dùng với ID:', userId);
        throw new AppError("Người dùng không tồn tại", 404);
      }
      
      console.log('findByUserId - Đã tìm thấy người dùng:', user);
      return user;
    } catch (error) {
      console.error('findByUserId - Lỗi:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param userId - ID người dùng
   * @param data - Dữ liệu cập nhật
   * @returns Thông tin người dùng đã cập nhật
   */
  public async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      organization?: string;
      avatar?: string;
      bio?: string;
      socials?: string[];
    }
  ): Promise<any> {
    try {
      console.log('updateProfile - Đang cập nhật thông tin người dùng với ID:', userId);
      console.log('updateProfile - Dữ liệu cập nhật:', data);
      
      // Kiểm tra người dùng có tồn tại không
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          Instructor: true,
        },
      });

      if (!user) {
        console.error('updateProfile - Không tìm thấy người dùng với ID:', userId);
        throw new AppError("Người dùng không tồn tại", 404);
      }

      // Cập nhật thông tin
      const result = await this.prisma.$transaction(async (tx) => {
        // Cập nhật thông tin user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            firstName: data.firstName || user.firstName,
            lastName: data.lastName || user.lastName,
          },
        });

        // Cập nhật thông tin instructor
        const updatedInstructor = await tx.instructor.update({
          where: { userId: userId },
          data: {
            organization: data.organization || user.Instructor?.organization,
            avatar: data.avatar || user.Instructor?.avatar,
            bio: data.bio || user.Instructor?.bio,
            socials: data.socials || user.Instructor?.socials,
          },
        });

        return { user: updatedUser, instructor: updatedInstructor };
      });
      
      return result;
    } catch (error) {
      console.error('updateProfile - Lỗi:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả Instructor
   * @returns Danh sách instructor
   */
  public async getAllInstructors(): Promise<any> {
    return await this.prisma.user.findMany({
      where: { role: Role.INSTRUCTOR },
      include: {
        Instructor: true,
      },
    });
  }

  /**
   * Tạo mới Topic
   * @param topicData - Dữ liệu topic
   * @returns Topic đã tạo
   */
  public async createTopic(
    topicData: {
      name: string;
      thumbnail?: string;
      description?: string;
      instructorUserId?: string;
    }
  ): Promise<any> {
    try {
      console.log('createTopic - Đang tạo topic mới với dữ liệu:', topicData);
      
      // Kiểm tra dữ liệu đầu vào
      if (!topicData.name) {
        throw new AppError("Tên topic là bắt buộc", 400);
      }
      
      // Đảm bảo các trường không bị undefined
      topicData.thumbnail = topicData.thumbnail || 'https://placehold.co/600x400?text=No+Image';
      topicData.description = topicData.description || '';
      
      // Kiểm tra xem topic đã tồn tại chưa
      const existingTopic = await this.prisma.topic.findFirst({
        where: {
          name: topicData.name
        }
      });

      if (existingTopic) {
        console.error('createTopic - Topic đã tồn tại:', existingTopic);
        throw new AppError("Topic đã tồn tại", 400);
      }

      // Kiểm tra xem instructor có tồn tại không
      if (topicData.instructorUserId) {
        console.log('createTopic - Kiểm tra instructor với userId:', topicData.instructorUserId);
        
        // Kiểm tra xem userId có tồn tại trong bảng User không
        const user = await this.prisma.user.findUnique({
          where: {
            id: topicData.instructorUserId
          }
        });
        
        if (!user) {
          console.error('createTopic - Không tìm thấy user với userId:', topicData.instructorUserId);
          throw new AppError("User không tồn tại", 404);
        }
        
        // Kiểm tra xem user có phải là instructor không
        const instructor = await this.prisma.instructor.findUnique({
          where: {
            userId: topicData.instructorUserId
          }
        });

        if (!instructor) {
          console.log('createTopic - User không phải là instructor, tạo instructor mới');
          // Nếu user tồn tại nhưng không phải instructor, tạo instructor mới
          await this.prisma.instructor.create({
            data: {
              userId: topicData.instructorUserId,
              organization: 'GradeStack',
              socials: []
            }
          });
        }
      }

      // Tạo topic mới
      const topic = await this.prisma.topic.create({
        data: {
          name: topicData.name,
          thumbnail: topicData.thumbnail,
          description: topicData.description,
          instructorUserId: topicData.instructorUserId
        },
        include: {
          Instructor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          courses: true
        }
      });

      console.log('createTopic - Topic đã được tạo thành công:', topic);
      return topic;
    } catch (error) {
      console.error('createTopic - Lỗi:', error);
      throw error;
    }
  }



  /**
   * Xóa Topic
   * @param topicId - ID của topic
   * @returns Topic đã xóa
   */
  public async deleteTopic(topicId: string): Promise<any> {
    // Kiểm tra topic có tồn tại không
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError("Topic không tồn tại", 404);
    }

    // Kiểm tra topic có đang được sử dụng không
    const courseTopics = await this.prisma.courseTopic.findMany({
      where: { topicId },
    });

    if (courseTopics.length > 0) {
      throw new AppError("Topic đang được sử dụng bởi khóa học, không thể xóa", 400);
    }

    return await this.prisma.topic.delete({
      where: { id: topicId },
    });
  }

  /**
   * Lấy Topic theo ID
   * @param topicId - ID của topic
   * @returns Thông tin topic
   */
  public async getTopicById(topicId: string): Promise<any> {
    try {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          courses: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!topic) {
        throw new AppError("Topic không tồn tại", 404);
      }
      
      return topic;
    } catch (error) {
      console.error('getTopicById - Lỗi:', error);
      throw error;
    }
  }

  /**
   * Cập nhật Topic
   * @param topicId - ID của topic
   * @param topicData - Dữ liệu cập nhật
   * @returns Topic đã cập nhật
   */
  public async updateTopic(
    topicId: string,
    topicData: {
      name?: string;
      thumbnail?: string;
      description?: string;
      instructorUserId?: string;
    }
  ): Promise<any> {
    // Kiểm tra topic có tồn tại không
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new AppError("Topic không tồn tại", 404);
    }
    
    return await this.prisma.topic.update({
      where: { id: topicId },
      data: topicData,
    });
  }

  /**
   * Tạo mới Learning Path
   * @param learningPathData - Dữ liệu learning path
   * @returns Learning path đã tạo
   */
  public async createLearningPath(
    learningPathData: {
      title: string;
      description?: string;
      thumbnail?: string;
      instructorUserId?: string;
      courses?: {
        courseId: string;
        order: number;
      }[];
    }
  ): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      // Tạo learning path
      const learningPath = await tx.learningPath.create({
        data: {
          title: learningPathData.title,
          description: learningPathData.description,
          thumbnail: learningPathData.thumbnail,
          instructorUserId: learningPathData.instructorUserId,
        },
      });

      // Thêm các khóa học vào learning path nếu có
      if (learningPathData.courses && learningPathData.courses.length > 0) {
        for (const course of learningPathData.courses) {
          await tx.learningPathCourse.create({
            data: {
              learningPathId: learningPath.id,
              courseId: course.courseId,
              order: course.order,
            },
          });
        }
      }

      return learningPath;
    });
  }

  /**
   * Cập nhật Learning Path
   * @param learningPathId - ID của learning path
   * @param learningPathData - Dữ liệu cập nhật
   * @returns Learning path đã cập nhật
   */
  public async updateLearningPath(
    learningPathId: string,
    learningPathData: {
      title?: string;
      description?: string;
      thumbnail?: string;
      instructorUserId?: string;
      courses?: {
        courseId: string;
        order: number;
      }[];
    }
  ): Promise<any> {
    // Kiểm tra learning path có tồn tại không
    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: learningPathId },
    });

    if (!learningPath) {
      throw new AppError("Learning Path không tồn tại", 404);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Cập nhật thông tin learning path
      const updatedLearningPath = await tx.learningPath.update({
        where: { id: learningPathId },
        data: {
          title: learningPathData.title,
          description: learningPathData.description,
          thumbnail: learningPathData.thumbnail,
          instructorUserId: learningPathData.instructorUserId,
        },
      });

      // Cập nhật các khóa học trong learning path nếu có
      if (learningPathData.courses && learningPathData.courses.length > 0) {
        // Xóa tất cả các khóa học hiện tại
        await tx.learningPathCourse.deleteMany({
          where: { learningPathId },
        });

        // Thêm các khóa học mới
        for (const course of learningPathData.courses) {
          await tx.learningPathCourse.create({
            data: {
              learningPathId,
              courseId: course.courseId,
              order: course.order,
            },
          });
        }
      }

      return updatedLearningPath;
    });
  }

  /**
   * Xóa Learning Path
   * @param learningPathId - ID của learning path
   * @returns Learning path đã xóa
   */
  public async deleteLearningPath(learningPathId: string): Promise<any> {
    // Kiểm tra learning path có tồn tại không
    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: learningPathId },
    });

    if (!learningPath) {
      throw new AppError("Learning Path không tồn tại", 404);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Xóa tất cả các khóa học trong learning path
      await tx.learningPathCourse.deleteMany({
        where: { learningPathId },
      });

      // Xóa learning path
      return await tx.learningPath.delete({
        where: { id: learningPathId },
      });
    });
  }

  /**
   * Lấy Learning Path theo ID
   * @param learningPathId - ID của learning path
   * @returns Thông tin learning path
   */
  public async getLearningPathById(learningPathId: string): Promise<any> {
    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: learningPathId },
      include: {
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!learningPath) {
      throw new AppError("Learning Path không tồn tại", 404);
    }

    return learningPath;
  }

  /**
   * Lấy tất cả Learning Paths
   * @returns Danh sách learning paths
   */
  public async getAllLearningPaths(): Promise<any> {
    return await this.prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Tạo mới Workshop
   * @param workshopData - Dữ liệu workshop
   * @returns Workshop đã tạo
   */
  public async createWorkshop(
    workshopData: {
      title: string;
      description: string;
      scheduledAt: Date;
      duration: number;
      instructorId: string;
    }
  ): Promise<any> {
    // Kiểm tra instructor có tồn tại không
    const instructor = await this.prisma.instructor.findUnique({
      where: { userId: workshopData.instructorId },
    });

    if (!instructor) {
      throw new AppError("Instructor không tồn tại", 404);
    }

    return await this.prisma.workshop.create({
      data: workshopData,
    });
  }

  /**
   * Cập nhật Workshop
   * @param workshopId - ID của workshop
   * @param workshopData - Dữ liệu cập nhật
   * @returns Workshop đã cập nhật
   */
  public async updateWorkshop(
    workshopId: string,
    workshopData: {
      title?: string;
      description?: string;
      scheduledAt?: Date;
      duration?: number;
      instructorId?: string;
    }
  ): Promise<any> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    // Kiểm tra instructor có tồn tại không nếu có thay đổi
    if (workshopData.instructorId) {
      const instructor = await this.prisma.instructor.findUnique({
        where: { userId: workshopData.instructorId },
      });

      if (!instructor) {
        throw new AppError("Instructor không tồn tại", 404);
      }
    }

    return await this.prisma.workshop.update({
      where: { id: workshopId },
      data: workshopData,
    });
  }

  /**
   * Xóa Workshop
   * @param workshopId - ID của workshop
   * @returns Workshop đã xóa
   */
  public async deleteWorkshop(workshopId: string): Promise<any> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    return await this.prisma.$transaction(async (tx) => {
      // Xóa tất cả các attendance liên quan
      await tx.attendance.deleteMany({
        where: { workshopId },
      });

      // Xóa workshop
      return await tx.workshop.delete({
        where: { id: workshopId },
      });
    });
  }

  /**
   * Lấy Workshop theo ID
   * @param workshopId - ID của workshop
   * @returns Thông tin workshop
   */
  public async getWorkshopById(workshopId: string): Promise<any> {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    return workshop;
  }

  /**
   * Lấy tất cả Workshops
   * @returns Danh sách workshops
   */
  public async getAllWorkshops(): Promise<any> {
    return await this.prisma.workshop.findMany({
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Phê duyệt khóa học
   * @param courseId - ID của khóa học
   * @returns Khóa học đã được phê duyệt
   */
  public async approveCourse(courseId: string): Promise<any> {
    // Kiểm tra khóa học có tồn tại không
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError("Khóa học không tồn tại", 404);
    }

    return await this.prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: true,
      },
    });
  }

  /**
   * Từ chối khóa học
   * @param courseId - ID của khóa học
   * @param reason - Lý do từ chối
   * @returns Thông tin từ chối
   */
  public async rejectCourse(courseId: string, reason: string): Promise<{ courseId: string; status: string; reason: string; timestamp: Date }> {
    // Kiểm tra khóa học có tồn tại không
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new AppError("Khóa học không tồn tại", 404);
    }
    return {
      courseId,
      status: "rejected",
      reason,
      timestamp: new Date(),
    };
  }

  /**
   * Đăng nhập Instructor Lead
   * @param email - Email
   * @param password - Mật khẩu
   * @returns Token JWT và thông tin user
   */
  public async loginInstructorLead({ email, password }: { email: string; password: string }): Promise<{ user: Omit<User, 'password'>; token: string }> {
    try {
      console.log('loginInstructorLead - Đang đăng nhập với email:', email);
      
      // Tìm user theo email
      const user: User | null = await this.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        console.error('loginInstructorLead - Không tìm thấy người dùng với email:', email);
        throw new AppError("Email hoặc mật khẩu không đúng", 401);
      }
      
      // Kiểm tra role (chỉ ghi log, không ngăn cản đăng nhập)
      if (user.role !== Role.INSTRUCTOR_LEAD) {
        console.warn('loginInstructorLead - Người dùng không phải INSTRUCTOR_LEAD, role hiện tại:', user.role);
      }
      
      // Kiểm tra mật khẩu
      const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error('loginInstructorLead - Mật khẩu không đúng cho email:', email);
        throw new AppError("Email hoặc mật khẩu không đúng", 401);
      }
      
      // Kiểm tra tài khoản có bị khóa không
      if (user.isBlocked) {
        console.error('loginInstructorLead - Tài khoản bị khóa:', email);
        throw new AppError("Tài khoản đã bị khóa", 403);
      }
      
      const secret: string | undefined = process.env.JWT_SECRET;
      if (!secret) {
        throw new AppError("JWT_SECRET chưa được cấu hình", 500);
      }
      
      const token: string = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "1d" });
      
      // Loại bỏ password trả về
      const { password: _pw, ...userWithoutPassword } = user as any;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('loginInstructorLead - Lỗi đăng nhập:', error);
      throw error;
    }
  }
}


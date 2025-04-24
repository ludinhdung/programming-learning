import { Certificate, Prisma, PrismaClient } from '@prisma/client';
import { CreateCertificateDto, UpdateCertificateDto } from '../dto/certificate.dto';
import { CertificateService as CertificateServiceUtils } from '../../../shared/utils/certificate.service';

const prisma = new PrismaClient();

export class CertificateService {
  /**
   * Create a new certificate
   */
  async createCertificate(data: CreateCertificateDto): Promise<Certificate> {
    // Check if learner exists
    const learner = await prisma.user.findUnique({
      where: { id: data.learnerId }
    });

    if (!learner) {
      throw { status: 404, message: `Học viên với id ${data.learnerId} không tồn tại` };
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId }
    });

    if (!course) {
      throw { status: 404, message: `Khóa học với id ${data.courseId} không tồn tại` };
    }

    // Check if certificate already exists for this learner and course
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        learnerId_courseId: {
          learnerId: data.learnerId,
          courseId: data.courseId
        }
      }
    });

    if (existingCertificate) {
      throw { status: 409, message: 'Chứng chỉ cho học viên này và khóa học này đã tồn tại' };
    }

    // Create the certificate
    return prisma.certificate.create({
      data: {
        learner: { connect: { id: data.learnerId } },
        course: { connect: { id: data.courseId } },
        certificateUrl: data.certificateUrl
      }
    });
  }

  /**
   * Get all certificates
   */
  async getAllCertificates(): Promise<Certificate[]> {
    return prisma.certificate.findMany({
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      }
    });
  }

  /**
   * Get certificates by learner ID
   */
  async getCertificatesByLearnerId(learnerId: string): Promise<Certificate[]> {
    // Check if learner exists
    const learner = await prisma.user.findUnique({
      where: { id: learnerId }
    });

    if (!learner) {
      throw { status: 404, message: `Học viên với id ${learnerId} không tồn tại` };
    }

    return prisma.certificate.findMany({
      where: { learnerId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true
          }
        }
      }
    });
  }

  /**
   * Get certificates by course ID
   */
  async getCertificatesByCourseId(courseId: string): Promise<Certificate[]> {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw { status: 404, message: `Khóa học với id ${courseId} không tồn tại` };
    }

    return prisma.certificate.findMany({
      where: { courseId },
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
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true
          }
        }
      }
    });

    if (!certificate) {
      throw { status: 404, message: `Chứng chỉ với id ${certificateId} không tồn tại` };
    }

    return certificate;
  }

  /**
   * Get certificate by learner ID and course ID
   */
  async getCertificateByLearnerAndCourse(learnerId: string, courseId: string): Promise<Certificate | null> {
    const certificate = await prisma.certificate.findUnique({
      where: {
        learnerId_courseId: {
          learnerId,
          courseId
        }
      },
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true
          }
        }
      }
    });

    if (!certificate) {
      throw { status: 404, message: 'Chứng chỉ không tồn tại cho học viên và khóa học này' };
    }

    return certificate;
  }

  /**
   * Update certificate
   */
  async updateCertificate(certificateId: string, data: UpdateCertificateDto): Promise<Certificate> {
    // Check if certificate exists
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    });

    if (!certificate) {
      throw { status: 404, message: `Chứng chỉ với id ${certificateId} không tồn tại` };
    }

    // Update the certificate
    return prisma.certificate.update({
      where: { id: certificateId },
      data
    });
  }

  /**
   * Delete certificate
   */
  async deleteCertificate(certificateId: string): Promise<void> {
    // Check if certificate exists
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    });

    if (!certificate) {
      throw { status: 404, message: `Chứng chỉ với id ${certificateId} không tồn tại` };
    }

    // Delete the certificate
    await prisma.certificate.delete({
      where: { id: certificateId }
    });
  }

  public async generateCertificate(learnerId: string, courseId: string, name: string): Promise<Certificate> {
    // Check enrolled course progress
    const enrolledCourse = await prisma.enrolledCourse.findUnique({
      where: {
        learnerId_courseId: {
          learnerId,
          courseId
        }
      }
    });

    if (!enrolledCourse) {
      throw { status: 400, message: "Course enrollment not found" };
    }

    // Check progress requirement
    if (enrolledCourse.progress < 80) {
      throw { status: 400, message: "Course progress must be at least 80% to generate certificate" };
    }

    // Check final test status
    const finalTest = await prisma.submittedFinalTest.findFirst({
      where: {
        learnerId,
        finalTest: {
          lesson: {
            module: {
              courseId
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    if (!finalTest || finalTest.score < 80) {
      throw { status: 400, message: "Final test must be passed with a score of at least 80% to generate certificate" };
    }

    const learner = await prisma.user.findUnique({
      where: { id: learnerId },
      select: {
        email: true
      }
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true
      }
    });

    if (!learner?.email || !course?.title) {
      throw { status: 400, message: "Not found learner or course" };
    }

    const certificate = await CertificateServiceUtils.generateCertificate(
      name,
      learner.email,
      course.title,
      new Date().toISOString(),
      new Date(new Date().getTime() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString()
    );

    const createdCertificate = await prisma.certificate.create({
      data: {
        learnerId,
        courseId,
        certificateUrl: certificate
      }
    });

    return createdCertificate;
  }
}

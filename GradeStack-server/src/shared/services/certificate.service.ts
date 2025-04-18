import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export class CertifierService {
  private readonly apiKey: string;
  private readonly groupId: string;
  private readonly baseUrl: string = 'https://api.certifier.io/v1';

  constructor() {
    this.apiKey = process.env.CERTIFIER_IO_KEY || '';
    this.groupId = process.env.CERTIFIER_IO_GROUP_ID || '';
    
    if (!this.apiKey || !this.groupId) {
      throw new Error('Certifier.io API key or Group ID not configured');
    }
  }

  /**
   * Tạo chứng chỉ cho học viên
   */
  async generateCertificate(learnerId: string, courseId: string) {
    try {
      // Kiểm tra xem chứng chỉ đã tồn tại chưa
      const existingCertificate = await prisma.certificate.findUnique({
        where: { learnerId_courseId: { learnerId, courseId } }
      });

      if (existingCertificate) {
        return existingCertificate;
      }

        // Lấy thông tin email của học viên
        const learner = await prisma.user.findUnique({
        where: { id: learnerId },
        select: { email: true, firstName: true, lastName: true }
        });

        // Lấy thông tin khóa học
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true }
        });

        //Thêm logic kiểm tra xem học viên đã hoàn thành khóa học chưa

      // Tạo chứng chỉ trên Certifier.io
      const response = await axios.post(
        `${this.baseUrl}/credentials/create-issue-send`,
        {
          recipient: {
            name: learner?.firstName + " " + learner?.lastName,
            email: learner?.email ||  '',
          },
          customAttributes: {
            "custom.course_name": course?.title || '',
          },
          groupId: this.groupId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Certifier-Version': '2022-10-26'
          }
        }
      );

      // Lưu thông tin chứng chỉ vào database
      const certificateUrl = "https://credsverse.com/credentials/"+response.data.publicId;
      
      const certificate = await prisma.certificate.create({
        data: {
          learnerId,
          courseId,
          certificateUrl,
          issuedAt: new Date(),
        }
      });

      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách chứng chỉ của học viên
   */
  async getLearnerCertificates(learnerId: string) {
    return prisma.certificate.findMany({
      where: { learnerId },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
          }
        }
      }
    });
  }

  /**
   * Lấy thông tin chứng chỉ từ Certifier.io băng publicId (id của chứng chỉ trên Certifier.io)
   */
  async getCertificate(publicId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/credentials/${publicId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }
}

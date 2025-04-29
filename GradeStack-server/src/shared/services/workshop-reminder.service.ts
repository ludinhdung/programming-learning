import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';
import cron from 'node-cron';

/**
 * Service xử lý gửi email nhắc nhở tham gia workshop
 */
export class WorkshopReminderService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
    this.initScheduler();
  }

  /**
   * Khởi tạo scheduler để kiểm tra và gửi email nhắc nhở
   */
  private initScheduler(): void {
    // Chạy mỗi phút để kiểm tra các workshop sắp diễn ra
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkUpcomingWorkshops();
      } catch (error) {
        console.error('Lỗi khi kiểm tra workshop sắp diễn ra:', error);
      }
    });

    console.log('Đã khởi tạo scheduler gửi email nhắc nhở workshop');
  }

  /**
   * Kiểm tra các workshop sắp diễn ra trong 10 phút tới và gửi email nhắc nhở
   */
  private async checkUpcomingWorkshops(): Promise<void> {
    try {
      // Tính thời gian hiện tại và thời gian sau 10 phút
      const now = new Date();
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
      
      // Tìm các workshop sắp diễn ra trong khoảng thời gian từ now đến tenMinutesLater
      const upcomingWorkshops = await this.prisma.workshop.findMany({
        where: {
          scheduledAt: {
            gte: now,
            lt: tenMinutesLater,
          },
        },
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attendees: {
            where: {
              notified: false, // Chỉ lấy những người chưa được thông báo
            },
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Kiểm tra nếu không có workshop nào sắp diễn ra
      if (upcomingWorkshops.length === 0) {
        return;
      }

      // Gửi email nhắc nhở cho từng người tham gia của mỗi workshop
      for (const workshop of upcomingWorkshops) {
        // Kiểm tra xem workshop có instructor không
        if (!workshop.instructor || !workshop.instructor.user) {
          console.error(`Workshop ${workshop.id} không có thông tin instructor hợp lệ`);
          continue;
        }

        const instructorName = `${workshop.instructor.user.firstName} ${workshop.instructor.user.lastName}`;
        
        // Kiểm tra xem có người tham gia nào chưa được thông báo không
        if (!workshop.attendees || workshop.attendees.length === 0) {
          console.log(`Workshop ${workshop.title} không có người tham gia nào chưa được thông báo`);
          continue;
        }
        
        for (const attendee of workshop.attendees) {
          // Kiểm tra xem attendee có thông tin user hợp lệ không
          if (!attendee.user || !attendee.user.email) {
            console.error(`Attendee ${attendee.id} không có thông tin email hợp lệ`);
            continue;
          }

          try {
            // Gửi email nhắc nhở
            // Kiểm tra và log thông tin về meetUrl
            if (!workshop.meetUrl) {
              console.log(`Workshop "${workshop.title}" không có Google Meet URL. Sẽ gửi email không có link Google Meet.`);
            } else {
              console.log(`Workshop "${workshop.title}" có Google Meet URL: ${workshop.meetUrl}. Sẽ gửi email với link Google Meet.`);
            }
            
            await this.emailService.sendWorkshopReminderEmail(
              attendee.user.email,
              workshop.title,
              instructorName,
              workshop.scheduledAt,
              workshop.duration,
              workshop.meetUrl || undefined
            );

            // Cập nhật trạng thái đã thông báo
            await this.prisma.attendance.update({
              where: {
                id: attendee.id,
              },
              data: {
                notified: true,
              },
            });

            console.log(`Đã gửi email nhắc nhở tới ${attendee.user.email} cho workshop "${workshop.title}"`);
          } catch (error) {
            console.error(`Lỗi khi gửi email nhắc nhở tới ${attendee.user.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra workshop sắp diễn ra:', error);
    }
  }
}

/**
 * Hướng dẫn cài đặt Workshop Reminder Service:
 * 
 * 1. Cài đặt node-cron:
 *    npm install node-cron
 *    npm install @types/node-cron --save-dev
 * 
 * 2. Đảm bảo đã cài đặt và cấu hình EmailService
 * 
 * 3. Khởi tạo service trong file app.ts hoặc server.ts:
 *    import { WorkshopReminderService } from './shared/services/workshop-reminder.service';
 *    new WorkshopReminderService();
 */

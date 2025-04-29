import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.middleware';

/**
 * Service xử lý gửi email
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Khởi tạo transporter với cấu hình từ biến môi trường
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Gửi email
   * @param to - Địa chỉ email người nhận
   * @param subject - Tiêu đề email
   * @param html - Nội dung email (định dạng HTML)
   * @returns Kết quả gửi email
   */
  public async sendEmail(to: string, subject: string, html: string): Promise<any> {
    try {
      // Kiểm tra xem đã cấu hình email chưa
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('Chưa cấu hình email. Không thể gửi email.');
        return;
      }

      // Cấu hình email
      const mailOptions = {
        from: `"GradeStack" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      // Gửi email
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email đã được gửi:', info.messageId);
      return info;
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new AppError('Không thể gửi email: ' + (error as Error).message, 500);
    }
  }

  /**
   * Gửi email nhắc nhở tham gia workshop
   * @param to - Địa chỉ email người nhận
   * @param workshopTitle - Tiêu đề workshop
   * @param instructorName - Tên giảng viên
   * @param startTime - Thời gian bắt đầu
   * @param duration - Thời lượng (phút)
   * @param meetUrl - URL Google Meet (nếu có)
   * @returns Kết quả gửi email
   */
  public async sendWorkshopReminderEmail(
    to: string,
    workshopTitle: string,
    instructorName: string,
    startTime: Date,
    duration: number,
    meetUrl?: string
  ): Promise<any> {
    // Format thời gian
    const formattedDate = startTime.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const formattedTime = startTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Tạo nội dung email
    const subject = `Nhắc nhở: Workshop "${workshopTitle}" sắp diễn ra`;
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Workshop sắp diễn ra!</h2>
        <p>Xin chào,</p>
        <p>Workshop <strong>${workshopTitle}</strong> sẽ diễn ra sau 10 phút nữa.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Thông tin workshop:</strong></p>
          <ul>
            <li>Tiêu đề: ${workshopTitle}</li>
            <li>Giảng viên: ${instructorName}</li>
            <li>Thời gian: ${formattedDate}, ${formattedTime}</li>
            <li>Thời lượng: ${duration} phút</li>
          </ul>
        </div>
    `;

    // Thêm thông tin Google Meet nếu có
    if (meetUrl) {
      html += `
        <p>Bạn có thể tham gia workshop qua Google Meet bằng đường link dưới đây:</p>
        <p style="text-align: center;">
          <a href="${meetUrl}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Tham gia Google Meet
          </a>
        </p>
      `;
    } else {
      html += `
        <p style="color: #64748b; font-style: italic;">Workshop này không có link Google Meet. Vui lòng liên hệ giảng viên để biết thêm thông tin về cách tham gia.</p>
      `;
    }

    html += `
        <p>Hãy chuẩn bị sẵn sàng để tham gia workshop!</p>
        <p>Trân trọng,<br>Đội ngũ GradeStack</p>
      </div>
    `;

    // Gửi email
    return await this.sendEmail(to, subject, html);
  }
}

/**
 * Hướng dẫn cài đặt Email Service:
 * 
 * 1. Cài đặt nodemailer:
 *    npm install nodemailer
 *    npm install @types/nodemailer --save-dev
 * 
 * 2. Thêm các biến môi trường vào file .env:
 *    EMAIL_HOST=smtp.example.com
 *    EMAIL_PORT=587
 *    EMAIL_SECURE=false
 *    EMAIL_USER=your_email@example.com
 *    EMAIL_PASSWORD=your_password
 * 
 * 3. Nếu sử dụng Gmail, bạn cần:
 *    - Bật "Less secure app access" trong tài khoản Google
 *    - Hoặc tạo "App Password" nếu đã bật xác thực 2 yếu tố
 */

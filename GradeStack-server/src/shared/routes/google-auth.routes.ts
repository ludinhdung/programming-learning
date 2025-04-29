import { Router, Request, Response, NextFunction } from 'express';
import { google, Auth } from 'googleapis';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleCalendarService } from '../services/google-calendar.service';

/**
 * Router xử lý các route liên quan đến xác thực Google OAuth
 * @class GoogleAuthRouter
 */
export class GoogleAuthRouter {
  public router: Router;
  private oauth2Client: Auth.OAuth2Client;
  private redirectUri: string;
  private scopes: string[];

  constructor() {
    // Tải lại các biến môi trường
    dotenv.config();
    
    this.router = Router();
    
    // Lấy redirect URI từ biến môi trường
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
    
    // Kiểm tra xem redirect URI có hợp lệ không
    if (!this.redirectUri) {
      console.error('GOOGLE_REDIRECT_URI không được cấu hình');
    }
    
    // Khởi tạo OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      this.redirectUri
    );
    
    // Phạm vi quyền
    this.scopes = [
      'https://www.googleapis.com/auth/calendar'
    ];
    
    this.initializeRoutes();
  }
  
  /**
   * Lấy URL xác thực Google
   * @returns URL xác thực
   */
  public getAuthUrl(): string {
    // Đảm bảo redirect_uri khớp với cấu hình trong Google Cloud Console
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent', // Đảm bảo luôn nhận được refresh token
      redirect_uri: this.redirectUri
    });
    
    console.log(`Đang chuyển hướng đến URL xác thực Google: ${authUrl}`);
    console.log(`Redirect URI: ${this.redirectUri}`);
    
    return authUrl;
  }
  
  /**
   * Xử lý callback từ Google OAuth
   * @param req Request
   * @param res Response
   */
  public async handleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    
    if (!code) {
      res.status(400).send('Không nhận được mã xác thực từ Google');
      return;
    }
    
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (tokens.refresh_token) {
        // Lưu refresh token vào file .env
        try {
          const envPath = path.resolve(process.cwd(), '.env');
          let envContent = fs.readFileSync(envPath, 'utf8');
          
          // Thay thế hoặc thêm GOOGLE_REFRESH_TOKEN
          if (envContent.includes('GOOGLE_REFRESH_TOKEN=""') || envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
            envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=(""|".*?")/g, `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
          } else {
            envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
          }
          
          fs.writeFileSync(envPath, envContent, 'utf8');
          console.log('\nĐã tự động cập nhật refresh token vào file .env!');
        } catch (err) {
          console.error('Không thể tự động cập nhật file .env:', err);
        }
        
        res.send(`
          <h1>Đã lấy refresh token thành công!</h1>
          <p>Refresh token của bạn là:</p>
          <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">${tokens.refresh_token}</pre>
          <p style="color: green; font-weight: bold;">Đã tự động cập nhật token vào file .env!</p>
          <p>Bạn có thể đóng cửa sổ này và khởi động lại server để áp dụng thay đổi.</p>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;">Đóng cửa sổ này</button>
        `);
        
        console.log('\nRefresh token:', tokens.refresh_token);
        console.log('\nToken đã được tự động cập nhật vào file .env');
      } else {
        res.send(`
          <h1>Không nhận được refresh token!</h1>
          <p>Có thể bạn đã cấp quyền cho ứng dụng này trước đó.</p>
          <p>Thử các bước sau:</p>
          <ol>
            <li>Truy cập <a href="https://myaccount.google.com/permissions" target="_blank">https://myaccount.google.com/permissions</a></li>
            <li>Thu hồi quyền truy cập của ứng dụng "GradeStack"</li>
            <li>Quay lại <a href="/google-auth">đây</a> và thử lại</li>
          </ol>
          <p><strong>Hoặc</strong> bạn có thể thử với tài khoản Google khác.</p>
        `);
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy tokens:', error);
      res.status(500).send(`Đã xảy ra lỗi khi lấy tokens: ${error.message}`);
    }
  }

  /**
   * Khởi tạo các routes cho xác thực Google OAuth
   * @private
   * @returns {void}
   */
  /**
   * Kiểm tra trạng thái của Google Calendar API và refresh token
   * @param req Request
   * @param res Response
   */
  public async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const googleCalendarService = new GoogleCalendarService();
      const isTokenValid = await googleCalendarService.isTokenValid();
      
      if (isTokenValid) {
        res.send(`
          <h1>Trạng thái Google Calendar API</h1>
          <p style="color: green; font-weight: bold;">✅ Token hợp lệ và sẵn sàng sử dụng!</p>
          <p>Bạn có thể tạo workshop với tùy chọn "Tự động tạo Google Meet" để tạo link Google Meet tự động.</p>
          <p>Khi gửi email nhắc nhở, link Google Meet sẽ được đính kèm.</p>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;">Đóng cửa sổ này</button>
        `);
      } else {
        res.send(`
          <h1>Trạng thái Google Calendar API</h1>
          <p style="color: red; font-weight: bold;">❌ Token không hợp lệ hoặc đã hết hạn!</p>
          <p>Bạn cần lấy refresh token mới để sử dụng tính năng tạo Google Meet tự động.</p>
          <p>Làm theo các bước sau:</p>
          <ol>
            <li>Truy cập <a href="/auth/google">đây</a> để bắt đầu quá trình xác thực</li>
            <li>Đăng nhập vào tài khoản Google của bạn</li>
            <li>Cấp quyền cho ứng dụng</li>
            <li>Refresh token sẽ được tự động cập nhật vào file .env</li>
            <li>Khởi động lại server để áp dụng thay đổi</li>
          </ol>
          <p><strong>Hoặc</strong> bạn có thể thử với tài khoản Google khác.</p>
          <a href="/auth/google" style="display: inline-block; padding: 10px 20px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 5px;">Lấy refresh token mới</a>
        `);
      }
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra trạng thái Google Calendar API:', error);
      res.status(500).send(`Đã xảy ra lỗi khi kiểm tra trạng thái: ${error.message}`);
    }
  }

  private initializeRoutes(): void {
    // Không cần đăng ký routes nữa vì chúng ta đã xử lý trực tiếp trong app.ts
    console.log('Khởi tạo GoogleAuthRouter thành công');
  }
}

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as http from 'http';
import { URL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Script để lấy Google Refresh Token
 * 
 * Cách sử dụng:
 * 1. Chạy script này: ts-node get-google-refresh-token.ts
 * 2. Mở URL được hiển thị trong terminal
 * 3. Đăng nhập vào tài khoản Google và cấp quyền
 * 4. Refresh token sẽ được lưu vào file .env
 */

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('Thiếu thông tin cấu hình Google OAuth. Vui lòng kiểm tra file .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Tạo URL xác thực
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Đảm bảo luôn nhận được refresh token
});

console.log('Mở URL này trong trình duyệt để xác thực:');
console.log(authUrl);

// Tạo server để xử lý callback
const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.end('Không tìm thấy URL');
      return;
    }

    const urlParts = new URL(req.url, `http://${req.headers.host}`);
    const code = urlParts.searchParams.get('code');
    
    if (code) {
      // Đổi code lấy token
      const { tokens } = await oauth2Client.getToken(code);
      
      if (tokens.refresh_token) {
        console.log('Đã nhận được refresh token!');
        
        // Cập nhật file .env
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Thay thế hoặc thêm GOOGLE_REFRESH_TOKEN
        if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
          envContent = envContent.replace(
            /GOOGLE_REFRESH_TOKEN=".*"/,
            `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`
          );
        } else {
          envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>Xác thực thành công!</h1>
          <p>Refresh token đã được lưu vào file .env</p>
          <p>Bạn có thể đóng tab này và quay lại terminal.</p>
        `);
        
        // Đóng server sau 2 giây
        setTimeout(() => {
          server.close();
          console.log('Refresh token đã được lưu vào file .env');
          process.exit(0);
        }, 2000);
      } else {
        console.error('Không nhận được refresh token');
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>Lỗi: Không nhận được refresh token</h1>
          <p>Vui lòng thử lại và đảm bảo bạn đã chọn "Đồng ý" cho tất cả các quyền.</p>
        `);
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Lỗi: Không tìm thấy mã xác thực</h1>');
    }
  } catch (error) {
    console.error('Lỗi khi xử lý callback:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Lỗi máy chủ nội bộ</h1>');
  }
});

// Lắng nghe trên cổng từ REDIRECT_URI
const redirectUrl = new URL(REDIRECT_URI);
const port = redirectUrl.port || 4000;

server.listen(port, () => {
  console.log(`Server đang lắng nghe trên cổng ${port}`);
});

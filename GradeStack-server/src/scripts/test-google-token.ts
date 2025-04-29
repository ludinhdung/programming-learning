import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Script để kiểm tra và làm mới Google Token
 * 
 * Script này sẽ:
 * 1. Kiểm tra token hiện tại
 * 2. Thử refresh nếu cần
 * 3. Lưu log chi tiết để debug
 */

async function testGoogleToken() {
  try {
    console.log('Bắt đầu kiểm tra Google Token...');
    
    // Lấy thông tin từ biến môi trường
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    
    // Log thông tin (che dấu một phần)
    console.log('Thông tin cấu hình:');
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'không có');
    console.log('- Client Secret:', clientSecret ? 'được cấu hình' : 'không có');
    console.log('- Redirect URI:', redirectUri || 'không có');
    console.log('- Refresh Token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'không có');
    
    // Kiểm tra thông tin cần thiết
    if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
      console.error('❌ Thiếu thông tin cấu hình Google OAuth. Vui lòng kiểm tra file .env');
      return;
    }
    
    // Khởi tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    
    // Thiết lập refresh token
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    console.log('✅ Đã thiết lập OAuth2 client với refresh token');
    
    try {
      // Thử refresh token
      console.log('Đang thử refresh token...');
      const { credentials } = await oauth2Client.refreshToken(refreshToken);
      
      console.log('✅ Đã refresh token thành công!');
      console.log('- Access Token mới:', credentials.access_token ? `${credentials.access_token.substring(0, 10)}...` : 'không có');
      console.log('- Expires:', credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'không xác định');
      
      // Kiểm tra xem refresh_token mới có được trả về không
      if (credentials.refresh_token && credentials.refresh_token !== refreshToken) {
        console.log('✅ Đã nhận được refresh token mới!');
        
        // Cập nhật file .env với refresh token mới
        updateEnvFile(credentials.refresh_token);
      } else {
        console.log('ℹ️ Không có refresh token mới, tiếp tục sử dụng refresh token hiện tại');
      }
      
      // Thiết lập lại credentials với token mới
      oauth2Client.setCredentials(credentials);
      
      // Khởi tạo Calendar API
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Kiểm tra calendar API bằng cách gọi một API đơn giản
      console.log('Đang kiểm tra Calendar API...');
      const calendarResponse = await calendar.calendarList.list({
        maxResults: 1
      });
      
      console.log('✅ Calendar API hoạt động! Số lượng calendars:', calendarResponse.data.items?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi làm việc với Google Calendar API:');
      if (error instanceof Error) {
        console.error('- Message:', error.message);
        console.error('- Stack:', error.stack);
      } else {
        console.error(error);
      }
      
      console.log('\n🔍 Gợi ý: Có thể bạn cần lấy refresh token mới. Chạy script get-google-refresh-token.ts');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi thực thi script:');
    console.error(error);
    return false;
  }
}

/**
 * Cập nhật file .env với refresh token mới
 */
function updateEnvFile(newRefreshToken: string) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Thay thế hoặc thêm GOOGLE_REFRESH_TOKEN
    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(
        /GOOGLE_REFRESH_TOKEN=".*?"/,
        `GOOGLE_REFRESH_TOKEN="${newRefreshToken}"`
      );
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN="${newRefreshToken}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Đã cập nhật refresh token mới vào file .env');
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật file .env:', error);
  }
}

// Thực thi script
testGoogleToken()
  .then(success => {
    if (success) {
      console.log('\n✅ Kiểm tra và làm mới token thành công!');
    } else {
      console.log('\n❌ Kiểm tra token không thành công!');
    }
  })
  .catch(error => {
    console.error('❌ Lỗi không xác định:', error);
  });

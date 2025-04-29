// Script để kiểm tra và làm mới token Google Calendar
require('dotenv').config();
const { google } = require('googleapis');

async function checkToken() {
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
      const response = await oauth2Client.refreshToken(refreshToken);
      const credentials = response.credentials || response.tokens || {};
      
      console.log('✅ Đã refresh token thành công!');
      console.log('- Access Token mới:', credentials.access_token ? `${credentials.access_token.substring(0, 10)}...` : 'không có');
      console.log('- Expires:', credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'không xác định');
      
      // Thiết lập lại credentials với token mới
      oauth2Client.setCredentials(credentials);
      
      // Khởi tạo Calendar API
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      // Kiểm tra calendar API bằng cách gọi một API đơn giản
      console.log('Đang kiểm tra Calendar API...');
      const calendarResponse = await calendar.calendarList.list({
        maxResults: 1
      });
      
      console.log('✅ Calendar API hoạt động! Số lượng calendars:', (calendarResponse.data.items || []).length);
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi làm việc với Google Calendar API:');
      console.error('- Message:', error.message);
      if (error.stack) console.error('- Stack:', error.stack);
      console.error('- Errors:', JSON.stringify(error.errors || {}, null, 2));
      
      console.log('\n🔍 Gợi ý: Có thể bạn cần lấy refresh token mới. Hãy truy cập http://localhost:4000/auth/google');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi thực thi script:');
    console.error(error);
    return false;
  }
}

// Thực thi script
checkToken()
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

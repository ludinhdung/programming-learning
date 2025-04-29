/**
 * Script để kiểm thử API workshop
 * Sử dụng để tạo và kiểm tra workshop với đầy đủ thông tin
 */
import axios, { AxiosResponse } from 'axios';
import { config } from 'dotenv';

// Tải biến môi trường từ file .env
config();

/**
 * Interface cho dữ liệu tạo workshop
 */
interface CreateWorkshopData {
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  instructorId: string;
  meetUrl?: string | null;
  thumbnail?: string | null;
  autoGenerateMeet: boolean;
}

/**
 * Interface cho kết quả API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Interface cho thông tin đăng nhập
 */
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Chức năng đăng nhập để lấy token xác thực
 */
async function loginAndGetToken(): Promise<string> {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:4000/api';
    
    // Dữ liệu đăng nhập - tài khoản instructor từ file seed
    const loginData = {
      email: 'phuduongthanh24112002@gmail.com',   // Tài khoản instructor từ file seed.ts
      password: 'phudk123'             // Mật khẩu instructor từ file seed.ts
    };
    
    console.log('Đang đăng nhập để lấy token...');
    const loginResponse: AxiosResponse<ApiResponse<LoginResponse>> = await axios.post(
      `${API_URL}/auth/login`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✅ Đăng nhập thành công!');
      const token = loginResponse.data.data.token;
      console.log(`Token: ${token.substring(0, 20)}...`);
      return token;
    } else {
      throw new Error('Đăng nhập thất bại: ' + (loginResponse.data.message || 'Không xác định'));
    }
  } catch (error) {
    console.error('❌ Lỗi khi đăng nhập:', error);
    throw error;
  }
}

/**
 * Chức năng chính: test API tạo workshop
 */
async function testCreateWorkshop(): Promise<void> {
  try {
    console.log('Bắt đầu kiểm thử API workshop...');
    
    // Đăng nhập và lấy token xác thực
    const authToken = await loginAndGetToken();
    
    // Thông tin của instructor (thay thế bằng ID thực từ database)
    const instructorId = '4146595a-fabe-4c1c-a7e5-62aacdf9a26e';
    
    // URL của API
    const API_URL = process.env.API_URL || 'http://localhost:4000/api';
    
    // Tạo dữ liệu cho workshop
    const workshopData: CreateWorkshopData = {
      title: 'Workshop Test từ Script',
      description: 'Workshop được tạo từ test script để kiểm tra API', 
      // Thời gian dự kiến: 3 ngày từ hiện tại
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90, // 90 phút
      instructorId: instructorId,
      meetUrl: null,
      autoGenerateMeet: true, // Đảm bảo giá trị là boolean true
    };
    
    // Log kiểu dữ liệu để debug
    console.log('Kiểu dữ liệu autoGenerateMeet gửi lên:', typeof workshopData.autoGenerateMeet);
    
    console.log('Dữ liệu workshop gửi lên:', workshopData);
    
    // Gọi API tạo workshop với token xác thực
    const response: AxiosResponse<ApiResponse<any>> = await axios.post(
      `${API_URL}/workshops`,
      workshopData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    // Kiểm tra kết quả
    if (response.status === 201 && response.data.success) {
      console.log('✅ Tạo workshop thành công!');
      console.log('Chi tiết workshop:');
      console.log(JSON.stringify(response.data.data, null, 2));
      
      // Kiểm tra autoGenerateMeet
      console.log(`autoGenerateMeet: ${response.data.data.autoGenerateMeet}`);
      if (response.data.data.autoGenerateMeet) {
        console.log('✅ Cờ autoGenerateMeet được lưu đúng là true');
      } else {
        console.log('❌ Cờ autoGenerateMeet bị chuyển thành false');
      }
      
      // Kiểm tra meetUrl nếu tự động tạo
      if (workshopData.autoGenerateMeet) {
        if (response.data.data.meetUrl) {
          console.log(`✅ Google Meet URL được tạo thành công: ${response.data.data.meetUrl}`);
        } else {
          console.log('❌ Không tạo được Google Meet URL mặc dù autoGenerateMeet = true');
        }
      }
    } else {
      console.log('❌ Lỗi khi tạo workshop:', response.data.message || 'Không xác định');
    }
  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử:', error);
  }
}

/**
 * Chạy script
 */
(async () => {
  try {
    await testCreateWorkshop();
  } catch (err) {
    console.error('Lỗi không xử lý được:', err);
  }
})();

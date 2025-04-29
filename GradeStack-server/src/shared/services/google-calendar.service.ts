import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { AppError } from '../middleware/error.middleware';

/**
 * Service xử lý tích hợp với Google Calendar API
 */
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client = new google.auth.OAuth2();
  private calendar: calendar_v3.Calendar = google.calendar({ version: 'v3' });
  private credentials: Credentials | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Trong constructor, chỉ cần kiểm tra các biến môi trường và khởi tạo OAuth2Client
    // Không thực hiện các thao tác bất đồng bộ trong constructor để tránh lỗi
    try {
      // Kiểm tra các biến môi trường cần thiết
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      
      // Log trạng thái cấu hình
      if (!clientId || !clientSecret || !redirectUri) {
        console.error('Thiếu cấu hình Google Calendar API. Vui lòng kiểm tra các biến môi trường GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, và GOOGLE_REDIRECT_URI.');
        return;
      }
      
      // Khởi tạo OAuth2 client cơ bản
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );
      
      console.log('Google Calendar API khởi tạo cơ bản thành công, cần gọi init() để hoàn tất.');
    } catch (error) {
      console.error('Lỗi khi khởi tạo GoogleCalendarService:', error);
      if (error instanceof Error) {
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);
      }
    }
  }
  
  /**
   * Khởi tạo đầy đủ GoogleCalendarService và làm mới token
   * Cần gọi phương thức này trước khi sử dụng các phương thức khác
   * @returns Promise<boolean> true nếu khởi tạo thành công, false nếu thất bại
   */
  public async init(): Promise<boolean> {
    try {
      // Nếu đã khởi tạo, trả về true
      if (this.isInitialized) {
        return true;
      }
      
      console.log('Đang khởi tạo đầy đủ Google Calendar Service...');
      
      // Kiểm tra các biến môi trường cần thiết
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      
      // Log thông tin chi tiết để debug
      console.log('Google Calendar cấu hình:');
      console.log('- Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'không có');
      console.log('- Client Secret:', clientSecret ? 'được cấu hình' : 'không có');
      console.log('- Redirect URI:', redirectUri || 'không có');
      console.log('- Refresh Token:', refreshToken ? `${refreshToken.substring(0, 10)}...` : 'không có');
      
      // Kiểm tra lại thông tin cần thiết
      if (!clientId || !clientSecret || !redirectUri) {
        console.error('Thiếu cấu hình Google Calendar API. Vui lòng kiểm tra các biến môi trường.');
        return false;
      }
      
      // Tạo lại oauth2Client để đảm bảo
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );
  
      // Thiết lập refresh token
      if (refreshToken) {
        this.credentials = {
          refresh_token: refreshToken
        };
        this.oauth2Client.setCredentials(this.credentials);
        console.log('Đã thiết lập credentials với refresh token.');
        
        // Làm mới token
        try {
          await this.refreshAccessToken();
          console.log('Đã làm mới token thành công.');
        } catch (error) {
          console.warn('Không thể làm mới token, sẽ thử lại sau:', error);
          // Tiếp tục với token hiện tại
        }
      } else {
        console.warn('GOOGLE_REFRESH_TOKEN không được cấu hình. Không thể tạo Google Meet tự động.');
        console.log(this.getAuthInstructions());
        return false;
      }
  
      // Khởi tạo Calendar API với token đã làm mới
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client
      });
      
      // Kiểm tra calendar đã được khởi tạo
      if (!this.calendar) {
        console.error('Không thể khởi tạo Google Calendar API');
        return false;
      }
      
      // Kiểm tra token hoạt động bằng cách gọi API đơn giản
      try {
        const response = await this.calendar.calendarList.list({ maxResults: 1 });
        console.log('Calendar API hoạt động! Số lượng calendars:', response.data.items?.length || 0);
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Token không hợp lệ hoặc Calendar API không hoạt động:', error);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo đầy đủ GoogleCalendarService:', error);
      if (error instanceof Error) {
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);
      }
      return false;
    }
  }

  /**
   * Refresh access token khi cần thiết
   * @returns Promise<void>
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      // Kiểm tra xem oauth2Client đã được khởi tạo chưa
      if (!this.oauth2Client) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;
        
        if (!clientId || !clientSecret || !redirectUri) {
          throw new AppError('Thiếu cấu hình Google OAuth2 Client', 500);
        }
        
        this.oauth2Client = new google.auth.OAuth2(
          clientId,
          clientSecret,
          redirectUri
        );
      }
      
      // Kiểm tra refresh_token
      if (!this.credentials?.refresh_token) {
        // Thử lấy từ biến môi trường nếu không có trong credentials
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        if (!refreshToken) {
          throw new AppError('Không thể refresh token vì thiếu refresh_token', 500);
        }
        
        // Thiết lập credentials với refresh token từ môi trường
        this.credentials = { refresh_token: refreshToken };
        this.oauth2Client.setCredentials(this.credentials);
        console.log('Sử dụng refresh token từ biến môi trường');
      }
      
      console.log('Đang refresh access token với refresh_token:', this.credentials?.refresh_token ? this.credentials.refresh_token.substring(0, 10) + '...' : 'không có');
      
      // Thiết lập credentials trước khi refresh
      if (this.credentials?.refresh_token) {
        this.oauth2Client.setCredentials({
          refresh_token: this.credentials.refresh_token
        });
      } else {
        throw new AppError('Vẫn không có refresh_token sau khi kiểm tra', 500);
      }
      
      // Thực hiện refresh token
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Lưu lại refresh_token cũ nếu credentials mới không có
      if (!credentials.refresh_token && this.credentials.refresh_token) {
        console.log('Credentials mới không có refresh_token, sử dụng lại refresh_token cũ');
        credentials.refresh_token = this.credentials.refresh_token;
      }
      
      this.credentials = credentials;
      this.oauth2Client.setCredentials(this.credentials);
      
      // Cập nhật calendar với credentials mới
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client
      });
      
      console.log('Access token đã được refresh thành công.');
      if (credentials.access_token) {
        console.log('Access token mới:', credentials.access_token.substring(0, 10) + '...');
        console.log('Access token hết hạn sau:', credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'không xác định');
      }
    } catch (error) {
      console.error('Lỗi khi refresh access token:', error);
      if (error instanceof Error) {
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw new AppError('Không thể refresh access token: ' + (error as Error).message, 500);
    }
  }

  /**
   * Tạo cuộc họp Google Meet
   * @param title - Tiêu đề cuộc họp
   * @param description - Mô tả cuộc họp
   * @param startTime - Thời gian bắt đầu
   * @param endTime - Thời gian kết thúc
   * @returns URL của cuộc họp Google Meet
   */
  public async createMeeting(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date
  ): Promise<string> {
    try {
      console.log('Bắt đầu tạo Google Meet với thông tin:', { title, startTime, endTime });
      
      // Kiểm tra xem có refresh token không
      if (!this.credentials?.refresh_token) {
        console.error('Thiếu refresh token, không thể tạo Google Meet');
        throw new AppError('Không thể tạo Google Meet vì thiếu cấu hình GOOGLE_REFRESH_TOKEN', 500);
      }
      
      console.log('Refresh token tồn tại, đang refresh access token...');
      
      // Refresh access token trước khi tạo cuộc họp
      try {
        await this.refreshAccessToken();
        console.log('Đã refresh access token thành công');
      } catch (refreshError) {
        console.error('Lỗi khi refresh access token:', refreshError);
        throw new AppError('Không thể refresh access token: ' + (refreshError as Error).message, 500);
      }

      // Tạo sự kiện trên Google Calendar với tính năng conferenceData
      const requestId = `workshop-${Date.now()}`;
      console.log('Đang tạo sự kiện với requestId:', requestId);
      
      const event = {
        summary: title,
        description: description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        conferenceData: {
          createRequest: {
            requestId: requestId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      console.log('Đang gọi calendar.events.insert API...');
      let response;
      try {
        response = await this.calendar.events.insert({
          calendarId: 'primary',
          conferenceDataVersion: 1,
          requestBody: event
        });
        console.log('Đã nhận phản hồi từ API Google Calendar');
      } catch (apiError) {
        console.error('Lỗi khi gọi API calendar.events.insert:', apiError);
        if (apiError instanceof Error) {
          console.error('Chi tiết lỗi API:', apiError.message);
          console.error('Stack trace:', apiError.stack);
        }
        throw new AppError('Lỗi khi gọi API Google Calendar: ' + (apiError as Error).message, 500);
      }

      console.log('Dữ liệu conferenceData:', JSON.stringify(response.data.conferenceData, null, 2));
      
      // Lấy URL của cuộc họp Google Meet
      const entryPoints = response.data.conferenceData?.entryPoints || [];
      console.log('Entry points:', JSON.stringify(entryPoints, null, 2));
      
      const meetUrl = entryPoints.find(
        (entryPoint) => entryPoint.entryPointType === 'video'
      )?.uri;

      if (!meetUrl) {
        console.error('Không tìm thấy video entry point trong phản hồi');
        throw new AppError('Không thể tạo URL Google Meet: Không tìm thấy video entry point', 500);
      }

      console.log('Đã tạo Google Meet URL thành công:', meetUrl);
      return meetUrl;
    } catch (error) {
      console.error('Lỗi khi tạo Google Meet:', error);
      
      // Ghi log chi tiết hơn về lỗi
      if (error instanceof Error) {
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);
      }
      
      // Nếu lỗi là do token hết hạn, thử refresh token và tạo lại cuộc họp
      if ((error as any)?.code === 401) {
        try {
          console.log('Token hết hạn (401), đang thử refresh token...');
          await this.refreshAccessToken();
          console.log('Đã refresh token thành công, thử tạo lại cuộc họp...');
          return this.createMeeting(title, description, startTime, endTime);
        } catch (refreshError) {
          console.error('Không thể refresh token:', refreshError);
          throw new AppError('Không thể refresh token: ' + (refreshError as Error).message, 500);
        }
      }
      
      throw new AppError('Không thể tạo Google Meet: ' + (error as Error).message, 500);
    }
  }
  
  /**
   * Kiểm tra xem token hiện tại có hợp lệ không
   * @returns Promise<boolean>
   */
  public async isTokenValid(): Promise<boolean> {
    try {
      if (!this.credentials?.refresh_token) {
        console.warn('Không có refresh token để kiểm tra');
        return false;
      }
      
      // Kiểm tra xem calendar có tồn tại không
      if (!this.calendar) {
        console.error('Đối tượng calendar chưa được khởi tạo');
        return false;
      }
      
      console.log('Đang kiểm tra tính hợp lệ của token...');
      
      // Thử gọi một API đơn giản để kiểm tra token
      // Xác minh rằng calendarList tồn tại
      if (!this.calendar.calendarList) {
        console.error('this.calendar.calendarList là undefined, khởi tạo lại calendar API');
        this.calendar = google.calendar({
          version: 'v3',
          auth: this.oauth2Client
        });
      }
      
      // Gọi API an toàn hơn
      await this.calendar.calendarList.list({
        maxResults: 1
      });
      console.log('Token hợp lệ, API calendarList.list đã thành công');
      return true;
    } catch (error: any) {
      // Nếu lỗi là do token hết hạn, thử refresh token
      if (error?.code === 401) {
        try {
          console.log('Token hết hạn (401), đang thử refresh...');
          await this.refreshAccessToken();
          console.log('Đã refresh token thành công');
          return true;
        } catch (refreshError) {
          console.error('Không thể refresh token:', refreshError);
          if (refreshError instanceof Error) {
            console.error('Chi tiết lỗi refresh:', refreshError.message);
            console.error('Stack trace:', refreshError.stack);
          }
          return false;
        }
      }
      
      console.error('Lỗi khi kiểm tra token:', error);
      if (error instanceof Error) {
        console.error('Chi tiết lỗi:', error.message);
        console.error('Stack trace:', error.stack);
      }
      return false;
    }
  }
  
  /**
   * Tạo hướng dẫn auth cho người dùng
   * @returns Hướng dẫn auth
   */
  public getAuthInstructions(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      return 'Thiếu cấu hình Google Calendar API. Vui lòng kiểm tra các biến môi trường GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, và GOOGLE_REDIRECT_URI.';
    }
    
    return `
Để lấy refresh token cho Google Calendar API, hãy thực hiện các bước sau:

1. Chạy script get-google-refresh-token.ts:
   - Mở terminal và chạy: npm run refresh-token

2. Truy cập URL được cung cấp:
   - Đăng nhập vào tài khoản Google của bạn
   - Cấp quyền truy cập cho ứng dụng

3. Sau khi được chuyển hướng, sao chép refresh token từ màn hình hoặc console
   - Thêm token vào biến môi trường GOOGLE_REFRESH_TOKEN trong file .env

4. Khởi động lại server
`;
  }
}

import express, { response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from './modules/auth/routes/auth.routes';
import userRouter from './modules/user/routes/user.routes';
import instructorRouter from './modules/instructor/routes/instructor.route';
import courseRouter from './modules/course/routes/course.routes';
import topicRouter from './modules/topic/routes/topic.routes';
import lessonRouter from './modules/lesson/routes/lesson.routes';
import videoLessonRouter from './modules/videoLesson/routes/videoLesson.routes';
import moduleRouter from './modules/module/routes/module.routes';
import learningPathRouter from './modules/learningPath/routes/learningPath.routes';
import certificateRouter from './modules/certificate/routes/certificate.routes';
import imageUploadRouter from './shared/routes/image-upload.routes';
import supporterRouter from "./modules/supporter/routes/supporter.routes";
import { setupSwagger } from './shared/config/swagger';
import { errorHandler } from './shared/middleware/error.middleware';
import practiceCodeRoutes from './modules/practice-code/routes/coding-exercise.routes';
import bodyParser from 'body-parser';
import checkoutRoutes from './modules/checkout/routes/checkout.routes';
import noteRoutes from './modules/note/note.route';
import { commentRoutes } from './modules/comment';
import coursesRouter from './modules/courses/routes/course.routes';
import { InstructorLeadRouter } from './modules/instructor-lead/routes/instructor-lead.route';
import { WorkshopRouter } from './modules/workshop/routes/workshop.route';
import progressRoutes from './modules/progress/routes/progress.routes';
import adminRoutes from './modules/admin/admin.route'
import finalTestRoutes from "./modules/final_test/routes/final_test.route"
import { generateVietQRUrl } from './shared/utils/generateVietQRUrl';
import { GoogleAuthRouter } from './shared/routes/google-auth.routes';
import feedbackRoutes from "./modules/feedback/routes/feedback.route"
import "./shared/events/listener"
import { WorkshopReminderService } from './shared/services/workshop-reminder.service';
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(bodyParser.json());

// Setup Swagger documentation
setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/instructors', instructorRouter);
app.use('/api', courseRouter);
app.use('/api', topicRouter);
app.use('/api', lessonRouter);
app.use('/api', videoLessonRouter);
app.use('/api', moduleRouter);
app.use('/api', learningPathRouter);
app.use('/api', certificateRouter);
app.use("/api/admin", adminRoutes);
app.use('/api/instructor-lead', new InstructorLeadRouter().router);
app.use('/api/workshops', new WorkshopRouter().router);

app.use("/api/courses", coursesRouter);

app.use('/api/images', imageUploadRouter);
app.use("/api/supporter", supporterRouter);
app.use('/api/practice-code', practiceCodeRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/progress', progressRoutes);
app.use("/api/final-test", finalTestRoutes);
app.use("/api/feedback", feedbackRoutes);

// Route cho Google OAuth
// Đơn giản hóa cấu hình route
const googleAuthRouter = new GoogleAuthRouter();

// Đăng ký route cho Google OAuth
app.get('/google-auth', (req, res) => {
  res.send(`
    <h1>Lấy Google Refresh Token</h1>
    <p>Nhấn vào nút bên dưới để bắt đầu quá trình xác thực với Google:</p>
    <a href="/google-auth/start" style="display: inline-block; background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
      Xác thực với Google
    </a>
  `);
});

// Route bắt đầu xác thực
app.get('/google-auth/start', (req, res) => {
  const authUrl = googleAuthRouter.getAuthUrl();
  res.redirect(authUrl);
});

// Route callback
app.get('/auth/google/callback', (req, res) => {
  googleAuthRouter.handleCallback(req, res);
});

// Route kiểm tra trạng thái Google Calendar API
app.get('/google-auth/status', (req, res) => {
  googleAuthRouter.checkStatus(req, res);
});

// Khởi tạo service gửi email nhắc nhở workshop
if (process.env.NODE_ENV !== 'test') {
  // Chỉ khởi tạo trong môi trường không phải test
  new WorkshopReminderService();
  console.log('Đã khởi tạo WorkshopReminderService');
}

// CertificateService.generateCertificate(
//     {
//         name: 'Dung',
//         email: 'dungdung23092002@gmail.com'
//     },
//     'Java Basic',
//     '2025-04-23',
//     '2025-10-25'
// ).then(console.log).catch(console.error);

export default app;

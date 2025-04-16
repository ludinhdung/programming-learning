import express from 'express';
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

app.use("/api/courses", coursesRouter);

app.use('/api/images', imageUploadRouter);
app.use("/api/supporter", supporterRouter);
app.use('/api/practice-code', practiceCodeRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api', noteRoutes);
app.use('/api/comments', commentRoutes);

app.use(errorHandler);

export default app;

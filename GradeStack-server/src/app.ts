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
import imageUploadRouter from './shared/routes/image-upload.routes';
import { setupSwagger } from './shared/config/swagger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
app.use('/api/images', imageUploadRouter);

export default app;
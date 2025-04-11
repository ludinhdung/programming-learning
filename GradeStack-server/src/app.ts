import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from './modules/auth/routes/auth.routes';
import userRouter from './modules/user/routes/user.routes';
import { errorHandler } from './shared/middleware/error.middleware';
import courseRoutes from './modules/courses_old/routes/course.routes';
import practiceCodeRoutes from './modules/practice-code/routes/coding-exercise.routes';
import bodyParser from 'body-parser';
import checkoutRoutes from './modules/checkout/routes/checkout.routes';
import noteRoutes from './modules/note/note.route';
import { commentRoutes } from './modules/comment';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRoutes);
app.use('/api/practice-code', practiceCodeRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api', noteRoutes); 
app.use('/api/comments', commentRoutes); 

app.use(errorHandler);

export default app;

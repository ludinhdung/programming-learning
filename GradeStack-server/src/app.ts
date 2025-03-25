import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from './modules/auth/routes/auth.routes';
import userRouter from './modules/user/routes/user.routes';
import { errorHandler } from './shared/middleware/error.middleware';
import courseRoutes from './modules/course/routes/course.routes';
import practiceCodeRoutes from './modules/practice-code/routes/coding-exercise.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/courses', courseRoutes);
app.use('/api/practice-code', practiceCodeRoutes);

app.use(errorHandler);

// Basic error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

export default app;
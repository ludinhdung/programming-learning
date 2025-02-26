import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import moduleRoutes from './routes/module.routes';
import instructorRoutes from './routes/instructor.routes';
import certificateRoutes from './routes/certificate.routes';
import topicRoutes from './routes/topic.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/topics', topicRoutes);

// Error handling middleware
app.use(errorMiddleware);

export default app; 
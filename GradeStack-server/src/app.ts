import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from './modules/user/routes/user.route';
const app = express();

// Middleware
// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:5173'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));
app.use(express.json());
app.use(morgan('dev'));

// Routes

app.use('/api/user', userRouter);

// Error handling middleware

export default app; 
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from './modules/auth/routes/auth.routes';
import userRouter from './modules/user/routes/user.routes';
import instructorRouter from './modules/instructor/routes/instructor.route';
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


export default app;
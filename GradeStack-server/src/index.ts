import express, { Express } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Routes
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/user/routes/user.routes';

// Middleware
import { errorHandler } from './shared/middleware/error.middleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
morgan.token('host', function(req, res) {
  return req.headers.host;
});
app.use(morgan(':method :host :url :status :response-time ms'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});



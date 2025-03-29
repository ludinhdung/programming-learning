import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./modules/auth/routes/auth.routes";
import userRouter from "./modules/user/routes/user.routes";
import supporterRouter from "./modules/supporter/routes/supporter.routes";
import { errorHandler } from "./shared/middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/supporter", supporterRouter);
app.use(errorHandler);

export default app;

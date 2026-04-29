import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { sessionMiddleware, connectRedis } from "./config/session.js";
import authRouter from "./routes/auth.routes.js";
import accountsRouter from "./routes/account.routes.js";
import transactionsRouter from "./routes/transaction.routes.js";

connectDB();
await connectRedis();

const app = express();

app.use(sessionMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: process.env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/accounts", accountsRouter);
app.use("/api/v1/transactions", transactionsRouter);

export default app;

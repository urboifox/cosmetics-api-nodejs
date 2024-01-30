// libraries
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

// routes
import { usersRoute } from "./routes/usersRoute";
import mongoose from "mongoose";
import { httpStatus } from "./utils/httpStatus";
import { AppError } from "./types";
import { appAuthRoute } from "./routes/appAuthRoute";
import cors from "cors";
import cookieParser from "cookie-parser";

// main config
const app = express();
dotenv.config();

// middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// users routes
app.use("/app/auth", appAuthRoute);
app.use("/app/users", usersRoute);

// admins routes
// app.use("/app/admins", adminsRoute);

// error handlers
app.all("*", (_, res) => {
  res.status(404).json({ status: httpStatus.ERROR, message: "404 Not Found" });
});

app.use(
  (err: AppError, _req: Request, res: Response, next: NextFunction): any => {
    res.status(err.statusCode || 500).json({
      status: err.statusMessage || httpStatus.ERROR,
      code: err.statusCode || 500,
      message: err.message,
      errors: err.errors,
    });
    next();
  }
);

// server
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI as string).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

export { app };

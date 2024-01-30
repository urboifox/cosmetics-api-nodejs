import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/userModel";

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await User.find();
    return res.json({ status: "success", data: { users } });
  }
);

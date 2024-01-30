import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/userModel";
import { appError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { tokenGen } from "../utils/tokenGen";
import { Token } from "../models/tokenModel";

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone,
      country,
      city,
      address,
      gender,
      zip,
    } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(
        appError(400, httpStatus.FAIL, "Validation error", result.array())
      );
    }

    const oldUser = await User.findOne(
      { $or: [{ email }, { phone }] },
      { email: 1 }
    );
    if (oldUser) {
      return next(
        appError(400, httpStatus.FAIL, "This email is already in use")
      );
    }

    if (confirm_password !== password) {
      return next(appError(400, httpStatus.FAIL, "Passwords do not match"));
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hash,
      phone,
      country,
      city,
      address,
      gender,
      zip,
    });

    const token = tokenGen({ id: user._id, role: "user" });
    await Token.create({
      token,
    });

    return res.json({ status: "success", data: { user, token } });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(
        appError(400, httpStatus.FAIL, "Validation error", result.array())
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(appError(404, httpStatus.FAIL, "Invalid Credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(appError(400, httpStatus.FAIL, "Invalid Credentials"));
    }

    const token = tokenGen({ id: user._id, role: "user" });

    await Token.create({
      token,
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        // secure: true,
      })
      .json({
        status: httpStatus.SUCCESS,
        data: { user, token },
      });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  await Token.findOneAndDelete({ token: token });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    // secure: true
  });

  return res.status(200).json({
    status: httpStatus.SUCCESS,
    data: null,
  });
});

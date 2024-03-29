import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/userModel";
import { appError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
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

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return next(
        appError(400, httpStatus.FAIL, "This email is already in use")
      );
    }

    const oldUserNumber = await User.findOne({ phone });
    if (oldUserNumber) {
      return next(
        appError(400, httpStatus.FAIL, "This phone is already in use")
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

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        // TODO
        // secure: true,
        maxAge: 12 * 4 * 7 * 24 * 60 * 60 * 1000,
      })
      .json({ status: "success", data: { user, token } });
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
        // TODO
        // secure: true,
        maxAge: 12 * 4 * 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        status: httpStatus.SUCCESS,
        data: { user, token },
      });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookiesToken = req.cookies.token;
    const headersToken = req.headers.authorization?.split(" ")[1];

    if (cookiesToken) {
      await Token.findOneAndDelete({ token: cookiesToken });
    } else if (headersToken) {
      await Token.findOneAndDelete({ token: headersToken });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      // TODO
      // secure: true
    });

    return res.status(200).json({
      status: httpStatus.SUCCESS,
      data: null,
    });
  }
);

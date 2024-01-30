import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/userModel";
import { appError } from "../utils/appError";
import { httpStatus } from "../utils/httpStatus";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { accessTokenGen } from "../utils/accessTokenGen";
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

    return res.json({ status: "success", data: { user } });
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

    const accessToken = accessTokenGen({ id: user._id, role: "user" });

    const refreshToken = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "1y",
      }
    );

    await Token.create({
      token: refreshToken,
    });

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        // secure: true,
      })
      .json({
        status: httpStatus.SUCCESS,
        data: { user, token: accessToken },
      });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const tokenCookie = req.cookies.refreshToken;
  await Token.findOneAndDelete({ token: tokenCookie });
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

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      status: httpStatus.FAIL,
      data: {
        error: "Unauthorized",
      },
    });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({
          status: httpStatus.FAIL,
          data: {
            error: "Invalid token",
          },
        });
      }

      const foundUser = await User.findById(decoded.id);

      if (!foundUser) {
        return res.status(401).json({
          status: httpStatus.FAIL,
          data: {
            error: "Unauthorized",
          },
        });
      }

      await Token.findOneAndDelete({ token: refreshToken });

      const accessToken = accessTokenGen({ id: foundUser._id, role: "user" });

      return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: {
          token: accessToken,
        },
      });
    }
  );
});

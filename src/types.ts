import { NextFunction, Request, Response } from "express";

export type AppUser = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  gender: string;
  zip: string;
};

export type AppError = {
  message: string;
  statusCode: number;
  statusMessage: string;
  errors?: validationError[];
};

export type validationError = {
  type: string;
  msg: string;
  path: string;
  location: string;
};

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

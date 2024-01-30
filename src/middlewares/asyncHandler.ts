import { NextFunction, Request, Response } from "express";
import { MiddlewareFunction } from "../types";

const asyncHandler = (fn: MiddlewareFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => {
      next(err);
    });
  };
};

export { asyncHandler };

import jwt from "jsonwebtoken";
import { httpStatus } from "../utils/httpStatus";
import { Token } from "../models/tokenModel";

export async function verifyJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      status: httpStatus.FAIL,
      data: {
        error: "No token provided",
      },
    });
  }

  const foundToken = await Token.findOne({ token });

  if (!foundToken) {
    return res.status(401).send({
      status: httpStatus.FAIL,
      data: {
        error: "Invalid token",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = decoded;
  } catch (err) {
    return res.status(401).send({
      status: httpStatus.FAIL,
      data: {
        error: "Invalid token",
      },
    });
  }
  return next();
}

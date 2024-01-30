import jwt from "jsonwebtoken";
import { httpStatus } from "../utils/httpStatus";

export function verifyJWT(req: any, res: any, next: any) {
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

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
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

import jwt, { JwtPayload } from "jsonwebtoken";

export function accessTokenGen(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "30s",
  });
}

import express from "express";
const route = express.Router();

import {
  login,
  logout,
  refresh,
  register,
} from "../controllers/userAuthController";
import {
  userRegisterValidationSchema,
  userLoginValidationSchema,
} from "../utils/validationSchemas";

route.post("/register", userRegisterValidationSchema, register);
route.post("/login", userLoginValidationSchema, login);
route.delete("/logout", logout);
route.get("/refresh", refresh);

export { route as appAuthRoute };

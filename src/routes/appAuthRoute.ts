import express from "express";
const route = express.Router();

import { login, logout, register } from "../controllers/userAuthController";
import {
  userRegisterValidationSchema,
  userLoginValidationSchema,
} from "../middlewares/validationSchemas";

route.post("/register", userRegisterValidationSchema, register);
route.post("/login", userLoginValidationSchema, login);
route.delete("/logout", logout);

export { route as appAuthRoute };

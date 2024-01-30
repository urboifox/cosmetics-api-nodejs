import express from "express";
import { getAllUsers } from "../controllers/usersController";
import { verifyJWT } from "../middlewares/verifyJWT";

const route = express.Router();

route.get("/", verifyJWT, getAllUsers);

export { route as usersRoute };

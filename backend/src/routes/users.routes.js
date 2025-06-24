import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.route("/login")
    .post(userController.login);

router.route("/register")
    .post(userController.register);

export default router;
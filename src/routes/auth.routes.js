import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import verifySession from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validateRequest.middleware.js";
import {registerUserSchema,loginUserServiceSchema} from "../validations/auth.validator.js";


const router = Router();

/* POST /api/auth/register */
router.post("/register",validateRequest(registerUserSchema), registerUser);

/* POST /api/auth/login */
router.post("/login", loginUser);

/* POST /api/auth/logout */
router.post("/logout", verifySession,validateRequest(loginUserServiceSchema), logoutUser);

/* GET /api/auth/current-user */
router.get("/current-user", verifySession, getCurrentUser);

export default router;

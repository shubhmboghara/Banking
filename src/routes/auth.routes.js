import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import verifySession from "../middleware/auth.middleware.js";

const router = Router();

/* POST /api/auth/register */
router.post("/register", registerUser);

/* POST /api/auth/login */
router.post("/login", loginUser);

/* POST /api/auth/logout */
router.post("/logout", verifySession, logoutUser);

/* GET /api/auth/current-user */
router.get("/current-user", verifySession, getCurrentUser);

export default router;

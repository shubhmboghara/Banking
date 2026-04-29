import { Router } from "express";
import verifySession from "../middleware/auth.middleware.js";
import {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
} from "../controllers/account.controller.js";

const router = Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", verifySession, createAccountController);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", verifySession, getUserAccountsController);

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", verifySession, getAccountBalanceController);

export default router;

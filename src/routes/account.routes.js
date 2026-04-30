import { Router } from "express";
import verifySession from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccounts,
  getAccountBalance,
} from "../controllers/account.controller.js";

const router = Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", verifySession, createAccount);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", verifySession, getUserAccounts);

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", verifySession, getAccountBalance);

export default router;

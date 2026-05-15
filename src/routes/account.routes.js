import { Router } from "express";
import verifySession from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccounts,
  getAccountBalance,
} from "../controllers/account.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import { createAccountSchema, getAccountBalanceSchema } from "../validations/account.validator.js"; 
import APiError from "../util/ApiError.js";

const router = Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", verifySession, validateRequest(createAccountSchema), createAccount);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", verifySession, getUserAccounts);

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance", verifySession, (req, res, next) => {
  next(new APiError(400, "Account ID is required"));
});

router.get("/balance/:accountId", verifySession, validateRequest(getAccountBalanceSchema), getAccountBalance);

export default router;

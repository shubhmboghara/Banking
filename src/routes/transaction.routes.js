import { Router } from "express";
import verifySession from "../middleware/auth.middleware.js";
import {
  createTransaction,
  createInitialFundsTransaction,
} from "../controllers/transaction.controller.js";
import validateRequest from "../middleware/validate.middleware.js";
import {
  CreateTransactionSchema,
  InitialFundsTransactionSchema,
} from "../validations/transaction.validator.js";

const router = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */
router.post("/", verifySession,validateRequest(CreateTransactionSchema), createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
router.post(
  "/system/initial-funds",
  verifySession,
  validateRequest(InitialFundsTransactionSchema),
  createInitialFundsTransaction,
);

export default router;

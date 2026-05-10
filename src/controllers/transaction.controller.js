import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import Transaction from "../models/transaction.model.js";
import Ledger from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";
import mongoose from "mongoose";

const createTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new APiError(
      400,
      "fromAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  const fromUserAccount = await accountModel.findOne({
    userId: req.user._id,
  });

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  const fromUserAccount = await Account.findOne({
    _id: fromAccount,
  });

  if (!fromUserAccount) {
    throw new APiError(404, "invalid fromAccount, account not found");
  }

  // Check if transaction with the same idempotencyKey already exists

  const isTransactionExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      throw new APiError(
        409,
        "Transaction with the same idempotency key already exists and is completed",
      );
    }

    if (isTransactionExists.status === "PENDING") {
      throw new APiError(
        409,
        "Transaction with the same idempotency key already exists and is pending",
      );
    }

    if (isTransactionExists.status === "FAILED") {
      throw new APiError(
        409,
        "Transaction with the same idempotency key already exists and is failed",
      );
    }

    if (isTransactionExists.status === "REVERSED") {
      throw new APiError(
        409,
        "Transaction with the same idempotency key already exists and is reversed",
      );
    }
  }

  if (fromUserAccount.status === "ACTIVE") {
    throw new APiError(403, "From account is not active");
  }

  if (toUserAccount.status === "ACTIVE") {
    throw new APiError(403, "To account is not active");
  }

  return res
    .status(201)
    .json(new APiResponse(201, { transaction: null }, "Transaction template"));
});

const createInitialFundsTransaction = asyncHandler(async (_req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    throw new APiError(
      400,
      "fromAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  const toUserAccount = await Account.findOne({
    // Acount to which money is being transferred
    _id: toAccount,
  });

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  const fromUserAccount = await Account.findOne({
    _id: req.user._id,
  });

  if (!fromUserAccount) {
    throw new APiError(404, "invalid fromAccount, account not found");
  }

  // Check if transaction with the same idempotencyKey already exists
  //single and straightforward meaning: "Either everything will happen, or nothing will happen (All or Nothing)
  const session = await mongoose.startSession();

  // it means that all the operations within this transaction will either succeed or fail together. If any operation fails, the entire transaction will be rolled back, ensuring data integrity and consistency.
  session.startTransaction();

  const transaction = await Transaction({
    fromAccount: fromUserAccount._id,
    toAccount: toUserAccount._id,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await Ledger.create([
    {
      account: fromUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  ]);

  const creditLedgerEntry = await Ledger.create([
    {
      account: toUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  ]);

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res
    .status()
    .json(
      new APiResponse(
        201,
        { transaction },
        "Initial funds transaction template",
      ),
    );
});

export { createTransaction, createInitialFundsTransaction };

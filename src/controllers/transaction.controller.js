import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import Transaction from "../models/transaction.model.js";
import Ledger from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";
import { sendTransactionEmail } from "../services/email.service.js";
import mongoose from "mongoose";

// THE 10-STEP TRANSFER FLOW:
//      * 1. Validate request
//      * 2. Validate idempotency key
//      * 3. Check account status
//      * 4. Derive sender balance from ledger
//      * 5. Create transaction (PENDING)
//      * 6. Create DEBIT ledger entry
//      * 7. Create CREDIT ledger entry
//      * 8. Mark transaction COMPLETED
//      * 9. Commit MongoDB session
//      * 10. Send email notification

const createTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  /**
   * (1) Validate request
   **/

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new APiError(
      400,
      "fromAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  // my account
  const fromUserAccount = await accountModel.findOne({
    userId: req.user._id,
  });

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  // account to which i want to transfer money
  const toUserAccount = await Account.findOne({
    _id: toAccount,
  }).populate("user", "email name");

  if (!fromUserAccount) {
    throw new APiError(404, "invalid fromAccount, account not found");
  }

  /**  (2) Validate idempotency key:
   *   This step checks if a transaction with the same idempotency key already exists in the system.
   *   If such a transaction exists, the system checks its status (COMPLETED, PENDING, FAILED, REVERSED)
   **/

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

  /**  (3) Check account status:
   *   This step verifies that both the sender's and receiver's accounts are in an "ACTIVE" state.
   *   If either account is not active (e.g., FROZEN or CLOSED),
   **/

  if (fromUserAccount.status === "ACTIVE") {
    throw new APiError(403, "From account is not active");
  }

  if (toUserAccount.status === "ACTIVE") {
    throw new APiError(403, "To account is not active");
  }

  /**
   * (4) Derive sender balance from ledger
   **/
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    throw new APiError(403, "Insufficient balance in from account");
  }

  /**
   * (5) Create transaction (PENDING)
   **/
  let transaction;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = await Transaction.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount: toUserAccount._id,
          status: "PENDING",
          amount,
          idempotencyKey,
        },
      ],
      { session },
    );

    /** 
       * (6) Create DEBIT ledger entry 
    **/
    const debitLedgerEntry = await Ledger.create(
      [
        {
          account: fromUserAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

     await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })()

    /** 
       * (7) Create CREDIT ledger entry 
    **/
    const creditLedgerEntry = await Ledger.create(
      [
        {
          account: toUserAccount._id,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );


    /**
       * (8) Mark transaction COMPLETED 
    **/
     await Transaction.findoneAndUpdate(
         { _id:transaction._id },
         { status:"COMPLETED" },
         {session}
      )   

    
      /**
         * (9) Commit MongoDB session
       **/

     await session.commitTransaction()
     session.endSession()

     

  } catch (error) {
    throw new APiError(500, `Transaction failed: ${error.message}`);
  }

  await sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount._id,
    "DEBIT",
  );

  await sendTransactionEmail(
    toUserAccount.user.email,
    toUserAccount.user.name,
    amount,
    toUserAccount._id,
    "CREDIT",
  );

  
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

  //account which add funds to my account
  const toUserAccount = await Account.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  // my account
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

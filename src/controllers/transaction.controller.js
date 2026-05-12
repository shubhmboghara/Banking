import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import Transaction from "../models/transaction.model.js";
import Ledger from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";
import { sendTransactionEmail } from "../services/email.service.js";
import mongoose from "mongoose";



const createTransaction = asyncHandler(async (req, res) => {
  const { toAccount,fromAccount, amount, idempotencyKey } = req.body;

  /**
     * (1) Validate request
   **/

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new APiError(
      400,
      "fromUserAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  const fromUserAccount = await Account.findOne({
      _id: fromAccount,
      user: req.user._id,
  });

  if (!fromUserAccount) {
    throw new APiError(404, "invalid fromAccount, account not found or does not belong to you");
  }

  const toUserAccount = await Account.findOne({
    _id: toAccount,
  }).populate("user", "email name");

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
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
      throw new APiError(409, "Transaction already processed");
    }

    if (isTransactionExists.status === "PENDING") {
      throw new APiError(409, "Transaction is still processing");
    }

    if (isTransactionExists.status === "FAILED") {
      throw new APiError(409, "Transaction already processed");
    }

    if (isTransactionExists.status === "REVERSED") {
      throw new APiError(409, "Transaction already processed");
    }
  }

  /**  (3) Check account status:
   *   This step verifies that both the sender's and receiver's accounts are in an "ACTIVE" state.
   *   If either account is not active (e.g., FROZEN or CLOSED),
   **/

  if (fromUserAccount.status !== "ACTIVE") {
    throw new APiError(403, "From account is not active");
  }

  if (toUserAccount.status !== "ACTIVE") {
    throw new APiError(403, "To account is not active");
  }

  /**
   * (4) Derive sender balance from ledger
   **/
  const balance = await fromUserAccount.getBalance();

  if (balance < Number(amount)) {
    throw new APiError(400, "Insufficient balance in from account");
  }

  /**
   * (5) Create transaction (PENDING)
   **/
  let transaction;
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const createdTransactions = await Transaction.create(
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
    transaction = createdTransactions[0];

    /** 
       * (6) Create DEBIT ledger entry 
    **/
    await Ledger.create(
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

    /** 
       * (7) Create CREDIT ledger entry 
    **/
    await Ledger.create(
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
      await Transaction.findOneAndUpdate(
         { _id:transaction._id },
         { status:"COMPLETED" },
        { session }
      )   

    
      /**
         * (9) Commit MongoDB session
       **/

     await session.commitTransaction();

  } catch (error) {
    throw new APiError(500, `Transaction failed: ${error.message}`);
  } finally {
    if (session) {
      session.endSession();
    }
  }

  /** 
       * (10) Send email notification 
  **/

  try {
    if (req.user.email) {
      await sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        toUserAccount._id,
        "DEBIT",
      );
    }

    if (toUserAccount.user?.email) {
      await sendTransactionEmail(
        toUserAccount.user.email,
        toUserAccount.user.name,
        amount,
        toUserAccount._id,
        "CREDIT",
      );
    }
  } catch (emailError) {
    console.error('Email notification failed:', emailError?.message);
  }

  
  return res
    .status(201)
    .json(
      new APiResponse(201, { transaction }, "Transaction completed successfully"),
    );
});

const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;



  if (req.user.role !== "SYSTEM") {
    throw new APiError(403, "Access Denied: Only the SYSTEM account can mint money.");
  }

  if (!toAccount || !amount || !idempotencyKey) {
    throw new APiError(
      400,
      "fromAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  //account which add funds to my account
  const toUserAccount = await Account.findOne({
    _id: toAccount,
  }).populate("user", "email name");

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  const fromUserAccount = await Account.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    throw new APiError(404, "invalid fromAccount, account not found");
  }

  // Check if transaction with the same idempotencyKey already exists
  //single and straightforward meaning: "Either everything will happen, or nothing will happen (All or Nothing)
  const session = await mongoose.startSession();

  // it means that all the operations within this transaction will either succeed or fail together. If any operation fails, the entire transaction will be rolled back, ensuring data integrity and consistency.
  session.startTransaction();

  const createdTransactions = await Transaction.create(
    [
      {
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING",
      },
    ],
    { session },
  );
  const transaction = createdTransactions[0];

  await Ledger.create(
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

  await Ledger.create(
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

  await Transaction.findOneAndUpdate(
    { _id: transaction._id },
    { status: "COMPLETED" },
    { session },
  );

  await session.commitTransaction();
  session.endSession();

  /** 
   * Send email notifications for initial funds transaction
  **/

  try {
    if (toUserAccount.user?.email) {
      await sendTransactionEmail(
        toUserAccount.user.email,
        toUserAccount.user.name,
        amount,
        toUserAccount._id,
        "CREDIT",
      );
    }

    if (req.user.email) {
      await sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        fromUserAccount._id,
        "DEBIT",
      );
    }
  } catch (emailError) {
    console.error('Email notification failed:', emailError?.message);
    // Don't throw - transaction succeeded, just email failed
  }

  return res
    .status(201)
    .json(
      new APiResponse(
        201,
        { transaction },
        "Initial funds transaction created successfully",
      ),
    );
});

export { createTransaction, createInitialFundsTransaction };

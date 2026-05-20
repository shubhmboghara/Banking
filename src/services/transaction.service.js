import Transaction from "../models/transaction.model.js";
import Ledger from "../models/ledger.model.js";
import { Account } from "../models/account.model.js";
import {
  sendTransactionEmail,
  sendTransactionfailedEmail,
} from "../services/email.service.js";
import mongoose from "mongoose";
import APiError from "../util/ApiError.js";

const CreateTransactionService = async (
  toAccount,
  fromAccount,
  amount,
  idempotencyKey,
  userId,
  isSystemTransaction = false,
  mpin,
) => {
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    throw new APiError(400, "Invalid amount, must be a positive number");
  }

  if (fromAccount === toAccount) {
    throw new APiError(400, "Cannot transfer funds to the same account.");
  }

  /**  (1) Validate idempotency key:
   *   This step checks if a transaction with the same idempotency key already exists in the system.
   *   If such a transaction exists, the system checks its status (COMPLETED, PENDING, FAILED, REVERSED)
   **/

  const isTransactionExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      throw new APiError(
        200,
        "Transaction with this idempotency key already exists and is completed",
      );
    }

    if (isTransactionExists.status === "PENDING") {
      throw new APiError(
        409,
        "Transaction with this idempotency key is already in progress",
      );
    }

    if (["FAILED", "REVERSED"].includes(isTransactionExists.status)) {
      throw new APiError(
        409,
        `Transaction with this idempotency key already exists with status: ${isTransactionExists.status}`,
      );
    }
  }

  let fromUserAccount;

  if (isSystemTransaction) {

    fromUserAccount = await Account.findOne({ user: userId })
      .populate("user", "email name")
      .select("+mpin");
  } 
  else {
    
    fromUserAccount = await Account.findOne({
      accountNumber: fromAccount,
      user: userId,
    }).populate("user", "email name")
      .select("+mpin");
  }

  if (!fromUserAccount) {
    throw new APiError(
      404,
      "invalid fromAccount, account not found or does not belong to you",
    );
  }

  const isMPINValid = await fromUserAccount.isMPINCorrect(mpin);

  if (!isMPINValid) {
    throw new APiError(401, "Invalid MPIN provided");
  }

  const toUserAccount = await Account.findOne({
    accountNumber: toAccount,
  }).populate("user", "email name");

  if (!toUserAccount) {
    throw new APiError(404, "invalid toAccount, account not found");
  }

  /**  (2) Check account status:
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
   * (3) Derive sender balance from ledger
   **/

  if (!isSystemTransaction) {
    const balance = await fromUserAccount.getBalance();

    if (balance === null || balance === undefined || balance < numAmount) {
      throw new APiError(400, "Insufficient balance in from account");
    }
  }
  /**
   * (4) Create transaction (PENDING)
   **/
  let transaction;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction({ maxCommitTimeMS: 10000 });

    const createdTransactions = await Transaction.create(
      [
        {
          fromAccount: fromUserAccount._id,
          toAccount: toUserAccount._id,
          status: "PENDING",
          amount: numAmount,
          idempotencyKey,
        },
      ],
      { session },
    );
    transaction = createdTransactions[0];

    /**
     * (5) Create DEBIT  and CREDIT ledger entry
     **/

    await Ledger.insertMany(
      [
        {
          account: fromUserAccount._id,
          counterparty: toUserAccount._id,
          amount: numAmount,
          transaction: transaction._id,
          type: "DEBIT",
        },
        {
          account: toUserAccount._id,
          counterparty: fromUserAccount._id,
          amount: numAmount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    /**
     * (6) Mark transaction COMPLETED
     **/

    await Transaction.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    /**
     * (7) Commit MongoDB session
     **/

    await session.commitTransaction();
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Transaction Error (Internal):", error.message);

    const txError = new APiError(
      500,
      "Transaction could not be processed at this time. Please try again.",
    );
    Promise.allSettled([
      fromUserAccount.user?.email
        ? sendTransactionfailedEmail(
            fromUserAccount.user.email,
            fromUserAccount.user.name,
            numAmount,
            toAccount,
            "DEBIT",
          )
        : null,
      toUserAccount?.user?.email
        ? sendTransactionfailedEmail(
            toUserAccount.user.email,
            toUserAccount.user.name,
            numAmount,
            toUserAccount.accountNumber,
            "CREDIT",
          )
        : null,
    ]).catch((err) =>
      console.error("Failure notification background error:", err),
    );

    throw txError;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  /**
   * (8) Send email notification
   **/

  try {
    if (fromUserAccount.user?.email) {
      await sendTransactionEmail(
        fromUserAccount.user.email,
        fromUserAccount.user.name,
        numAmount,
        toUserAccount.accountNumber,
        "DEBIT",
      );
    }

    if (toUserAccount.user?.email) {
      await sendTransactionEmail(
        toUserAccount.user.email,
        toUserAccount.user.name,
        numAmount,
        toUserAccount.accountNumber,
        "CREDIT",
      );
    }
  } catch (emailError) {
    console.error("Email notification failed:", emailError?.message);
  }

  const transactionResponse = transaction.toObject();
  transactionResponse.fromAccount = fromUserAccount.accountNumber;
  transactionResponse.toAccount = toUserAccount.accountNumber;

  return transactionResponse;
};

export { CreateTransactionService };

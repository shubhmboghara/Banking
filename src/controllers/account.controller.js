import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import { Account } from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";

// Small helper so every controller returns the same API shape.

const respond = (res, statusCode, data = {}, message = "Success") =>
  res.status(statusCode).json(new APiResponse(statusCode, data, message));

const createAccount = asyncHandler(async (req, res) => {
  const user = req.user;
  
  if (!user) {
    throw new APiError(401, "Unauthorized");
  }
  const account = await Account.create({
     user:user._id
  })

  
  return respond(res, 201, { Account: account }, "Account template");
});

const getUserAccounts = asyncHandler(async (req, res) => {
  return respond(res, 200, { accounts: [] }, "Accounts template");
});

const getAccountBalance = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  return respond(res, 200, { accountId, balance: null }, "Balance template");
});

export {
  createAccount,
  getUserAccounts,
  getAccountBalance,
};

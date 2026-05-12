import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import { Account } from "../models/account.model.js";

const createAccount = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new APiError(401, "Unauthorized");
  }
  const account = await Account.create({
    user: user._id,
  });

  return res
    .status(201)
    .json(
      new APiResponse(
        201,
        { Account: account },
        "Account created successfully",
      ),
    );
});

const getUserAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id });

  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        { accounts: accounts },
        "Current user fetched successfully",
      ),
    );
});

const getAccountBalance = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!accountId) {
    throw new APiError(400, "Account ID is required");
  }

  const account = await Account.findById({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    throw new APiError(404, "Account not found");
  }

  const balance = await account.getBalance();

  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        { accountId: account._id, balance: balance },
        "Balance fetched successfully",
      ),
    );
});

export { createAccount, getUserAccounts, getAccountBalance };

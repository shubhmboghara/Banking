import APiResponse from "../util/ApiResponse.js";
import asyncHandler from "../util/asyncHandler.js";

// Small helper so every controller returns the same API shape.
const respond = (res, statusCode, data = {}, message = "Success") =>
  res.status(statusCode).json(new APiResponse(statusCode, data, message));

// Template: replace this with real account creation logic later.
const createAccountController = asyncHandler(async (req, res) => {
  return respond(res, 201, { account: null }, "Account template");
});

// Template: replace this with real user-account listing logic later.
const getUserAccountsController = asyncHandler(async (req, res) => {
  return respond(res, 200, { accounts: [] }, "Accounts template");
});

// Template: replace this with real balance lookup logic later.
const getAccountBalanceController = asyncHandler(async (req, res) => {
  const { accountId } = req.params;
  return respond(res, 200, { accountId, balance: null }, "Balance template");
});

export {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
};

import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/ApiError.js";
import asyncHandler from "../util/asyncHandler.js";
import {
  OpenAccountService,
  GetUserAccountsService,
  GetAccountBalanceService,
} from "../services/account.service.js";

const createAccount = asyncHandler(async (req, res) => {
  const { accountType,mpin } = req.body ;
  const user = req.user;

  if(!mpin){
    throw new APiError(400, "MPIN is required to open an account");
  }

  if (!user) {
    throw new APiError(401, "Unauthorized");
  }

  const account = await OpenAccountService(user._id, accountType, mpin);

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
  const accounts = await GetUserAccountsService(req.user._id);

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
  const { accountNumber } = req.params;

  if (!accountNumber) {
    throw new APiError(400, "Account number is required");
  }

  const balance  = await GetAccountBalanceService(
    accountNumber,
    req.user._id,
  );

  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        { accountNumber: accountNumber, balance: balance  },
        "Balance fetched successfully",
      ),
    );
});

export { createAccount, getUserAccounts, getAccountBalance };

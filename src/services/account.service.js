import { Account } from "../models/account.model.js";
import APiError from "../util/ApiError.js";

const OpenAccountService = async (userId, accountType, mpin) => {
  const account = await Account.create({
    user: userId,
    accountType: accountType,
    mpin: mpin,
  });

  if (!account) {
    throw new APiError(500, "Failed to create account");
  }

  return account;
};

const GetUserAccountsService = async (userId) => {
  const accounts = await Account.find({ user: userId });
  
  if (!accounts?.length) {
    throw new APiError(404, "No accounts found for this user");
  }

  return accounts;
};

const GetAccountBalanceService = async (accountId, userId) => {

  const account = await Account.findOne({
    _id: accountId,
    user: userId,
  });

  if (!account) {
    throw new APiError(404, "Account not found");
  }

  const balance = await account.getBalance();

  if(balance === null || balance === undefined) { 
    throw new APiError(500, "Failed to fetch account balance");
  }


  return balance;
};

export  {
  OpenAccountService,
  GetUserAccountsService,
  GetAccountBalanceService,
};

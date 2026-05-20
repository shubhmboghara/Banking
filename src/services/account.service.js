import { Account } from "../models/account.model.js";
import APiError from "../util/ApiError.js";
import generateNewAccountNumber from "./accountNumber.service.js";

const OpenAccountService = async (userId, accountType, mpin) => {
  const newAccount = Account({
    user: userId,
    accountType: accountType,
    mpin: mpin,
  });

  const ValidationError = newAccount.validateSync([
    "user",
    "accountType",
    "mpin",
  ]);

  if (ValidationError) {
    throw new APiError(400, "Invalid account data", ValidationError.errors);
  }

  newAccount.accountNumber = await generateNewAccountNumber();
  const account = await newAccount.save();

  if (!account) {
    throw new APiError(500, "Failed to create account");
  }

  const acc = account.toJSON();

  return acc;
};

const GetUserAccountsService = async (userId) => {
  const accounts = await Account.find({ user: userId });

  if (!accounts?.length) {
    throw new APiError(404, "No accounts found for this user");
  }

  return accounts;
};

const GetAccountBalanceService = async (accountNumber, userId) => {
  
  const account = await Account.findOne({
    accountNumber: accountNumber,
    user: userId,
  });

  if (!account) {
    throw new APiError(404, "Account not found");
  }

  const balance = await account.getBalance();

  if (balance === null || balance === undefined) {
    throw new APiError(500, "Failed to fetch account balance");
  }

  return balance;
};

export { OpenAccountService, GetUserAccountsService, GetAccountBalanceService };

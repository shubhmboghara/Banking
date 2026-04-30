import APiResponse from "../util/ApiResponse.js";
import APiError from "../util/AppError.js";
import asyncHandler from "../util/asyncHandler.js";
import Transaction from "../models/transaction.model.js";

const respond = (res, statusCode, data = {}, message = "Success") =>
  res.status(statusCode).json(new APiResponse(statusCode, data, message));

const createTransaction = asyncHandler(async (_req, res) => {

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new APiError(400, "fromAccount, toAccount, amount and idempotencyKey are required");
  }


  return respond(res, 201, { transaction:  }, "Transaction template");

});

const createInitialFundsTransaction = asyncHandler(async (_req, res) => {
  return respond(res, 201, { transaction: null }, "Initial funds template");
});

export { createTransaction, createInitialFundsTransaction };

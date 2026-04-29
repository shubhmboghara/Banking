import APiResponse from "../util/ApiResponse.js";
import asyncHandler from "../util/asyncHandler.js";

// Small helper so every controller returns the same API shape.
const respond = (res, statusCode, data = {}, message = "Success") =>
  res.status(statusCode).json(new APiResponse(statusCode, data, message));

// Template: replace this with real transaction creation logic later.
const createTransaction = asyncHandler(async (req, res) => {
  return respond(res, 201, { transaction: null }, "Transaction template");
});

// Template: replace this with real initial-funds logic later.
const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  return respond(res, 201, { transaction: null }, "Initial funds template");
});

export { createTransaction, createInitialFundsTransaction };

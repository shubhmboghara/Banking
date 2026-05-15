  import APiResponse from "../util/ApiResponse.js";
  import APiError from "../util/ApiError.js";
  import asyncHandler from "../util/asyncHandler.js";
  import  {  CreateTransactionService } from "../services/transaction.service.js";



  const createTransaction = asyncHandler(async (req, res) => {
    const { toAccount,fromAccount, amount, idempotencyKey,mpin } = req.body;

    // Validate request
    

    if (!fromAccount || !toAccount || !amount || !idempotencyKey || !mpin) {
      throw new APiError(
        400,
        "fromUserAccount, toAccount, amount, idempotencyKey and mpin are required",
      );
    }


    const transaction = await CreateTransactionService(toAccount,fromAccount, amount, idempotencyKey,req.user._id, false, mpin);
    

  return res
      .status(201)
      .json(
        new APiResponse(201, { transaction }, "Transaction created successfully"),
      );
  });




  const createInitialFundsTransaction = asyncHandler(async (req, res) => {
    const { toAccount, amount, idempotencyKey, mpin } = req.body;

     if (!toAccount || !amount || !idempotencyKey || !mpin) { 
      throw new APiError(
        400,
        "toAccount, amount, idempotencyKey and mpin are required",
      );
    }
    

    if (req.user.role !== "SYSTEM") {
      throw new APiError(403, "Access Denied: Only the SYSTEM account can mint money.");
    }



    const transaction = await CreateTransactionService( toAccount, null,amount, idempotencyKey ,req.user._id,true,mpin);
    
    
    
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

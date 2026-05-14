  import APiResponse from "../util/ApiResponse.js";
  import APiError from "../util/ApiError.js";
  import asyncHandler from "../util/asyncHandler.js";
  import  {  CreateTransactionService } from "../services/transaction.service.js";



  const createTransaction = asyncHandler(async (req, res) => {
    const { toAccount,fromAccount, amount, idempotencyKey } = req.body;

    // Validate request
    

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      throw new APiError(
        400,
        "fromUserAccount, toAccount, amount and idempotencyKey are required",
      );
    }


    const transaction = await CreateTransactionService(toAccount,fromAccount, amount, idempotencyKey,req.user._id);
    

  return res
      .status(201)
      .json(
        new APiResponse(201, { transaction }, "Transaction created successfully"),
      );
  });




  const createInitialFundsTransaction = asyncHandler(async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;



    if (req.user.role !== "SYSTEM") {
      throw new APiError(403, "Access Denied: Only the SYSTEM account can mint money.");
    }



    const transaction = await CreateTransactionService( toAccount, null,amount, idempotencyKey ,req.user._id,true);
    
    
    
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

import { sequenceRedisClient } from "../config/sequenceRedis.config.js";
import { Sequence } from "../models/sequence.model.js";
import { Account } from "../models/account.model.js";
import ApiError from "../util/ApiError.js";

const chunkSize = Number(process.env.CHUNK_SIZE) || 10;

const LUA_SCRIPT = `
       local maxSqe = redis.call("GET", KEYS[2])

       if not maxSqe then
           return -1
        end 

       local currentSeq = redis.call("INCR", KEYS[1]) 
       
       if currentSeq > tonumber(maxSqe) then 
           return -1
        end   

        return  currentSeq
    `;

const formatAccountNumber = (sequenceId) =>{

     const branchCode = process.env.BRANCH_CODE || "7080";
     const paddedSeq = sequenceId.toString().padStart(10,"0")
     const baseNumber = `${branchCode}${paddedSeq}`

     const modString = `${baseNumber}00`
     const mod97 = BigInt(modString) % 97n
     const checkDigitNum = 98n - mod97

     const checkDigits = checkDigitNum.toString().padStart(2,"0")

     return `${baseNumber}${checkDigits}`
}    

const generateNewAccountNumber = async () => {
    if (!sequenceRedisClient.isOpen) {
        throw new ApiError(
            500,
            "Account generator service is currently unavailable.",
        );
    }

    try {
        let currentSeq = await sequenceRedisClient.eval(LUA_SCRIPT, {
            keys: ["banking:accountno:currentSeq", "banking:accountno:maxSeq"],
        });

        if (currentSeq === -1) {
            console.log(`[CHUNKING] Reserving new ${chunkSize} numbers from MongoDB...`,);
            
            const  doc = await Sequence.findOneAndUpdate(
                {_id:"ACCOUNT_NO"},
                {$inc:{seq: chunkSize}},
                {new:true, upsert:true},
            );

            const newMax = doc.seq;
            currentSeq = newMax - chunkSize + 1; 

            await sequenceRedisClient.set("banking:accountno:currentSeq",currentSeq)
            await sequenceRedisClient.set("banking:accountno:maxSeq",newMax)
        }

         return formatAccountNumber(currentSeq)


    } catch (error) {
        throw new ApiError(
            500,
            "An error occurred while generating a new account number.",
        );
    }
};

export default generateNewAccountNumber;
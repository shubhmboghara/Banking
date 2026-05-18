import { Schema, model } from "mongoose";
import ledgerModel from "./ledger.model.js";
import bcrypt from "bcryptjs";  

const accountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must be associated with a user"],
      index: true,
    },

    accountType: {
      type: String,
      uppercase: true,  
      enum: ["SAVINGS", "CURRENT"],
      default: "SAVINGS",
    },

    // accountNumber:{
    //   type: String,
    //   unique:true,
    //   required:[true,"Account number is required"],
    // },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE, FROZEN or CLOSED",
      },
      default: "ACTIVE",
    },

    mpin: {
      type: String,
      maxlength: [6, "MPIN must be 6 digits"],
      minlength: [6, "MPIN must be 6 digits"],
      required: [true, "MPIN is required"],
      select: false,

    },

    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);


accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },

    {
      $group: {
        _id: null,

        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },

        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  if (balanceData.length === 0) {
    return 0;
  }
  return balanceData[0].balance;
};


// in  Registration time  MPIN  is stored in  RAM  and so it check isModified(123) , 
// perviously sate undefined  -> current sate 123 so   isModified is true but  we have ! NOT operator so it become flase and it go it hash 
// than it store in db

//but in case of upadte perviously sate == current sate have 123  so isModified is false but we have ! NOT operator so it become true and it skip hash and save as it is
// than it store in db 

accountSchema.pre("save", async function () {
   if(!this.isModified("mpin")) return

   const hash = await bcrypt.hash(this.mpin, 12);
   this.mpin = hash; 
  
})

accountSchema.methods.isMPINCorrect = async function (mpin) {
  return await bcrypt.compare(mpin, this.mpin);
};

accountSchema.methods.toJSON = function () {
  const accountObj = this.toObject();
  delete accountObj.mpin;
  return accountObj;
};





export const Account = model("Account", accountSchema);

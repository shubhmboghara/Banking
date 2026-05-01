import { Schema, model } from "mongoose";
import APiError from "../util/AppError.js";

const ledgerSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Ledger must be associated with an account"],
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a ledger entry"],
    immutable: true,
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "Ledger must be associated with a transaction"],
    index: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
      message: "Type can be either CREDIT or DEBIT",
    },
    required: [true, "Ledger type is required"],
    immutable: true,
  },
});

function preventLedgerModification() {
  throw new APiError(
    "Ledger entries cannot be modified or deleted once created",
    400,
  );
}

ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("update", preventLedgerModification);
ledgerSchema.pre(
  "deleteOne",
  { document: true, query: true },
  preventLedgerModification,
);
ledgerSchema.pre(
  "updateOne",
  { document: true, query: true },
  preventLedgerModification,
);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);
ledgerSchema.pre("bulkWrite", preventLedgerModification);
ledgerSchema.pre("save", preventLedgerModification);

const Ledger = model("Ledger", ledgerSchema);

export default Ledger;

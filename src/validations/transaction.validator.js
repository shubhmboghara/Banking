import { z } from "zod";

const CreateTransactionSchema = z.object({
  body: z.object({
    toAccount: z
      .string({
        required_error: "toAccount is required",
        invalid_type_error: "toAccount must be a string",
      })
      .trim()
      .min(1, "toAccount is required")
      .length(16, "toAccount must be a valid 16-digit account number"),

    fromAccount: z
      .string({
        required_error: "fromAccount is required",
        invalid_type_error: "fromAccount must be a string",
      })
      .trim()
      .min(1, "fromAccount is required")
      .length(16, "fromAccount must be a valid 16-digit account number"),

    amount: z
      .number({
        required_error: "amount is required",
        invalid_type_error: "amount must be a number",
      })
      .positive("amount must be 1 or greater"),

    mpin: z
      .string({
        required_error: "mpin is required",
        invalid_type_error: "mpin must be a string",
      })
      .trim()
      .min(1, "mpin is required"),

    idempotencyKey: z
      .string({
        required_error: "idempotencyKey is required",
        invalid_type_error: "idempotencyKey must be a string",
      })
      .trim()
      .min(1, "idempotencyKey is required")
      .uuid("Invalid idempotencyKey format, must be a valid UUID"),
  }),
});

const InitialFundsTransactionSchema = z.object({
  body: z.object({
    toAccount: z
      .string({
        required_error: "toAccount is required",
        invalid_type_error: "toAccount must be a string",
      })
      .trim()
      .min(1, "toAccount is required")
      .length(16, "toAccount must be a valid 16-digit account number"),

    amount: z
      .number({
        required_error: "amount is required",
        invalid_type_error: "amount must be a number",
      })
      .positive("amount must be 1 or greater"),

    mpin: z
      .string({
        required_error: "MPIN is required",
        invalid_type_error: "MPIN must be a string",
      })
      .trim()
      .min(1, "MPIN is required"),

    idempotencyKey: z
      .string({
        required_error: "idempotencyKey is required",
        invalid_type_error: "idempotencyKey must be a string",
      })
      .trim()
      .uuid("Invalid idempotencyKey format, must be a valid UUID"),
  }),
});

export { CreateTransactionSchema, InitialFundsTransactionSchema };

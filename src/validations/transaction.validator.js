import { z } from "zod";

const CreateTransactionSchema = z.object({
  body: z.object({
    toAccount: z
      .string({
        required_error: "toAccount is required",
        invalid_type_error: "toAccount must be a string",
      })
      .trim()
      .length(24, "toAccount must be a valid 24-character hex string"),

    fromAccount: z
      .string({
        required_error: "fromAccount is required",
        invalid_type_error: "fromAccount must be a string",
      })
      .trim()
      .length(24, "fromAccount must be a valid 24-character hex string"),

    amount: z
      .number({
        required_error: "amount is required",
        invalid_type_error: "amount must be a number",
      })
      .min(1, "amount must be a positive integer"),

    idempotencyKey: z
      .string({
        required_error: "idempotencyKey is required",
        invalid_type_error: "idempotencyKey must be a string",
      })
      .trim()
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
      .length(24, "toAccount must be a valid 24-character hex string"),

    amount: z
      .number({
        required_error: "amount is required",
        invalid_type_error: "amount must be a number",
      })
      .min(1, "amount must be a positive integer"),

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

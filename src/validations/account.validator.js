import { z } from "zod";

const createAccountSchema = z.object({
  body: z.object({
    accountType: z
      .string()
      .trim()
      .toUpperCase()
      .pipe(
        z.enum(["SAVINGS", "CURRENT"], {
          invalid_type_error: "Account type must be either SAVINGS or CURRENT",
        }),
      )
      .optional(),

    mpin: z
      .string({
        required_error: "MPIN is required to open an account",
        invalid_type_error: "MPIN must be a string",
      })
      .trim()
      .min(1, "MPIN is required")
      .length(6, "MPIN must be exactly 6 digits"),
  }),
});

const getAccountBalanceSchema = z.object({
  params: z.object({
    accountId: z
      .string({
        required_error: "Account ID is required",
        invalid_type_error: "Account ID must be a string",
      })
      .trim()
      .min(1, "Account ID is required")
      .length(24, "Account ID must be a valid 24-character hex string"),

  }),
});

export { createAccountSchema, getAccountBalanceSchema };

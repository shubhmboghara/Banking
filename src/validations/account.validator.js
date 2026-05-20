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
    accountNumber: z
      .string({
        required_error: "Account number is required",
        invalid_type_error: "Account number must be a string",
      })
      .trim()
      .min(16, "Account number is required")
      .length(16, "Account number must be exactly 16 digits")
      .regex(/^\d{16}$/, "Account number must contain only digits"),

  }),
});

export { createAccountSchema, getAccountBalanceSchema };

import { z } from "zod";

createAccountSchema = z.object({
  body: z.object({
    accountType: z
      .enum(["SAVINGS", "CHECKING"], {
        invalid_type_error: "Account type must be either SAVINGS or CHECKING",
      })
      .trim()
      .optional(),
  }),

  mpin: z
    .number({
      required_error: "MPIN is required to open an account",
      invalid_type_error: "MPIN must be a number",
    })
    .max(6, "MPIN must be at most 6 digits long")
    .min(6, "MPIN must be at least 6 digits long"),
});

const getAccountBalanceSchema = z.object({
  params: z.object({
    accountId: z
      .string({
        required_error: "Account ID is required",
        invalid_type_error: "Account ID must be a string",
      })
      .trim(),
  }),
});

export { createAccountSchema, getAccountBalanceSchema };

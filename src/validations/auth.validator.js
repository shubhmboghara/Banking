import { z } from "zod";

const registerUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .min(1, "Name is required")
      .trim(),

    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .trim()
      .min(1, "Email is required")
      .email("Invalid email format"),

    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .trim()
      .min(6, "Password must be at least 6 characters long"),
  }),
});

const loginUserServiceSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .trim()
      .min(1, "Email is required")
      .email("Invalid email format"),

    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .trim()
      .min(6, "Password must be at least 6 characters long"),
  }),
});

export { registerUserSchema, loginUserServiceSchema };

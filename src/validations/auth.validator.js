import { z } from "zod";

const emailValidator = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .trim()
  .min(1, "Email is required")
  .email("Invalid email format");

const passwordValidator = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .trim()
  .min(6, "Password must be at least 6 characters long");




  const registerUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .min(1, "Name is required")
      .trim(),

    email: emailValidator,
    password: passwordValidator,
  }),
});

const loginUserServiceSchema = z.object({
  body: z.object({
    email: emailValidator,
    password: passwordValidator,
  }),
});

const sendEmailOtpSchema = z.object({
  body: z.object({
    email: emailValidator,
  }),
});

const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: emailValidator,
    otp: z
      .string({
        required_error: "OTP is required",
        invalid_type_error: "OTP must be a string",
      })
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
  }),
});

export { registerUserSchema, loginUserServiceSchema, sendEmailOtpSchema, verifyEmailOtpSchema };

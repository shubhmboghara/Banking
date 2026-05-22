import APiError from "../util/ApiError.js";
import APiResponse from "../util/ApiResponse.js";
import asyncHandler from "../util/asyncHandler.js";
import sessionCookieOptions from "../config/sessioncookie.config.js";
import {
  RegisterUserService,
  loginUserService,
} from "../services/auth.service.js";
im

/**
 * - user register controller
 * - POST /api/auth/register
 */

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  

  const createdUser = await RegisterUserService(name, email, password);

  return res
    .status(201)
    .json(
      new APiResponse(201, { user: createdUser }, "Registered successfully"),
    );
});

/**
 * - user login controller
 * - POST /api/auth/login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  

  const { loggedInUser, userId } = await loginUserService(email, password);

  req.session.userId = userId;
  req.session.isLoggedIn = true;

  return res
    .status(200)
    .json(
      new APiResponse(200, { user: loggedInUser }, "Logged in successfully"),
    );
});

/**
 * - user logout controller
 * - POST /api/auth/logout
 */
const logoutUser = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new APiError(500, "Failed to log out");
    }
  });

  return res
    .status(200)
    .clearCookie("connect.sid", sessionCookieOptions)
    .json(new APiResponse(200, {}, "Logged out successfully"));
});

/**
 * - user current controller
 * - GET /api/auth/current-user
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        req.user || null,
        "Current user fetched successfully",
      ),
    );
});

const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await SendEmailOtpService(email)

  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        {},
        "OTP sent to email successfully",
      ),
    );
})

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await VerifyEmailOtpService(email, otp)

  return res
    .status(200)
    .json(
      new APiResponse(
        200,
        {},
        "OTP verified successfully",
      ),
    );
} ) 

export { registerUser, loginUser, logoutUser, getCurrentUser };

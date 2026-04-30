import APiError from "../util/AppError.js";
import APiResponse from "../util/ApiResponse.js";
import asyncHandler from "../util/asyncHandler.js";
import { User } from "../models/user.model.js";
import { sessionCookieOptions } from "../config/session.js";
import { sendRegistrationEmail } from "../services/email.service.js";
/**
 * - user register controller
 * - POST /api/auth/register
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new APiError(400, "Name, email and password are required");
  }

  const isExists = await User.findOne({ email });

  if (isExists) {
    throw new APiError(409, "User with this email already exists");
  }

  const newUser = await User.create({ name, email, password });

  if (!newUser) {
    throw new APiError(500, "Failed to create user");
  }

  const createdUser = await User.findById(newUser._id).select("-password");
  
  await sendRegistrationEmail(email, name);

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

  if (!email || !password) {
    throw new APiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new APiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APiError(401, "Invalid credentials");
  }

  req.session.userId = user._id;
  req.session.isLoggedIn = true;

  const loggedInUser = await User.findById(user._id).select("-password");

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

  res.clearCookie("connect.sid", sessionCookieOptions);

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

export { registerUser, loginUser, logoutUser, getCurrentUser };

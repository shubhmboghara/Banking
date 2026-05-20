import { User } from "../models/user.model.js";
import APiError from "../util/ApiError.js";
import {
  sendRegistrationEmail,
  sendLoginEmail,
} from "../services/email.service.js";

const RegisterUserService = async (name, email, password) => {
  const isExists = await User.findOne({ email });

  if (isExists) {
    throw new APiError(422, "User with this email already exists");
  }

  const createdUser = await User.create({ name, email, password });

  if (!createdUser) {
    throw new APiError(500, "Failed to create user");
  }

    const user = createdUser.toJSON();

  await sendRegistrationEmail(email, name);

  

  return user;
};

const loginUserService = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new APiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APiError(401, "Invalid credentials");
  }

  const loggedInUser = await User.findById(user._id);

  (async () => {
    try {
      await sendLoginEmail(user.email, user.name);
    } catch (err) {
      console.error("Login email failed:", err?.message || err);
    }
  })();

  return { loggedInUser, userId: user._id };
};

export { RegisterUserService, loginUserService };

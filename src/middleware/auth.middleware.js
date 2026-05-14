import APiError from "../util/ApiError.js";
import asyncHandler from "../util/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifySession = asyncHandler(async (req, _res, next) => {
  if (!req.session || !req.session.userId) {
    throw new APiError(401, "Unauthorized");
  }

  const user = await User.findById(req.session.userId);

  if (!user) {
    throw new APiError(401, "User no longer exists");
  }

  req.user = user;
  return next();
});

export default verifySession;

import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from "../config/redis.config.js";
import sessionCookieOptions  from "../config/sessioncookie.config.js";


 const createSessionMiddleware = (useRedisStore = false) => {
  const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create a session until something is stored in it
    cookie: sessionCookieOptions,
  };

  if (useRedisStore && redisClient) {
    sessionOptions.store = new RedisStore({
      client: redisClient,
      prefix: "banking:session:",
    });
  }

  return session(sessionOptions);
};

export default createSessionMiddleware;
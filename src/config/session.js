import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

const sessionCookieOptions = {
  // Prevents client-side JS from reading the cookie (protects against XSS attacks)
  httpOnly: true,

  // Makes the cookie available across all pages/routes of your website
  path: "/",

  // If in production, cookie only sends over HTTPS; in development, HTTP is okay
  secure: process.env.NODE_ENV === "production",

  // 'none' allows uuu.com to send cookies to lll.com (Cross-Site).
  // 'lax' is the safer default for local development.
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // Calculation: 1000ms * 60s * 60m * 24h * 7d = 7 Days.
  maxAge: 1000 * 60 * 60 * 24 * 7,
};


const redisUrl = process.env.REDIS_URL?.trim();

const redisClient = redisUrl
  ? createClient({ url: redisUrl })
  : null;

if (redisClient) {
  redisClient.on("error", (error) => {
    console.error("Redis Client Error", {
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
      stack: error?.stack,
    });
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis successfully");
  });

  // Additional lifecycle logs to help diagnose connection resets
  redisClient.on("end", () => {
    console.warn("Redis connection closed (end)");
  });

  // Some redis client versions emit a 'reconnecting' event
  if (typeof redisClient.on === "function") {
    try {
      redisClient.on("reconnecting", () => {
        console.warn("Redis reconnecting...");
      });
    } catch (e) {
      // ignore if event not supported
    }
  }
}

const connectRedis = async () => {
  
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.error("Failed to connect to Redis. Falling back to in-memory session store.", error);
    return false;
  }
};

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

export { createSessionMiddleware, sessionCookieOptions, connectRedis };

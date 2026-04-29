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

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error", error);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully");
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
};

const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
    prefix: "banking:session:",
  }),

  secret: process.env.SESSION_SECRET,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create a session until something is stored in it
  cookie: sessionCookieOptions,
});

export { sessionMiddleware, sessionCookieOptions, connectRedis };

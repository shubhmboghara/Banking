import { createClient } from "redis";

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

  redisClient.on("end", () => {
    console.warn("Redis connection closed (end)");
  });

  if (typeof redisClient.on === "function") {
    try {
      redisClient.on("reconnecting", () => {
        console.warn("Redis reconnecting...");
      });
    } catch (e) {}
  }
}

const connectRedis = async () => {
  try {
    if (redisClient && !redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.error("Failed to connect to Redis. Falling back to in-memory session store.", error);
    return false;
  }
};

export { connectRedis, redisClient };

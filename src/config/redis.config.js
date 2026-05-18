import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  throw new Error('REDIS_URL is required. Cannot start banking server without Redis.')
}

const redisClient = createClient({ url: redisUrl })

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
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw new Error('Redis connection required for banking session storage.')
  }
};

export { connectRedis, redisClient };

import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL?.trim();

if (!redisUrl) {
  throw  new Error("REDIS_URL is required. Cannot start banking server without Redis.");
}

const redisClient = createClient({ url: redisUrl })


redisClient.on("connect", () => {
  console.log("Redis connected successfully.");
});

redisClient.on("disconnected", () => {
  console.warn("Redis disconnected ")
})

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting... ")
})

redisClient.on("end", () => {
  console.warn("Redis connection closed ")
})

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  process.exit(1);
}); 

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    process.exit(1);
  }
};

export { connectRedis, redisClient };

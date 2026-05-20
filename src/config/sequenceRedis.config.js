import { createClient } from "redis";

const sequenceRedisUrl = process.env.SEQUENCE_REDIS_URL?.trim();

if (!sequenceRedisUrl) {
  throw new Error("SEQUENCE_REDIS_URL is not defined in environment variables.");
}

export const sequenceRedisClient = createClient({
  url: sequenceRedisUrl,
});

sequenceRedisClient.on("connect", () => {
  console.log("Sequence Redis connected successfully.");
});

sequenceRedisClient.on("disconnected", () => {
  console.warn("Sequence Redis disconnected ")
})

sequenceRedisClient.on("reconnecting", () => {
  console.warn("Sequence Redis reconnecting... ")
})

sequenceRedisClient.on("end", () => {
  console.warn("Sequence Redis connection closed ")
})


sequenceRedisClient.on("error", (err) => {
  console.error("Sequence Redis error:", err.message);
  
});

export const connectSequenceRedis = async () => {
  try {
    if (!sequenceRedisClient.isOpen) {
      await sequenceRedisClient.connect();
    }
  } catch (error) {
    console.error("Error connecting to Sequence Redis:", error.message);
    return false;
  }
};

import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.mongoDb);
    console.log("\n MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection FAILED", error);
    process.exit(1);
  }
}

export default connectDB;

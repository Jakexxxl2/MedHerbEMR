import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(env.mongoUri);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}



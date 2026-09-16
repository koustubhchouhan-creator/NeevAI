// src/config/db.ts
import mongoose from "mongoose";

let memoryServer: { stop: () => Promise<boolean> } | null = null;

/**
 * Connect to MongoDB.
 *
 * When no `mongoUri` is provided, an ephemeral in-memory MongoDB instance is
 * started so the API is runnable out of the box in development. Provide
 * MONGODB_URI to connect to a real database instead.
 */
export async function connectDB(mongoUri?: string): Promise<void> {
  let uri = mongoUri;

  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create({
      instance: {
        // Generous default: first startup may need to unpack the mongod
        // binary, which can take longer than the library's 10s default.
        launchTimeout: Number(
          process.env.MONGOMS_STARTUP_TIMEOUT,
        ) || 60000,
      },
    });
    uri = server.getUri();
    memoryServer = server;
    console.log("Using in-memory MongoDB (data is not persisted)");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export default connectDB;

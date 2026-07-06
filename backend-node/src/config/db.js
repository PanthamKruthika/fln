import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in .env");

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[mongo] connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

mongoose.connection.on("disconnected", () => {
  console.warn("[mongo] disconnected");
});
mongoose.connection.on("error", (err) => {
  console.error("[mongo] error:", err.message);
});
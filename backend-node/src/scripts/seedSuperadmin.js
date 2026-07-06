import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

async function main() {
  await connectDB();

  const email = process.argv[2] || "superadmin@fln.org";
  const password = process.argv[3] || "Welcome1!";
  const name = process.argv[4] || "Root Superadmin";

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    console.log(`[seed] user already exists: ${email} (role=${exists.role})`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
    role: "superadmin",
  });

  console.log(`[seed] superadmin created:`);
  console.log(`       email:    ${user.email}`);
  console.log(`       role:     ${user.role}`);
  console.log(`       id:       ${user._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err.message);
  process.exit(1);
});
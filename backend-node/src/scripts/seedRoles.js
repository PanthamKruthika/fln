import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const DEFAULT_PASSWORD = "Welcome1!";

const accounts = [
  { role: "superadmin",      name: "Root Superadmin",     email: "superadmin@fln.org" },
  { role: "admin",           name: "Punjab Admin",        email: "admin.pb@fln.org" },
  { role: "district_admin",  name: "Ludhiana District",    email: "district.ldh@fln.org" },
  { role: "block_admin",     name: "Ludhiana-01 Block",    email: "block.ldh-01@fln.org" },
  { role: "school",          name: "GPS Model Town 001 Principal", email: "gps-mt-001@fln.org" },
  { role: "teacher",         name: "Priya Sharma",        email: "gps-mt-001.t01@fln.org" },
  { role: "volunteer",       name: "Rahul Verma",         email: "vol.rahul@fln.org" },
];

async function main() {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const a of accounts) {
    const exists = await User.findOne({ email: a.email.toLowerCase() });
    if (exists) {
      skipped += 1;
      console.log(`[seed] skip  ${a.role.padEnd(15)} ${a.email} (exists)`);
      continue;
    }
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await User.create({
      name: a.name,
      email: a.email.toLowerCase(),
      password: hash,
      role: a.role,
    });
    created += 1;
    console.log(`[seed] new   ${a.role.padEnd(15)} ${a.email}`);
  }

  console.log(`\n[seed] done. created=${created} skipped=${skipped} password='${DEFAULT_PASSWORD}'`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err.message);
  process.exit(1);
});
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { USER_ROLES } from "../models/enums.js";

const ROLES_ENUM = USER_ROLES;

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (role && ROLES_ENUM.includes(role) && user.role !== role) {
      return res.status(403).json({
        message: `This account is not a ${role}; resolved role is ${user.role}`,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }
    if (!ROLES_ENUM.includes(role)) {
      return res.status(400).json({ message: `invalid role; allowed: ${ROLES_ENUM.join(", ")}` });
    }
    if (!PASSWORD_RE.test(password)) {
      return res.status(400).json({
        message: "password must be 8+ chars, 1 uppercase, 1 number, 1 special character",
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash, role });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}
import mongoose from "mongoose";

const ROLES = [
  "superadmin",
  "admin",
  "district_admin",
  "block_admin",
  "school",
  "teacher",
  "volunteer",
];

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 8 },
    role:      { type: String, required: true, enum: ROLES, index: true },

    scope: {
      stateId:   { type: String, default: null },
      districtId:{ type: String, default: null },
      blockId:   { type: String, default: null },
      schoolId:  { type: String, default: null },
      classes:   { type: [String], default: [] },
    },

    isActive:        { type: Boolean, default: true },
    delayedAttempts: { type: Number, default: 0 },
    isDefaulter:     { type: Boolean, default: false },
    lastLoginAt:     { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const ROLES_ENUM = ROLES;
export default mongoose.model("User", userSchema);
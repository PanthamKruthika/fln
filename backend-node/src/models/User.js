import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MOBILE_PATTERN, STATUS, USER_ROLES } from "./enums.js";

/**
 * User — every authenticated user of the platform.
 *
 * Includes all 7 roles from SRS §4. Scope fields (stateId, districtId,
 * schoolId) are nullable because Superadmin has no geographic scope,
 * while Teacher / Volunteer have a specific schoolId.
 *
 * `assignedClasses` is a multi-valued reference for teachers / volunteers
 * — they may be assigned to multiple classes.
 *
 * Profile fields (firstName, lastName, phone, profilePhoto) are
 * embedded directly.  Authentication fields (password) are stripped
 * from toJSON() output so they never leak through an API response.
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, maxlength: 60, default: "" },
    lastName:  { type: String, trim: true, maxlength: 60, default: "" },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "email must be a valid address"],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: PASSWORD_MIN_LENGTH,
      validate: {
        validator: (v) => PASSWORD_RE.test(v),
        message:
          "password must be 8+ chars with 1 uppercase, 1 number, 1 special character",
      },
      select: false,                  // never returned in queries by default
    },

    role: {
      type: String,
      required: true,
      enum: { values: USER_ROLES, message: "role must be one of {VALUES}" },
      index: true,
    },

    // Scope — only the fields relevant to the role are populated.
    stateId:    { type: mongoose.Schema.Types.ObjectId, ref: "State",    default: null, index: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", default: null, index: true },
    schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: "School",   default: null, index: true },

    // For Teacher / Volunteer: which classes can they see?
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],

    phone: {
      type: String,
      trim: true,
      match: [MOBILE_PATTERN, "phone must be a valid 10-digit Indian mobile number"],
      default: "",
    },
    profilePhoto: { type: String, default: "" },  // S3 / Cloudinary URL

    isActive: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: { values: STATUS, message: "status must be one of {VALUES}" },
      default: "active",
      index: true,
    },

    // Defaulter engine (SRS §6.5 / R-12) — relevant only to teachers.
    delayedAttempts: { type: Number, default: 0, min: 0 },
    isDefaulter:     { type: Boolean, default: false, index: true },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Fast lookups: "list all active teachers in this school" etc.
userSchema.index({ schoolId: 1, role: 1, isActive: 1 });
userSchema.index({ districtId: 1, role: 1 });
userSchema.index({ stateId: 1, role: 1 });

// ---------- Hooks ----------

// Backward-compat: derive firstName / lastName from the legacy `name`
// field if those are empty (e.g. accounts created before the rename).
userSchema.pre("validate", function deriveName() {
  if ((!this.firstName && !this.lastName) && typeof this.name === "string" && this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.firstName = parts[0] || "";
    this.lastName  = parts.slice(1).join(" ") || "";
  }
  if (!this.firstName) this.firstName = "User";
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

// Full name virtual
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// JSON output — never leak password
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
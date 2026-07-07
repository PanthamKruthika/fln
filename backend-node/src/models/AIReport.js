import mongoose from "mongoose";

/**
 * AIReport — narrative + recommendations produced by the evaluation engine.
 *
 * One AIReport per Evaluation (1:1).  strengths / weaknesses /
 * recommendation are arrays of short strings ready to drop into UI.
 */
const aiReportSchema = new mongoose.Schema(
  {
    evaluationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evaluation",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    strengths:      [{ type: String, trim: true }],
    weaknesses:     [{ type: String, trim: true }],
    recommendation: { type: String, trim: true, default: "" },
    teacherSummary: { type: String, default: "" },

    generatedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

aiReportSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export default mongoose.model("AIReport", aiReportSchema);
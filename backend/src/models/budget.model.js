const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customCategoryName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 60,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
      index: true,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    alerts: {
      warning: { type: Number, default: 80 },
      critical: { type: Number, default: 100 },
    },
  },
  { timestamps: true },
);

budgetSchema.index({ workspaceId: 1, category: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);

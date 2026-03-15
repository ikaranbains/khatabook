const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    type: {
      type: String,
      enum: ["personal", "family"],
      default: "personal",
    },
    defaultCurrency: {
      type: String,
      default: "INR",
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    salaryAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Workspace", workspaceSchema);

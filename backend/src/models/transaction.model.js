const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: ["manual", "import", "recurring", "bank"],
      default: "manual",
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

transactionSchema.index({ workspaceId: 1, date: -1 });
transactionSchema.index({ workspaceId: 1, type: 1, date: -1 });
transactionSchema.index({ workspaceId: 1, category: 1, date: -1 });

transactionSchema.pre("validate", function setFallbackName(next) {
  if ((!this.name || !String(this.name).trim()) && this.description) {
    this.name = String(this.description).trim();
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);

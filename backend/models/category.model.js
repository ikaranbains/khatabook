const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      index: true,
    },
    color: {
      type: String,
      default: "#5c3ea5",
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

categorySchema.index({ workspaceId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);

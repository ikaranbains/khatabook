const mongoose = require("mongoose");
const Workspace = require("../models/workspace.model");
const ApiError = require("../utils/ApiError");

let cachedWorkspaceId = null;

async function resolveDefaultWorkspace() {
  if (cachedWorkspaceId) return cachedWorkspaceId;

  const existing = await Workspace.findOne().sort({ createdAt: 1 }).lean();
  if (existing) {
    cachedWorkspaceId = String(existing._id);
    return cachedWorkspaceId;
  }

  const workspace = await Workspace.create({
    name: process.env.DEFAULT_WORKSPACE_NAME || "Personal Workspace",
    type: "personal",
    defaultCurrency: process.env.DEFAULT_WORKSPACE_CURRENCY || "INR",
  });

  cachedWorkspaceId = String(workspace._id);
  return cachedWorkspaceId;
}

async function attachWorkspace(req, res, next) {
  const workspaceHeader = req.header("x-workspace-id");

  if (workspaceHeader) {
    if (!mongoose.Types.ObjectId.isValid(workspaceHeader)) {
      return next(new ApiError(400, "Invalid x-workspace-id header"));
    }

    const workspace = await Workspace.findById(workspaceHeader).select("_id").lean();
    if (!workspace) {
      return next(new ApiError(404, "Workspace not found"));
    }

    req.workspaceId = String(workspace._id);
    return next();
  }

  req.workspaceId = await resolveDefaultWorkspace();
  return next();
}

module.exports = { attachWorkspace, resolveDefaultWorkspace };

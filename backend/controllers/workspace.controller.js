const Workspace = require("../models/workspace.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { resolveDefaultWorkspace } = require("../middlewares/workspace.middleware");

const listWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find().sort({ createdAt: -1 });
  return sendSuccess(res, workspaces, "Workspaces fetched");
});

const getCurrentWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = await resolveDefaultWorkspace();
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  return sendSuccess(res, workspace, "Workspace fetched");
});

const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.create(req.validated.body);
  return sendSuccess(res, workspace, "Workspace created", 201);
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.validated.params.id);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }
  return sendSuccess(res, workspace, "Workspace fetched");
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  return sendSuccess(res, workspace, "Workspace updated");
});

const updateCurrentWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = await resolveDefaultWorkspace();
  const workspace = await Workspace.findByIdAndUpdate(workspaceId, req.validated.body, {
    new: true,
    runValidators: true,
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  return sendSuccess(res, workspace, "Workspace updated");
});

module.exports = {
  listWorkspaces,
  createWorkspace,
  getCurrentWorkspace,
  getWorkspaceById,
  updateWorkspace,
  updateCurrentWorkspace,
};

const Goal = require("../models/goal.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const listGoals = asyncHandler(async (req, res) => {
  const { priority } = req.validated.query;

  const filter = { workspaceId: req.workspaceId };
  if (priority) filter.priority = priority;

  const goals = await Goal.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, goals, "Goals fetched");
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...req.validated.body, workspaceId: req.workspaceId });
  return sendSuccess(res, goal, "Goal created", 201);
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.validated.params.id, workspaceId: req.workspaceId },
    req.validated.body,
    { new: true, runValidators: true },
  );

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  return sendSuccess(res, goal, "Goal updated");
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  return sendSuccess(res, { id: goal._id }, "Goal deleted");
});

module.exports = {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};

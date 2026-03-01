const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

function sanitizeBudgetCategory(payload, fallbackCategory = null) {
  const incomingCategory = payload.category ?? fallbackCategory ?? "";
  const customCategoryName = (payload.customCategoryName || "").trim();

  if (incomingCategory === "Other") {
    if (!customCategoryName) {
      throw new ApiError(400, "customCategoryName is required when category is Other");
    }

    return {
      ...payload,
      category: customCategoryName,
      customCategoryName,
    };
  }

  return {
    ...payload,
    customCategoryName: "",
  };
}

const listBudgets = asyncHandler(async (req, res) => {
  const { period, category } = req.validated.query;

  const filter = { workspaceId: req.workspaceId };
  if (period) filter.period = period;
  if (category) filter.category = category;

  const budgets = await Budget.find(filter).sort({ createdAt: -1 });

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await Transaction.aggregate([
        {
          $match: {
            workspaceId: budget.workspaceId,
            category: budget.category,
            type: "expense",
          },
        },
        { $group: { _id: null, spent: { $sum: "$amount" } } },
      ]);

      const spent = spentAgg[0]?.spent || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
      };
    }),
  );

  return sendSuccess(res, budgetsWithSpent, "Budgets fetched");
});

const createBudget = asyncHandler(async (req, res) => {
  const payload = sanitizeBudgetCategory({
    ...req.validated.body,
    workspaceId: req.workspaceId,
  });

  const budget = await Budget.create(payload);
  return sendSuccess(res, budget, "Budget created", 201);
});

const updateBudget = asyncHandler(async (req, res) => {
  const existing = await Budget.findOne({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!existing) {
    throw new ApiError(404, "Budget not found");
  }

  const updatePayload = sanitizeBudgetCategory(req.validated.body, existing.category);

  const budget = await Budget.findOneAndUpdate(
    { _id: req.validated.params.id, workspaceId: req.workspaceId },
    updatePayload,
    { new: true, runValidators: true },
  );

  return sendSuccess(res, budget, "Budget updated");
});

const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  return sendSuccess(res, { id: budget._id }, "Budget deleted");
});

module.exports = {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};

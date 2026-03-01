const Transaction = require("../models/transaction.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { getPagination } = require("../utils/pagination");

const sortMap = {
  date: { date: 1 },
  "-date": { date: -1 },
  amount: { amount: 1 },
  "-amount": { amount: -1 },
  description: { description: 1 },
  "-description": { description: -1 },
  name: { name: 1 },
  "-name": { name: -1 },
};

function withNameFallback(transaction) {
  const object = typeof transaction.toObject === "function" ? transaction.toObject() : transaction;
  const normalizedName =
    (object.name && String(object.name).trim()) ||
    (object.description && String(object.description).trim()) ||
    "Untitled transaction";

  return {
    ...object,
    name: normalizedName,
  };
}

const listTransactions = asyncHandler(async (req, res) => {
  const { type, category, from, to, q, sort = "-date" } = req.validated.query;
  const { page, limit, skip } = getPagination(req.validated.query);

  const filter = { workspaceId: req.workspaceId };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sortMap[sort] || { date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  const normalizedItems = items.map(withNameFallback);
  return sendSuccess(res, normalizedItems, "Transactions fetched", 200, meta);
});

const createTransaction = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    description: req.validated.body.description || "",
    workspaceId: req.workspaceId,
  };

  const transaction = await Transaction.create(payload);
  return sendSuccess(res, withNameFallback(transaction), "Transaction created", 201);
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return sendSuccess(res, withNameFallback(transaction), "Transaction fetched");
});

const updateTransaction = asyncHandler(async (req, res) => {
  const existing = await Transaction.findOne({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!existing) {
    throw new ApiError(404, "Transaction not found");
  }

  let updatePayload = {
    ...req.validated.body,
  };
  if ("description" in updatePayload) {
    updatePayload.description = updatePayload.description || "";
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.validated.params.id, workspaceId: req.workspaceId },
    updatePayload,
    { new: true, runValidators: true },
  );

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return sendSuccess(res, withNameFallback(transaction), "Transaction updated");
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return sendSuccess(res, { id: transaction._id }, "Transaction deleted");
});

module.exports = {
  listTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};

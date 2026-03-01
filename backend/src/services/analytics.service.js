const Transaction = require("../models/transaction.model");

function buildDateFilter(from, to) {
  if (!from && !to) return {};
  const date = {};
  if (from) date.$gte = from;
  if (to) date.$lte = to;
  return { date };
}

async function getSummary({ workspaceId, from, to }) {
  const filter = {
    workspaceId,
    ...buildDateFilter(from, to),
  };

  const [incomeAgg, expenseAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { ...filter, type: "income" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
  ]);

  const income = incomeAgg[0]?.amount || 0;
  const expenses = expenseAgg[0]?.amount || 0;
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income,
    expenses,
    savings,
    savingsRate: Number(savingsRate.toFixed(2)),
  };
}

function getDateFormatByInterval(interval) {
  if (interval === "day") return "%Y-%m-%d";
  if (interval === "week") return "%G-W%V";
  return "%Y-%m";
}

async function getTrends({ workspaceId, from, to, interval = "month", type }) {
  const match = {
    workspaceId,
    ...buildDateFilter(from, to),
    ...(type ? { type } : {}),
  };

  const data = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          bucket: {
            $dateToString: {
              format: getDateFormatByInterval(interval),
              date: "$date",
            },
          },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.bucket": 1 } },
  ]);

  return data.map((entry) => ({
    bucket: entry._id.bucket,
    type: entry._id.type,
    total: entry.total,
  }));
}

async function getCategoryBreakdown({ workspaceId, from, to, type = "expense" }) {
  const data = await Transaction.aggregate([
    {
      $match: {
        workspaceId,
        type,
        ...buildDateFilter(from, to),
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return data.map((entry) => ({
    category: entry._id || "Uncategorized",
    total: entry.total,
  }));
}

module.exports = {
  getSummary,
  getTrends,
  getCategoryBreakdown,
};

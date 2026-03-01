const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const analyticsService = require("../services/analytics.service");

const getSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.validated.query;
  const summary = await analyticsService.getSummary({ workspaceId: req.workspaceId, from, to });
  return sendSuccess(res, summary, "Summary analytics fetched");
});

const getTrends = asyncHandler(async (req, res) => {
  const { from, to, interval, type } = req.validated.query;
  const trends = await analyticsService.getTrends({
    workspaceId: req.workspaceId,
    from,
    to,
    interval,
    type,
  });
  return sendSuccess(res, trends, "Trend analytics fetched");
});

const getCategories = asyncHandler(async (req, res) => {
  const { from, to, type } = req.validated.query;
  const categories = await analyticsService.getCategoryBreakdown({
    workspaceId: req.workspaceId,
    from,
    to,
    type,
  });
  return sendSuccess(res, categories, "Category analytics fetched");
});

module.exports = {
  getSummary,
  getTrends,
  getCategories,
};

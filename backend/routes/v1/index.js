const express = require("express");

const workspaceRoutes = require("./workspace.routes");
const categoryRoutes = require("./category.routes");
const transactionRoutes = require("./transaction.routes");
const budgetRoutes = require("./budget.routes");
const goalRoutes = require("./goal.routes");
const analyticsRoutes = require("./analytics.routes");

const router = express.Router();

router.use("/workspaces", workspaceRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/budgets", budgetRoutes);
router.use("/goals", goalRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;

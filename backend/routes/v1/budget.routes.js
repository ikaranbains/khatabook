const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const { attachWorkspace } = require("../../middlewares/workspace.middleware");
const budgetController = require("../../controllers/budget.controller");
const {
  createBudgetSchema,
  updateBudgetSchema,
  listBudgetSchema,
  budgetIdParamSchema,
} = require("../../validators/budget.validator");

const router = express.Router();

router.use(attachWorkspace);

router.get("/", validate(listBudgetSchema), budgetController.listBudgets);
router.post("/", validate(createBudgetSchema), budgetController.createBudget);
router.patch("/:id", validate(updateBudgetSchema), budgetController.updateBudget);
router.delete("/:id", validate(budgetIdParamSchema), budgetController.deleteBudget);

module.exports = router;

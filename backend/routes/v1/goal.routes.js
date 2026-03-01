const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const { attachWorkspace } = require("../../middlewares/workspace.middleware");
const goalController = require("../../controllers/goal.controller");
const {
  createGoalSchema,
  updateGoalSchema,
  listGoalSchema,
  goalIdParamSchema,
} = require("../../validators/goal.validator");

const router = express.Router();

router.use(attachWorkspace);

router.get("/", validate(listGoalSchema), goalController.listGoals);
router.post("/", validate(createGoalSchema), goalController.createGoal);
router.patch("/:id", validate(updateGoalSchema), goalController.updateGoal);
router.delete("/:id", validate(goalIdParamSchema), goalController.deleteGoal);

module.exports = router;

const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const { attachWorkspace } = require("../../middlewares/workspace.middleware");
const analyticsController = require("../../controllers/analytics.controller");
const {
  summaryQuerySchema,
  trendsQuerySchema,
  categoriesQuerySchema,
} = require("../../validators/analytics.validator");

const router = express.Router();

router.use(attachWorkspace);

router.get("/summary", validate(summaryQuerySchema), analyticsController.getSummary);
router.get("/trends", validate(trendsQuerySchema), analyticsController.getTrends);
router.get("/categories", validate(categoriesQuerySchema), analyticsController.getCategories);

module.exports = router;

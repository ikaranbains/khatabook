const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const { attachWorkspace } = require("../../middlewares/workspace.middleware");
const categoryController = require("../../controllers/category.controller");
const {
  createCategorySchema,
  updateCategorySchema,
  listCategorySchema,
  categoryIdParamSchema,
} = require("../../validators/category.validator");

const router = express.Router();

router.use(attachWorkspace);

router.get("/", validate(listCategorySchema), categoryController.listCategories);
router.post("/", validate(createCategorySchema), categoryController.createCategory);
router.patch("/:id", validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", validate(categoryIdParamSchema), categoryController.deleteCategory);

module.exports = router;

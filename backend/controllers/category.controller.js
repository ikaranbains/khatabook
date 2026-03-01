const Category = require("../models/category.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");

const listCategories = asyncHandler(async (req, res) => {
  const { type, search } = req.validated.query;

  const filter = { workspaceId: req.workspaceId };
  if (type) filter.type = type;
  if (search) filter.name = { $regex: search, $options: "i" };

  const categories = await Category.find(filter).sort({ name: 1 });
  return sendSuccess(res, categories, "Categories fetched");
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    workspaceId: req.workspaceId,
  };

  const category = await Category.create(payload);
  return sendSuccess(res, category, "Category created", 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.validated.params.id, workspaceId: req.workspaceId },
    req.validated.body,
    { new: true, runValidators: true },
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return sendSuccess(res, category, "Category updated");
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({
    _id: req.validated.params.id,
    workspaceId: req.workspaceId,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return sendSuccess(res, { id: category._id }, "Category deleted");
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

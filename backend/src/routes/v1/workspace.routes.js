const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const workspaceController = require("../../controllers/workspace.controller");
const {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} = require("../../validators/workspace.validator");

const router = express.Router();

router.get("/", workspaceController.listWorkspaces);
router.post("/", validate(createWorkspaceSchema), workspaceController.createWorkspace);
router.get("/:id", validate(workspaceIdParamSchema), workspaceController.getWorkspaceById);
router.patch("/:id", validate(updateWorkspaceSchema), workspaceController.updateWorkspace);

module.exports = router;

const { z, objectIdSchema } = require("./common.validator");

const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    type: z.enum(["personal", "family"]).optional(),
    defaultCurrency: z.string().trim().length(3).optional(),
    salaryAmount: z.number().min(0).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateWorkspaceSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      type: z.enum(["personal", "family"]).optional(),
      defaultCurrency: z.string().trim().length(3).optional(),
      salaryAmount: z.number().min(0).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required"),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).optional(),
});

const workspaceIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateCurrentWorkspaceSchema = z.object({
  body: updateWorkspaceSchema.shape.body,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateCurrentWorkspaceSchema,
  workspaceIdParamSchema,
};

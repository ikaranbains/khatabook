const { z, objectIdSchema } = require("./common.validator");

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    type: z.enum(["income", "expense"]),
    color: z.string().trim().optional(),
    isSystem: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(60).optional(),
      type: z.enum(["income", "expense"]).optional(),
      color: z.string().trim().optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required"),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).optional(),
});

const listCategorySchema = z.object({
  query: z.object({
    type: z.enum(["income", "expense"]).optional(),
    search: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const categoryIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  listCategorySchema,
  categoryIdParamSchema,
};

const { z, objectIdSchema } = require("./common.validator");

const createGoalSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    targetAmount: z.coerce.number().nonnegative(),
    currentAmount: z.coerce.number().nonnegative().optional(),
    deadline: z.coerce.date().nullable().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateGoalSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      targetAmount: z.coerce.number().nonnegative().optional(),
      currentAmount: z.coerce.number().nonnegative().optional(),
      deadline: z.coerce.date().nullable().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required"),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).optional(),
});

const listGoalSchema = z.object({
  query: z.object({
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const goalIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  listGoalSchema,
  goalIdParamSchema,
};

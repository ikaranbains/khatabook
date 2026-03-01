const { z, objectIdSchema } = require("./common.validator");

const categorySchema = z.string().trim().min(1).max(60);
const customCategoryNameSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" ? value.trim() : ""));

function validateCustomCategory(payload) {
  if (payload.category !== "Other") return true;
  return payload.customCategoryName.length > 0;
}

const createBudgetSchema = z.object({
  body: z
    .object({
      category: categorySchema,
      customCategoryName: customCategoryNameSchema.optional(),
      amount: z.coerce.number().nonnegative(),
      period: z.enum(["weekly", "monthly", "yearly"]).optional(),
      currency: z.string().trim().length(3).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().nullable().optional(),
      alerts: z
        .object({
          warning: z.coerce.number().min(0).max(100).optional(),
          critical: z.coerce.number().min(0).max(200).optional(),
        })
        .optional(),
    })
    .refine(validateCustomCategory, {
      message: "customCategoryName is required when category is Other",
      path: ["customCategoryName"],
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateBudgetSchema = z.object({
  body: z
    .object({
      category: categorySchema.optional(),
      customCategoryName: customCategoryNameSchema.optional(),
      amount: z.coerce.number().nonnegative().optional(),
      period: z.enum(["weekly", "monthly", "yearly"]).optional(),
      currency: z.string().trim().length(3).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().nullable().optional(),
      alerts: z
        .object({
          warning: z.coerce.number().min(0).max(100).optional(),
          critical: z.coerce.number().min(0).max(200).optional(),
        })
        .optional(),
    })
    .refine(
      (payload) => {
        if (!("category" in payload) && !("customCategoryName" in payload)) return true;
        const category = payload.category;
        const customCategoryName = payload.customCategoryName || "";
        if (category !== "Other") return true;
        return customCategoryName.length > 0;
      },
      {
        message: "customCategoryName is required when category is Other",
        path: ["customCategoryName"],
      },
    )
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required"),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).optional(),
});

const listBudgetSchema = z.object({
  query: z.object({
    period: z.enum(["weekly", "monthly", "yearly"]).optional(),
    category: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const budgetIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  listBudgetSchema,
  budgetIdParamSchema,
};

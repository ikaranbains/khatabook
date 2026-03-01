const { z, objectIdSchema } = require("./common.validator");

const optionalDescriptionSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (typeof value === "string" ? value.trim() : ""))
  .refine((value) => value.length <= 200, "Description must be at most 200 characters");

const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().length(3).optional(),
    name: z.string().trim().min(1).max(120),
    description: optionalDescriptionSchema.optional(),
    date: z.coerce.date().optional(),
    category: z.string().trim().min(1).max(60).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
    gstAmount: z.coerce.number().min(0).optional(),
    totalAmount: z.coerce.number().min(0).optional(),
    source: z.enum(["manual", "import", "recurring", "bank"]).optional(),
    meta: z.record(z.string(), z.any()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateTransactionSchema = z.object({
  body: z
    .object({
      type: z.enum(["income", "expense", "transfer"]).optional(),
      amount: z.coerce.number().positive().optional(),
      currency: z.string().trim().length(3).optional(),
      name: z.string().trim().min(1).max(120).optional(),
      description: optionalDescriptionSchema.optional(),
      date: z.coerce.date().optional(),
      category: z.string().trim().min(1).max(60).optional(),
      tags: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
      gstAmount: z.coerce.number().min(0).optional(),
      totalAmount: z.coerce.number().min(0).optional(),
      source: z.enum(["manual", "import", "recurring", "bank"]).optional(),
      meta: z.record(z.string(), z.any()).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required"),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).optional(),
});

const listTransactionSchema = z.object({
  query: z.object({
    type: z.enum(["income", "expense", "transfer"]).optional(),
    category: z.string().trim().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    q: z.string().trim().optional(),
    sort: z.enum(["date", "amount", "description", "-date", "-amount", "-description", "name", "-name"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const transactionIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionSchema,
  transactionIdParamSchema,
};

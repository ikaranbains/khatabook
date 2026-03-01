const { z } = require("./common.validator");

const summaryQuerySchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const trendsQuerySchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    interval: z.enum(["day", "week", "month"]).optional(),
    type: z.enum(["income", "expense"]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

const categoriesQuerySchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    type: z.enum(["income", "expense"]).optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

module.exports = {
  summaryQuerySchema,
  trendsQuerySchema,
  categoriesQuerySchema,
};

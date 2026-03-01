require("dotenv").config();

const { getEnv } = require("../config/env");
const { connectDb, disconnectDb } = require("../config/db");
const Workspace = require("../models/workspace.model");
const Category = require("../models/category.model");

const defaultCategories = [
  { type: "expense", name: "Groceries" },
  { type: "expense", name: "Rent" },
  { type: "expense", name: "Utilities" },
  { type: "expense", name: "Transportation" },
  { type: "expense", name: "Healthcare" },
  { type: "expense", name: "Education" },
  { type: "expense", name: "Entertainment" },
  { type: "expense", name: "Dining Out" },
  { type: "expense", name: "Shopping" },
  { type: "expense", name: "Insurance" },
  { type: "expense", name: "Loan EMI" },
  { type: "expense", name: "Taxes" },
  { type: "income", name: "Salary" },
  { type: "income", name: "Business Income" },
  { type: "income", name: "Freelance" },
  { type: "income", name: "Investments" },
  { type: "income", name: "Bonus" },
  { type: "income", name: "Other" },
];

async function runSeed() {
  const env = getEnv();
  await connectDb(env.mongoUri);

  let workspace = await Workspace.findOne().sort({ createdAt: 1 });
  if (!workspace) {
    workspace = await Workspace.create({
      name: env.defaultWorkspaceName,
      type: "personal",
      defaultCurrency: env.defaultWorkspaceCurrency,
    });
  }

  const operations = defaultCategories.map((item) => ({
    updateOne: {
      filter: {
        workspaceId: workspace._id,
        type: item.type,
        name: item.name,
      },
      update: {
        $setOnInsert: {
          workspaceId: workspace._id,
          type: item.type,
          name: item.name,
          isSystem: true,
        },
      },
      upsert: true,
    },
  }));

  await Category.bulkWrite(operations);

  console.log("Seed completed successfully");
  await disconnectDb();
}

runSeed().catch(async (error) => {
  console.error("Seed failed", error);
  await disconnectDb();
  process.exit(1);
});

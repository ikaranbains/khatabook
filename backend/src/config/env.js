const REQUIRED_VARS = ["MONGODB_URI"];

function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function getEnv() {
  validateEnv();

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    mongoUri: process.env.MONGODB_URI,
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
    defaultWorkspaceName: process.env.DEFAULT_WORKSPACE_NAME || "Personal Workspace",
    defaultWorkspaceCurrency: process.env.DEFAULT_WORKSPACE_CURRENCY || "INR",
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
  };
}

module.exports = { getEnv };

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { getEnv } = require("./config/env");
const apiV1Router = require("./routes/v1");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const env = getEnv();

const app = express();
const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (env.corsOrigins.length === 0) return true;
  if (env.corsOrigins.includes(origin)) return true;
  if (env.nodeEnv !== "production" && localOriginPattern.test(origin)) return true;
  return false;
}

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1", apiV1Router);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

const ApiError = require("../utils/ApiError");

function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.message?.startsWith("Not allowed by CORS")) {
    return res.status(403).json({
      success: false,
      error: {
        code: "CORS_FORBIDDEN",
        message: err.message,
      },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: "API_ERROR",
        message: err.message,
        details: err.details,
      },
    });
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.message,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    },
  });
}

module.exports = { notFoundHandler, errorHandler };

function sendSuccess(res, data, message = "Success", statusCode = 200, meta = undefined) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

module.exports = { sendSuccess };

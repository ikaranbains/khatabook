const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  } catch (error) {
    throw new Error(
      `MongoDB connection failed for ${mongoUri}. Ensure MongoDB is running and reachable. ${error.message}`,
    );
  }
}

async function disconnectDb() {
  await mongoose.disconnect();
}

module.exports = { connectDb, disconnectDb };

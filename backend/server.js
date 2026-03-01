require("dotenv").config();

const app = require("./app");
const { getEnv } = require("./config/env");
const { connectDb, disconnectDb } = require("./config/db");

async function bootstrap() {
  const env = getEnv();
  await connectDb(env.mongoUri);

  const PORT = process.env.PORT || env.port || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap backend", error);
  process.exit(1);
});

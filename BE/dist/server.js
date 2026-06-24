import { createServer } from "node:http";
import Redis from "ioredis";
import { app } from "@/app";
import { ENV } from "@/config/env.config";
import { logger } from "@/config/pino.logger";
import { prisma } from "@/config/prisma.client";
import "@/utils/bigint.serializer"; // Load the serializer
const server = createServer(app);
const redis = new Redis(ENV.REDIS_URL);
server.listen(ENV.PORT, () => {
    logger.info(`🚀 Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
});
// Absolute Graceful Shutdown implementation
const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    // Reject new traffic
    server.close(async (err) => {
        if (err) {
            logger.error(err, "Error during server close");
            process.exit(1);
        }
        logger.info("HTTP server closed. Waiting for active sockets to finish...");
        try {
            // Close Prisma and Redis safely
            await Promise.all([
                prisma.$disconnect(),
                redis.quit()
            ]);
            logger.info("Prisma and Redis connections closed successfully.");
            process.exit(0);
        }
        catch (shutdownError) {
            logger.error(shutdownError, "Error during resource cleanup");
            process.exit(1);
        }
    });
    // Force shutdown if sockets hang longer than 10 seconds
    setTimeout(() => {
        logger.error("Active connections taking too long to close. Forcefully shutting down.");
        process.exit(1);
    }, 10000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

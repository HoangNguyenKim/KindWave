import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import Redis from "ioredis";
import { ENV } from "@/config/env.config";
import { prisma } from "@/config/prisma.client";
import { errorHandler } from "@/middlewares/error.middleware";
import { requestContextMiddleware } from "@/middlewares/request-context";

const app = express();
const redis = new Redis(ENV.REDIS_URL);

// Security Shield
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(requestContextMiddleware);

// Raw Body parsing hook for webhooks (Stripe/Payment gateways)
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Rate limiters
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many login attempts, please try again after 60s" },
});

export const donationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many donation requests, please try again after 60s" },
});

// Example endpoint limits (to be moved into the actual router)
app.use("/api/auth/login", loginLimiter);
app.use("/api/donations", donationLimiter);

// Health Check
app.get("/health", async (req: Request, res: Response) => {
  try {
    const [dbPing, redisPing] = await Promise.all([
      prisma.$queryRaw`SELECT 1`.then(() => "ok").catch(() => "failed"),
      redis.ping().then(() => "ok").catch(() => "failed"),
    ]);

    const memoryUsage = process.memoryUsage();

    res.status(dbPing === "ok" && redisPing === "ok" ? 200 : 503).json({
      status: "success",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbPing,
        redis: redisPing,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

// Global Error Handler mounted at the absolute end
app.use(errorHandler);

export { app };

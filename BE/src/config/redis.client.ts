import Redis from "ioredis";
import { ENV } from "@/config/env.config";

const globalForRedis = global as unknown as { redis?: Redis };

export const redis = globalForRedis.redis ?? new Redis(ENV.REDIS_URL);

if (ENV.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

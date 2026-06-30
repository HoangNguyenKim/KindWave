import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import { ENV } from "@/config/env.config";
import { logger } from "@/config/pino.logger";

const redis = new Redis(ENV.REDIS_URL);

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;

  if (!idempotencyKey) {
    next();
    return;
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      logger.info(`Idempotency cache hit for key: ${idempotencyKey}`);
      res.json(JSON.parse(cachedResponse));
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = (function (body: unknown): Response {
      res.json = originalJson;

      redis.set(cacheKey, JSON.stringify(body), "EX", 60).catch((err: unknown) => {
        logger.error(err as Error, `Failed to cache idempotency key ${idempotencyKey}`);
      });

      return originalJson(body);
    }) as typeof res.json;

    next();
  } catch (error) {
    logger.error(error as Error, "Idempotency middleware error");
    next(error);
  }
};

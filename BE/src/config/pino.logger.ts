import pino from "pino";
import { ENV } from "@/config/env.config";

export const logger = pino({
  level: ENV.NODE_ENV === "production" ? "info" : "debug",
  ...(ENV.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  }),
});

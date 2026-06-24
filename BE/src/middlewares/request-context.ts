import { AsyncLocalStorage } from "node:async_hooks";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export interface RequestContext {
  requestId: string;
  userId?: string;
}

export const als = new AsyncLocalStorage<RequestContext>();

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  const userId = req.headers["x-user-id"] as string | undefined;

  const context: RequestContext = {
    requestId,
    userId,
  };

  als.run(context, () => {
    next();
  });
};

export const getRequestContext = (): RequestContext | undefined => {
  return als.getStore();
};

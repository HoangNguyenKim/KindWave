import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
export const als = new AsyncLocalStorage();
export const requestContextMiddleware = (req, res, next) => {
    const requestId = req.headers["x-request-id"] || randomUUID();
    const userId = req.headers["x-user-id"];
    const context = {
        requestId,
        userId,
    };
    als.run(context, () => {
        next();
    });
};
export const getRequestContext = () => {
    return als.getStore();
};

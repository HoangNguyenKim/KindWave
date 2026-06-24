import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "@/errors/app.error";
import { logger } from "@/config/pino.logger";
export const errorHandler = (err, req, res, next) => {
    logger.error(err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error_code: err.name,
        });
        return;
    }
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            error_code: "VALIDATION_ERROR",
            errors: err.errors,
        });
        return;
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
            success: false,
            message: "Database operation failed",
            error_code: err.code,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error_code: "INTERNAL_SERVER_ERROR",
    });
};

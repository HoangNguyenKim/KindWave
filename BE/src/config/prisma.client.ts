import { PrismaClient } from "@prisma/client";
import { AppError } from "@/errors/app.error";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const basePrisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async delete({ model }) {
        throw new AppError(
          `Hard deletes are strictly forbidden on model ${model}. Please convert this query to .update({ data: { deleted_at: new Date() } })`,
          403
        );
      },
      async deleteMany({ model }) {
        throw new AppError(
          `Batch hard deletes are strictly forbidden on model ${model}. Please convert this query to .updateMany({ data: { deleted_at: new Date() } })`,
          403
        );
      },
    },
  },
});

export type TransactionHost = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

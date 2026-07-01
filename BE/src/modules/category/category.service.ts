import { prisma } from "@/config/prisma.client";
import { redis } from "@/config/redis.client";
import { logger } from "@/config/pino.logger";

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const CACHE_KEY = "categories:list";
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

const fetchFromDb = async (): Promise<CategoryDto[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true },
  });
  return categories.map((c) => ({
    id: c.id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));
};

export const listCategories = async (): Promise<CategoryDto[]> => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as CategoryDto[];
    }
  } catch (error) {
    logger.warn(error, "Redis read failed for categories; falling back to DB");
  }

  const categories = await fetchFromDb();

  try {
    await redis.set(CACHE_KEY, JSON.stringify(categories), "EX", CACHE_TTL_SECONDS);
  } catch (error) {
    logger.warn(error, "Redis write failed for categories cache");
  }

  return categories;
};

export const invalidateCategoriesCache = async (): Promise<void> => {
  try {
    await redis.del(CACHE_KEY);
  } catch (error) {
    logger.warn(error, "Redis delete failed for categories cache");
  }
};

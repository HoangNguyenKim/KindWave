import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    );
  }

  return parsed.data;
};

export const ENV = parseEnv();

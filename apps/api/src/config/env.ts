import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32).default('dev-only-change-this-secret-before-production'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  DATA_DIR: z.string().default('.data')
});

export const env = envSchema.parse(process.env);

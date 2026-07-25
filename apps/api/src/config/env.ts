import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  OPENAI_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);

import { Router } from 'express';
import { z } from 'zod';
import { analyzeRisk } from '../services/riskAnalyzer.js';

const scanRequestSchema = z.object({
  type: z.enum(['email', 'sms', 'url', 'qr', 'screenshot']),
  content: z.string().optional(),
  url: z.string().optional()
}).refine((data) => data.content || data.url, {
  message: 'Provide content or a URL to scan.'
});

export const scanRouter = Router();

scanRouter.post('/', (request, response) => {
  const parsed = scanRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  response.json(analyzeRisk(parsed.data));
});

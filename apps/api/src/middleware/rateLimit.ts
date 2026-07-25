import type { NextFunction, Request, Response } from 'express';
const hits = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(limit = 120, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'anonymous';
    const now = Date.now();
    const current = hits.get(key);
    if (!current || current.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, limit - current.count));
    res.setHeader('RateLimit-Reset', Math.ceil((current.resetAt - now) / 1000));
    if (current.count > limit) return res.status(429).json({ error: 'Too many requests' });
    return next();
  };
}

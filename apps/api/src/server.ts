import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { scanRouter } from './routes/scan.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', healthRouter);
app.use('/api/scan', scanRouter);

app.listen(env.PORT, () => {
  console.log(`ScanShield AI API running on port ${env.PORT}`);
});

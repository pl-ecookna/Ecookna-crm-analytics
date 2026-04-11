import express from 'express';
import cron from 'node-cron';
import { env } from './config/env.js';
import { log } from './utils/logger.js';
import { webhookRouter } from './routes/webhook.js';
import { apiRouter } from './routes/api.js';
import { runMainWorker } from './workers/mainWorker.js';
import { runDisapproveWorker } from './workers/disapproveWorker.js';

const app = express();
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/webhook', webhookRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api', apiRouter);

if (env.cronEnabled) {
  cron.schedule(env.cronMain, () => {
    void runMainWorker();
  });

  cron.schedule(env.cronDisapprove, () => {
    void runDisapproveWorker();
  });
} else {
  log.info('Cron jobs are disabled', { cronEnabled: env.cronEnabled });
}

app.listen(env.port, () => {
  log.info('Service started', {
    port: env.port,
    webhookPath: `${env.webhookPath}`,
    cronEnabled: env.cronEnabled,
    cronMain: env.cronMain,
    cronDisapprove: env.cronDisapprove,
  });
});

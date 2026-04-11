import express from 'express';
import multer from 'multer';
import { ingestWebhookCall } from '../services/webhookIngestionService.js';
import { log } from '../utils/logger.js';

const upload = multer({ storage: multer.memoryStorage() });

export const webhookRouter = express.Router();

webhookRouter.post('/getcrmdata', upload.single('data'), async (req, res) => {
  try {
    const result = await ingestWebhookCall({ file: req.file, fields: req.body || {} });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    log.warn('Webhook rejected', { error: error?.message || String(error) });
    return res.status(400).json({ ok: false, error: error?.message || 'Bad request' });
  }
});

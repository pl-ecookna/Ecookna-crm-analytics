import express from 'express';
import { mainPool } from '../db/mainDb.js';

const router = express.Router();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildCallFilters = (query) => {
  const clauses = [];
  const values = [];
  let idx = 1;

  const push = (sql, value) => {
    clauses.push(sql.replaceAll('$', `$${idx}`));
    values.push(value);
    idx += 1;
  };

  if (query.employee) push('user_name = $', query.employee);
  if (query.department) push('department = $', query.department);
  if (query.brand) push('brand = $', query.brand);
  if (query.callSuccess) push('call_success = $', query.callSuccess);
  if (query.fileStatus) push('file_status = $', query.fileStatus);

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
};

router.get('/crm/calls', async (req, res) => {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const pageSize = Math.max(toInt(req.query.pageSize, 25), 1);
    const offset = (page - 1) * pageSize;
    const { where, values } = buildCallFilters(req.query);

    const countResult = await mainPool.query(
      `SELECT COUNT(*)::int AS total FROM public.crm_analytics ${where}`,
      values,
    );

    const listResult = await mainPool.query(
      `
      SELECT
        id,
        call_id,
        call_datetime,
        user_name,
        department,
        brand,
        overall_score,
        call_success,
        conversation_duration_minutes,
        call_type,
        file_status,
        client_phone
      FROM public.crm_analytics
      ${where}
      ORDER BY call_datetime DESC NULLS LAST, id DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, pageSize, offset],
    );

    res.json({
      items: listResult.rows,
      total: countResult.rows[0]?.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CRM calls', detail: error.message });
  }
});

router.get('/crm/calls/:id', async (req, res) => {
  try {
    const { rows } = await mainPool.query(
      'SELECT * FROM public.crm_analytics WHERE id = $1 LIMIT 1',
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CRM call', detail: error.message });
  }
});

router.get('/crm/metrics', async (_req, res) => {
  try {
    const { rows } = await mainPool.query(`
      SELECT
        COUNT(*) FILTER (WHERE call_success = 'Успешный')::int AS "successfulCount",
        COUNT(*) FILTER (WHERE call_success = 'Неуспешный')::int AS "failedCount",
        COUNT(*) FILTER (WHERE call_success = 'Средний результат')::int AS "averageResultCount",
        COALESCE(SUM(COALESCE(overall_score, 0)), 0)::int AS "totalScoreSum",
        COUNT(overall_score)::int AS "scoredCount",
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT user_name), NULL), '{}') AS employees,
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT department), NULL), '{}') AS departments,
        COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT brand), NULL), '{}') AS brands
      FROM public.crm_analytics
    `);

    res.json(rows[0] || {
      successfulCount: 0,
      failedCount: 0,
      averageResultCount: 0,
      totalScoreSum: 0,
      scoredCount: 0,
      employees: [],
      departments: [],
      brands: [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CRM metrics', detail: error.message });
  }
});

router.get('/prompts', async (_req, res) => {
  try {
    const { rows } = await mainPool.query(`
      SELECT id, prompt_key, prompt_name, prompt_text, created_at
      FROM public.prompts
      ORDER BY created_at DESC, id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts', detail: error.message });
  }
});

router.patch('/prompts/:id', async (req, res) => {
  try {
    const { prompt_name, prompt_key, prompt_text } = req.body || {};
    const fields = [];
    const values = [];

    if (prompt_name !== undefined) {
      values.push(prompt_name);
      fields.push(`prompt_name = $${values.length}`);
    }
    if (prompt_key !== undefined) {
      values.push(prompt_key);
      fields.push(`prompt_key = $${values.length}`);
    }
    if (prompt_text !== undefined) {
      values.push(prompt_text);
      fields.push(`prompt_text = $${values.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No prompt fields provided' });
    }

    values.push(req.params.id);

    const { rows } = await mainPool.query(
      `
      UPDATE public.prompts
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, prompt_key, prompt_name, prompt_text, created_at
      `,
      values,
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prompt', detail: error.message });
  }
});

router.delete('/prompts/:id', async (req, res) => {
  try {
    const { rowCount } = await mainPool.query(
      'DELETE FROM public.prompts WHERE id = $1',
      [req.params.id],
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prompt', detail: error.message });
  }
});

export { router as apiRouter };

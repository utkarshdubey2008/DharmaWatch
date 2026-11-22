import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthRequest, logAuditEvent } from '../auth.js';

export const complianceRouter = Router();

// GET /api/compliance (Public endpoint)
complianceRouter.get('/', (req, res) => {
  try {
    const reports = db.prepare('SELECT * FROM compliance_reports ORDER BY sort_order DESC, created_at DESC').all();
    res.json(reports);
  } catch (err: any) {
    console.error('[Compliance Routes] Failed to fetch reports:', err);
    res.status(500).json({ error: 'Failed to retrieve compliance reports' });
  }
});

// GET /api/compliance/latest (Public endpoint)
complianceRouter.get('/latest', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM compliance_reports ORDER BY sort_order DESC, created_at DESC LIMIT 1').get();
    if (!report) {
      return res.status(404).json({ error: 'No compliance report found' });
    }
    res.json(report);
  } catch (err: any) {
    console.error('[Compliance Routes] Failed to fetch latest report:', err);
    res.status(500).json({ error: 'Failed to retrieve latest compliance report' });
  }
});

// POST /api/compliance (Admin/Editor only)
complianceRouter.post('/', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  try {
    const { month_year, total_received, resolved, pending, summary, sort_order } = req.body;
    if (!month_year) {
      return res.status(400).json({ error: 'Month and year are required (e.g. November 2026)' });
    }

    const id = `cr-${Date.now()}`;
    const now = new Date().toISOString();
    const finalSortOrder = Number(sort_order) || parseInt(month_year.replace(/\D/g, '') || '0', 10);

    const stmt = db.prepare(`
      INSERT INTO compliance_reports (id, month_year, total_received, resolved, pending, summary, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      String(month_year).trim(),
      Number(total_received) || 0,
      Number(resolved) || 0,
      Number(pending) || 0,
      summary?.trim() || 'No grievances were received during this period.',
      finalSortOrder,
      now,
      now
    );

    logAuditEvent(req, {
      action: 'COMPLIANCE_REPORT_CREATED',
      targetType: 'compliance_report',
      targetId: id,
      targetTitle: `Compliance Report - ${month_year}`,
      details: `Created monthly report: ${month_year}`,
    });

    const created = db.prepare('SELECT * FROM compliance_reports WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[Compliance Routes] Failed to create report:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A report for this month and year already exists.' });
    }
    res.status(500).json({ error: 'Failed to create compliance report' });
  }
});

// PUT /api/compliance/:id (Admin/Editor only)
complianceRouter.put('/:id', authenticateToken, requireRole(['admin', 'editor']), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { month_year, total_received, resolved, pending, summary, sort_order } = req.body;

    const existing = db.prepare('SELECT * FROM compliance_reports WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Compliance report not found' });
    }

    const now = new Date().toISOString();
    const finalMonthYear = month_year ? String(month_year).trim() : existing.month_year;
    const finalSortOrder = sort_order !== undefined ? Number(sort_order) : existing.sort_order;

    const stmt = db.prepare(`
      UPDATE compliance_reports
      SET month_year = ?,
          total_received = ?,
          resolved = ?,
          pending = ?,
          summary = ?,
          sort_order = ?,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      finalMonthYear,
      total_received !== undefined ? Number(total_received) : existing.total_received,
      resolved !== undefined ? Number(resolved) : existing.resolved,
      pending !== undefined ? Number(pending) : existing.pending,
      summary !== undefined ? summary.trim() : existing.summary,
      finalSortOrder,
      now,
      id
    );

    logAuditEvent(req, {
      action: 'COMPLIANCE_REPORT_UPDATED',
      targetType: 'compliance_report',
      targetId: id,
      targetTitle: `Compliance Report - ${finalMonthYear}`,
      details: `Updated report for ${finalMonthYear}: Received=${total_received}, Resolved=${resolved}`,
    });

    const updated = db.prepare('SELECT * FROM compliance_reports WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    console.error('[Compliance Routes] Failed to update report:', err);
    res.status(500).json({ error: 'Failed to update compliance report' });
  }
});

// DELETE /api/compliance/:id (Admin only)
complianceRouter.delete('/:id', authenticateToken, requireRole(['admin']), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM compliance_reports WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Compliance report not found' });
    }

    db.prepare('DELETE FROM compliance_reports WHERE id = ?').run(id);

    logAuditEvent(req, {
      action: 'COMPLIANCE_REPORT_DELETED',
      targetType: 'compliance_report',
      targetId: id,
      targetTitle: `Compliance Report - ${existing.month_year}`,
      details: `Deleted compliance report for ${existing.month_year}`,
    });

    res.json({ success: true, message: 'Compliance report deleted successfully.' });
  } catch (err: any) {
    console.error('[Compliance Routes] Failed to delete report:', err);
    res.status(500).json({ error: 'Failed to delete compliance report' });
  }
});

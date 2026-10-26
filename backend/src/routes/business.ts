import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';
import { BusinessIntelligenceService } from '../services/business/businessIntelligence';

const router = Router();
const db = DatabaseStore.getInstance();
const biService = BusinessIntelligenceService.getInstance();

// GET /api/business/overview
router.get('/overview', (req: Request, res: Response) => {
  const overview = biService.getBusinessOverview();
  res.json(overview);
});

// GET /api/business/cashflow
router.get('/cashflow', (req: Request, res: Response) => {
  const days = req.query.days === '30' ? 30 : 7;
  const forecast = biService.getCashFlowForecast(days);
  res.json({ forecast, days });
});

// POST /api/business/ask (AI CFO Assistant)
router.post('/ask', (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }
  const answer = biService.askCFO(question);
  res.json(answer);
});

// GET /api/business/invoices
router.get('/invoices', (req: Request, res: Response) => {
  const invoices = db.getInvoices();
  res.json({ invoices });
});

// POST /api/business/invoices/:id/remind
router.post('/invoices/:id/remind', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const inv = db.getInvoices().find(i => i.id === id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  inv.reminder_sent_at = new Date().toISOString();
  db.persist();

  db.addAuditLog({
    workspace_id: db.getState().workspaces[1]?.id || db.getState().workspaces[0].id,
    event_id: `REMIND-${Date.now().toString().slice(-6)}`,
    event_type: 'PAYMENT_REMINDER_DISPATCHED',
    agent_code: 'business_agent',
    final_outcome: 'REMINDER_SENT',
    metadata: { invoice: inv.invoice_number, client: inv.client_name, amount: inv.amount }
  });

  res.json({
    success: true,
    message: `PayPal automated reminder dispatched to ${inv.client_name} for invoice ${inv.invoice_number}.`
  });
});

export default router;

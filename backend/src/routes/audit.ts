import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';

const router = Router();
const db = DatabaseStore.getInstance();

// GET /api/audit
router.get('/', (req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  const { eventType, agentCode, search } = req.query;

  let filtered = [...logs];
  if (eventType) {
    filtered = filtered.filter(l => l.event_type.toLowerCase() === String(eventType).toLowerCase());
  }
  if (agentCode) {
    filtered = filtered.filter(l => l.agent_code?.toLowerCase() === String(agentCode).toLowerCase());
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(l => 
      l.event_id.toLowerCase().includes(s) || 
      l.event_type.toLowerCase().includes(s) ||
      (l.intent_reference && l.intent_reference.toLowerCase().includes(s)) ||
      (l.final_outcome && l.final_outcome.toLowerCase().includes(s))
    );
  }

  res.json({ logs: filtered, total: filtered.length });
});

export default router;

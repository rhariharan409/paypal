import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';
import { PayPalService } from '../services/payments/paypalService';

const router = Router();
const db = DatabaseStore.getInstance();
const paypalService = PayPalService.getInstance();

// GET /api/settings
router.get('/', (req: Request, res: Response) => {
  const state = db.getState();
  const isPayPalConfigured = paypalService.isConfigured();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    profile: state.profiles[0],
    workspaces: state.workspaces,
    ai: {
      provider: state.settings.ai_provider || 'gemini',
      model: state.settings.ai_model || 'gemini-1.5-flash',
      isConfigured: hasGeminiKey,
      status: hasGeminiKey ? 'connected' : 'deterministic_demo_mode'
    },
    paypal: {
      mode: process.env.PAYPAL_MODE || 'sandbox',
      isConfigured: isPayPalConfigured,
      status: isPayPalConfigured ? 'live_sandbox_connected' : 'sandbox_test_simulation',
      clientIdMasked: isPayPalConfigured ? `${process.env.PAYPAL_CLIENT_ID?.slice(0, 6)}...${process.env.PAYPAL_CLIENT_ID?.slice(-4)}` : 'Not Configured (Demo Mode Active)'
    },
    database: {
      engine: 'Persistent Local Ledger & Supabase Ready',
      status: 'healthy',
      totalRecords: {
        agents: state.agents.length,
        securityEvents: state.security_events.length,
        paymentRequests: state.payment_requests.length,
        transactions: state.transactions.length,
        auditLogs: state.audit_logs.length
      },
      lastSync: new Date().toISOString()
    }
  });
});

// POST /api/settings/reset-demo
router.post('/reset-demo', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({
    success: true,
    message: 'Demo dataset successfully restored to initial state.'
  });
});

export default router;

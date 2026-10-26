import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';

const router = Router();
const db = DatabaseStore.getInstance();

// POST /api/auth/profile
router.post('/profile', (req: Request, res: Response) => {
  const profile = db.getState().profiles[0];
  const workspaces = db.getState().workspaces;
  res.json({ profile, workspaces });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const profile = db.getState().profiles[0];
  res.json({
    success: true,
    token: 'jwt-aegis-demo-token-verified',
    user: profile,
    workspaces: db.getState().workspaces
  });
});

// POST /api/auth/signup
router.post('/signup', (req: Request, res: Response) => {
  const { full_name, email } = req.body;
  const profile = {
    ...db.getState().profiles[0],
    full_name: full_name || 'Alex Vance',
    email: email || 'alex.vance@aegispay.fintech'
  };
  res.json({
    success: true,
    token: 'jwt-aegis-demo-token-verified',
    user: profile,
    workspaces: db.getState().workspaces
  });
});

// POST /api/auth/onboarding
router.post('/onboarding', (req: Request, res: Response) => {
  const { monthlyBudget, highRiskPolicy, defaultCurrency } = req.body;
  if (monthlyBudget) {
    db.updateFinancialPolicy({
      monthly_spending_limit: parseFloat(monthlyBudget),
      high_risk_policy: highRiskPolicy || 'require_biometric_approval'
    });
  }

  res.json({
    success: true,
    message: 'Onboarding completed. Governance boundaries active.'
  });
});

export default router;

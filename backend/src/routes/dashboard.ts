import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';

const router = Router();
const db = DatabaseStore.getInstance();

// GET /api/dashboard/overview
router.get('/overview', (req: Request, res: Response) => {
  const state = db.getState();
  const policy = state.financial_policies[0];
  const agents = db.getAgents();
  const transactions = state.transactions;
  const securityEvents = state.security_events;
  const paymentRequests = state.payment_requests;

  const completedTx = transactions.filter(t => t.lifecycle_state === 'COMPLETED');
  const totalSpent = completedTx.reduce((sum, t) => sum + t.amount, 0);

  const activeReservations = state.budget_reservations.filter(r => r.status === 'reserved');
  const totalReserved = activeReservations.reduce((sum, r) => sum + r.amount, 0);

  const availableDemoBudget = Math.max(0, policy.monthly_spending_limit - totalSpent - totalReserved);
  const pendingApprovalsCount = paymentRequests.filter(p => p.approval_status === 'pending').length;

  res.json({
    metrics: {
      availableDemoBudget,
      activeAgentsCount: agents.filter(a => a.status === 'active').length,
      totalAgentsCount: agents.length,
      securityThreatsDetected: securityEvents.length,
      pendingApprovals: pendingApprovalsCount,
      completedTransactionsCount: completedTx.length,
      remainingMonthlyBudget: availableDemoBudget,
      totalMonthlyLimit: policy.monthly_spending_limit,
      totalReserved,
      totalSpent
    },
    agents,
    recentAlerts: securityEvents.slice(0, 5),
    recentTransactions: transactions.slice(0, 6),
    emergencyStopActive: policy.emergency_stop_active
  });
});

// GET /api/dashboard/activity
router.get('/activity', (req: Request, res: Response) => {
  const state = db.getState();
  res.json({
    transactions: state.transactions.slice(0, 10),
    securityEvents: state.security_events.slice(0, 10),
    notifications: state.notifications.slice(0, 10)
  });
});

export default router;

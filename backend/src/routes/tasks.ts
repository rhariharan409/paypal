import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';
import { AgentOrchestrator } from '../services/ai/orchestrator';

const router = Router();
const db = DatabaseStore.getInstance();
const orchestrator = AgentOrchestrator.getInstance();

// GET /api/tasks
router.get('/', (req: Request, res: Response) => {
  const tasks = db.getState().agent_tasks;
  res.json({ tasks });
});

// POST /api/tasks/execute-demo (Section 21 Master Demonstration)
router.post('/execute-demo', async (req: Request, res: Response) => {
  const prompt = req.body.prompt || "Find the best programming laptop under $60,000. Only use trustworthy merchants. Do not purchase without my approval.";
  try {
    const result = await orchestrator.executeTaskWorkflow(prompt);
    res.json({
      success: true,
      message: 'Autonomous purchase & security governance workflow executed successfully.',
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/budget-conflict-demo (Section 21 Shared Budget Conflict Demonstration)
router.post('/budget-conflict-demo', async (req: Request, res: Response) => {
  try {
    // Attempt two large concurrent reservations from Shopping Agent and Travel Agent
    const res1 = db.checkAndReserveBudget('shopping_agent', 65000, 'conflict_task_1');
    const res2 = db.checkAndReserveBudget('finance_agent', 50000, 'conflict_task_2');

    res.json({
      success: true,
      conflictScenario: 'Two autonomous agents attempting simultaneous high-value reservations against shared pool',
      agent1_reservation: res1,
      agent2_reservation: res2,
      result: res2.success ? 'Both accommodated' : 'Second reservation blocked due to shared budget exhaustion and atomic lock'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

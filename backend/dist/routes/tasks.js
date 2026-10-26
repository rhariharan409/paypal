"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const orchestrator_1 = require("../services/ai/orchestrator");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
const orchestrator = orchestrator_1.AgentOrchestrator.getInstance();
// GET /api/tasks
router.get('/', (req, res) => {
    const tasks = db.getState().agent_tasks;
    res.json({ tasks });
});
// POST /api/tasks/execute-demo (Section 21 Master Demonstration)
router.post('/execute-demo', async (req, res) => {
    const prompt = req.body.prompt || "Find the best programming laptop under $60,000. Only use trustworthy merchants. Do not purchase without my approval.";
    try {
        const result = await orchestrator.executeTaskWorkflow(prompt);
        res.json({
            success: true,
            message: 'Autonomous purchase & security governance workflow executed successfully.',
            ...result
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST /api/tasks/budget-conflict-demo (Section 21 Shared Budget Conflict Demonstration)
router.post('/budget-conflict-demo', async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;

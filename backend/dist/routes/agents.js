"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
// GET /api/agents
router.get('/', (req, res) => {
    const agents = db.getAgents();
    const state = db.getState();
    const reservations = state.budget_reservations.filter(r => r.status === 'reserved');
    const agentsWithDetails = agents.map(a => {
        const agentReservations = reservations.filter(r => r.agent_id === a.id);
        const reservedAmount = agentReservations.reduce((sum, r) => sum + r.amount, 0);
        return {
            ...a,
            reservedAmount,
            availableSpend: Math.max(0, a.assigned_budget - reservedAmount)
        };
    });
    res.json({ agents: agentsWithDetails });
});
// GET /api/agents/:code
router.get('/:code', (req, res) => {
    const code = String(req.params.code);
    const agent = db.getAgentByCode(code);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    const tasks = db.getState().agent_tasks.filter(t => t.initiating_agent_code === agent.code);
    const securityEvents = db.getSecurityEvents().filter(e => e.agent_code === agent.code);
    res.json({ agent, tasks, securityEvents });
});
// POST /api/agents/:code/pause
router.post('/:code/pause', (req, res) => {
    const code = String(req.params.code);
    const agent = db.updateAgentStatus(code, 'paused');
    if (!agent)
        return res.status(404).json({ error: 'Agent not found' });
    db.addAuditLog({
        workspace_id: db.getState().workspaces[0].id,
        event_id: `AUDIT-PAUSE-${Date.now().toString().slice(-6)}`,
        event_type: 'AGENT_PAUSED',
        agent_code: agent.code,
        final_outcome: 'PAUSED',
        metadata: { agent_name: agent.name }
    });
    res.json({ success: true, agent });
});
// POST /api/agents/:code/resume
router.post('/:code/resume', (req, res) => {
    const code = String(req.params.code);
    const agent = db.updateAgentStatus(code, 'active');
    if (!agent)
        return res.status(404).json({ error: 'Agent not found' });
    db.addAuditLog({
        workspace_id: db.getState().workspaces[0].id,
        event_id: `AUDIT-RESUME-${Date.now().toString().slice(-6)}`,
        event_type: 'AGENT_RESUMED',
        agent_code: agent.code,
        final_outcome: 'ACTIVE',
        metadata: { agent_name: agent.name }
    });
    res.json({ success: true, agent });
});
// POST /api/agents/:code/revoke
router.post('/:code/revoke', (req, res) => {
    const code = String(req.params.code);
    const agent = db.updateAgentStatus(code, 'revoked');
    if (!agent)
        return res.status(404).json({ error: 'Agent not found' });
    db.addAuditLog({
        workspace_id: db.getState().workspaces[0].id,
        event_id: `AUDIT-REVOKE-${Date.now().toString().slice(-6)}`,
        event_type: 'AGENT_PERMISSIONS_REVOKED',
        agent_code: agent.code,
        final_outcome: 'REVOKED',
        metadata: { agent_name: agent.name }
    });
    res.json({ success: true, agent });
});
exports.default = router;

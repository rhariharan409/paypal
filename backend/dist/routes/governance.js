"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const policyEngine_1 = require("../services/governance/policyEngine");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
const policyEngine = policyEngine_1.PolicyEngine.getInstance();
// GET /api/policies
router.get('/', (req, res) => {
    const policy = db.getFinancialPolicy();
    const agents = db.getAgents();
    res.json({ policy, agents });
});
// PATCH /api/policies
router.patch('/', (req, res) => {
    const updated = db.updateFinancialPolicy(req.body);
    res.json({ policy: updated });
});
// POST /api/governance/evaluate
router.post('/evaluate', (req, res) => {
    const { agentCode, category, merchantName, amount, currency, securityDecision, trustScore } = req.body;
    const result = policyEngine.evaluate({
        agentCode: agentCode || 'shopping_agent',
        category: category || 'computers',
        merchantName: merchantName || 'Official TechRetail Direct',
        amount: amount || 54999,
        currency: currency || 'USD',
        securityDecision: securityDecision || 'SAFE',
        trustScore: trustScore || 94
    });
    res.json(result);
});
// POST /api/governance/emergency-stop
router.post('/emergency-stop', (req, res) => {
    const { active } = req.body;
    const state = policyEngine.triggerEmergencyStop(Boolean(active));
    res.json({
        emergencyStopActive: state,
        message: state ? 'EMERGENCY STOP ENGAGED: All autonomous agents locked down.' : 'Normal operations resumed.'
    });
});
// GET /api/governance/budget-ledger
router.get('/budget-ledger', (req, res) => {
    const state = db.getState();
    const policy = state.financial_policies[0];
    const reservations = state.budget_reservations;
    const transactions = state.transactions.filter(t => t.lifecycle_state === 'COMPLETED');
    const totalAllocated = policy.monthly_spending_limit;
    const totalReserved = reservations.filter(r => r.status === 'reserved').reduce((acc, r) => acc + r.amount, 0);
    const totalConsumed = transactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingAvailable = Math.max(0, totalAllocated - totalReserved - totalConsumed);
    res.json({
        totalAllocated,
        totalReserved,
        totalConsumed,
        remainingAvailable,
        activeReservations: reservations.filter(r => r.status === 'reserved'),
        reservationHistory: reservations
    });
});
exports.default = router;

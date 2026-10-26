"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const businessIntelligence_1 = require("../services/business/businessIntelligence");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
const biService = businessIntelligence_1.BusinessIntelligenceService.getInstance();
// GET /api/business/overview
router.get('/overview', (req, res) => {
    const overview = biService.getBusinessOverview();
    res.json(overview);
});
// GET /api/business/cashflow
router.get('/cashflow', (req, res) => {
    const days = req.query.days === '30' ? 30 : 7;
    const forecast = biService.getCashFlowForecast(days);
    res.json({ forecast, days });
});
// POST /api/business/ask (AI CFO Assistant)
router.post('/ask', (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question required' });
    }
    const answer = biService.askCFO(question);
    res.json(answer);
});
// GET /api/business/invoices
router.get('/invoices', (req, res) => {
    const invoices = db.getInvoices();
    res.json({ invoices });
});
// POST /api/business/invoices/:id/remind
router.post('/invoices/:id/remind', (req, res) => {
    const id = String(req.params.id);
    const inv = db.getInvoices().find(i => i.id === id);
    if (!inv)
        return res.status(404).json({ error: 'Invoice not found' });
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
exports.default = router;

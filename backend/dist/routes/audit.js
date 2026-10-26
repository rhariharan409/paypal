"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
// GET /api/audit
router.get('/', (req, res) => {
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
        filtered = filtered.filter(l => l.event_id.toLowerCase().includes(s) ||
            l.event_type.toLowerCase().includes(s) ||
            (l.intent_reference && l.intent_reference.toLowerCase().includes(s)) ||
            (l.final_outcome && l.final_outcome.toLowerCase().includes(s)));
    }
    res.json({ logs: filtered, total: filtered.length });
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
// POST /api/auth/profile
router.post('/profile', (req, res) => {
    const profile = db.getState().profiles[0];
    const workspaces = db.getState().workspaces;
    res.json({ profile, workspaces });
});
// POST /api/auth/login
router.post('/login', (req, res) => {
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
router.post('/signup', (req, res) => {
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
router.post('/onboarding', (req, res) => {
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
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const paypalService_1 = require("../services/payments/paypalService");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
const paypalService = paypalService_1.PayPalService.getInstance();
// GET /api/payments
router.get('/', (req, res) => {
    const requests = db.getPaymentRequests();
    const transactions = db.getTransactions();
    res.json({ requests, transactions, isPayPalConfigured: paypalService.isConfigured() });
});
// GET /api/payments/:id
router.get('/:id', (req, res) => {
    const id = String(req.params.id);
    const request = db.getPaymentRequestById(id);
    if (!request)
        return res.status(404).json({ error: 'Payment request not found' });
    const transaction = db.getTransactions().find(t => t.payment_request_id === request.id);
    res.json({ request, transaction });
});
// POST /api/payments/:id/approve (User Authorizes Payment)
router.post('/:id/approve', async (req, res) => {
    const id = String(req.params.id);
    const request = db.getPaymentRequestById(id);
    if (!request)
        return res.status(404).json({ error: 'Payment request not found' });
    // Check emergency stop
    if (db.getFinancialPolicy().emergency_stop_active) {
        return res.status(403).json({ error: 'EMERGENCY STOP ACTIVE: Cannot authorize payments.' });
    }
    // Check if already completed or approved
    if (request.approval_status === 'completed') {
        return res.status(400).json({ error: 'Payment already completed.' });
    }
    try {
        // 1. Create PayPal Order
        const orderResult = await paypalService.createOrder({
            amount: request.amount,
            currency: request.currency,
            productTitle: request.product_title,
            merchantName: request.merchant_name,
            paymentRequestId: request.id,
            agentCode: request.initiating_agent_code
        });
        if (!orderResult.success) {
            db.updatePaymentRequestStatus(request.id, 'failed');
            return res.status(500).json({ error: orderResult.error || 'PayPal order creation failed' });
        }
        db.updatePaymentRequestStatus(request.id, 'processing', orderResult.orderId);
        // 2. Perform Capture (Either through direct capture flow or webhook)
        const captureResult = await paypalService.captureOrder(orderResult.orderId, request.id);
        res.json({
            success: true,
            approvalStatus: 'completed',
            paypalOrderId: orderResult.orderId,
            paypalCaptureId: captureResult.captureId,
            isSimulatedSandbox: orderResult.isSimulated,
            message: orderResult.isSimulated
                ? 'Payment verified and captured via PayPal Sandbox Test Simulation.'
                : 'Payment successfully captured via PayPal REST API Sandbox.'
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/payments/:id/reject
router.post('/:id/reject', (req, res) => {
    const id = String(req.params.id);
    const request = db.getPaymentRequestById(id);
    if (!request)
        return res.status(404).json({ error: 'Payment request not found' });
    db.updatePaymentRequestStatus(request.id, 'rejected');
    // Release reservation if present
    if (request.reservation_ref) {
        db.releaseReservation(request.reservation_ref);
    }
    db.addAuditLog({
        workspace_id: db.getState().workspaces[0].id,
        event_id: `AUDIT-REJ-${Date.now().toString().slice(-6)}`,
        event_type: 'PAYMENT_AUTHORIZATION_REJECTED',
        agent_code: request.initiating_agent_code,
        intent_reference: request.product_title,
        final_outcome: 'REJECTED_BY_USER',
        metadata: { reason: req.body.reason || 'User manual rejection' }
    });
    res.json({ success: true, message: 'Payment authorization rejected. Reserved budget released.' });
});
// POST /api/paypal/orders
router.post('/orders', async (req, res) => {
    const { amount, currency, productTitle, merchantName, paymentRequestId } = req.body;
    const result = await paypalService.createOrder({
        amount: amount || 100,
        currency: currency || 'USD',
        productTitle: productTitle || 'Item',
        merchantName: merchantName || 'Merchant',
        paymentRequestId: paymentRequestId || `req-${Date.now()}`,
        agentCode: 'shopping_agent'
    });
    res.json(result);
});
// POST /api/paypal/orders/:id/capture
router.post('/orders/:id/capture', async (req, res) => {
    const id = String(req.params.id);
    const result = await paypalService.captureOrder(id, req.body.paymentRequestId || '');
    res.json(result);
});
// POST /api/paypal/webhooks
router.post('/webhooks', (req, res) => {
    console.log('[PayPal Webhook] Received webhook event:', req.body?.event_type);
    res.status(200).json({ received: true });
});
exports.default = router;

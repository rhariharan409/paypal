"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const truthEngine_1 = require("../services/merchant/truthEngine");
const router = (0, express_1.Router)();
const db = store_1.DatabaseStore.getInstance();
const truthEngine = truthEngine_1.PurchaseTruthEngine.getInstance();
// GET /api/trust/catalog
router.get('/catalog', (req, res) => {
    const products = db.getProducts();
    const assessments = db.getMerchantAssessments();
    const enrichedProducts = products.map(p => {
        const assessment = assessments.find(a => a.merchant_name.toLowerCase() === p.merchant_name.toLowerCase())
            || truthEngine.evaluateProductAndMerchant(p);
        return {
            ...p,
            trustAssessment: assessment
        };
    });
    res.json({ products: enrichedProducts });
});
// GET /api/trust/assessments
router.get('/assessments', (req, res) => {
    const assessments = db.getMerchantAssessments();
    res.json({ assessments });
});
// POST /api/trust/assess
router.post('/assess', (req, res) => {
    const { productId, merchantName } = req.body;
    let product = productId ? db.getProductById(productId) : undefined;
    if (!product && merchantName) {
        product = {
            id: `prod-${Date.now()}`,
            title: 'Custom Evaluation Candidate',
            category: 'electronics',
            price: 25000,
            currency: 'USD',
            merchant_name: merchantName,
            specifications: {},
            is_safe_candidate: !merchantName.toLowerCase().includes('shady')
        };
    }
    if (!product) {
        product = db.getProducts()[0];
    }
    const assessment = truthEngine.evaluateProductAndMerchant(product);
    res.json({ assessment, product });
});
exports.default = router;

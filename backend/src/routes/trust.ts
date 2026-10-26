import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store';
import { PurchaseTruthEngine } from '../services/merchant/truthEngine';

const router = Router();
const db = DatabaseStore.getInstance();
const truthEngine = PurchaseTruthEngine.getInstance();

// GET /api/trust/catalog
router.get('/catalog', (req: Request, res: Response) => {
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
router.get('/assessments', (req: Request, res: Response) => {
  const assessments = db.getMerchantAssessments();
  res.json({ assessments });
});

// POST /api/trust/assess
router.post('/assess', (req: Request, res: Response) => {
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

export default router;
